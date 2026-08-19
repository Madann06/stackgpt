import os
import re
import json
import math
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional
import requests
from fastapi import HTTPException, status

# Directory setup for persistent document chunk storage
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CHROMA_DB_DIR = BASE_DIR / "chroma_db"
CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)
CHUNKS_FILE = CHROMA_DB_DIR / "financial_chunks.json"


def recursive_character_split(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """Pure-Python high performance text chunker without heavy LangChain dependencies."""
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunk = text[start:].strip()
            if chunk:
                chunks.append(chunk)
            break

        # Break preferentially at paragraph, then sentence, then word
        split_pos = text.rfind("\n\n", start, end)
        if split_pos == -1 or split_pos <= start:
            split_pos = text.rfind("\n", start, end)
        if split_pos == -1 or split_pos <= start:
            split_pos = text.rfind(". ", start, end)
            if split_pos != -1:
                split_pos += 1
        if split_pos == -1 or split_pos <= start:
            split_pos = text.rfind(" ", start, end)
        if split_pos == -1 or split_pos <= start:
            split_pos = end

        chunk = text[start:split_pos].strip()
        if chunk:
            chunks.append(chunk)
        start = max(split_pos, start + chunk_size - chunk_overlap)

    return chunks


def compute_tf_vector(text: str) -> Dict[str, float]:
    """Compute term frequency vector for token similarity."""
    tokens = re.findall(r'\w+', text.lower())
    if not tokens:
        return {}
    tf = {}
    for t in tokens:
        tf[t] = tf.get(t, 0.0) + 1.0
    total = len(tokens)
    return {k: v / total for k, v in tf.items()}


def cosine_similarity_tf(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    """Compute cosine similarity between two term frequency dictionaries."""
    intersection = set(v1.keys()) & set(v2.keys())
    if not intersection:
        return 0.0
    dot_product = sum(v1[k] * v2[k] for k in intersection)
    mag1 = math.sqrt(sum(v ** 2 for v in v1.values()))
    mag2 = math.sqrt(sum(v ** 2 for v in v2.values()))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product / (mag1 * mag2)


def get_openai_embeddings(texts: List[str], api_key: str) -> Optional[List[List[float]]]:
    """Fetch cloud embeddings from OpenAI API text-embedding-3-small (0 MB local RAM)."""
    try:
        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "text-embedding-3-small",
            "input": texts[:20]  # batch limit
        }
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return [item["embedding"] for item in data.get("data", [])]
    except Exception:
        pass
    return None


def vector_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two dense embedding vectors."""
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a in vec1))
    mag2 = math.sqrt(sum(b * b for b in vec2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot / (mag1 * mag2)


def _load_chunks_db() -> List[Dict[str, Any]]:
    if not CHUNKS_FILE.exists():
        return []
    try:
        with open(CHUNKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save_chunks_db(chunks: List[Dict[str, Any]]) -> None:
    try:
        with open(CHUNKS_FILE, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[RAG Storage Warning] Could not write chunks file: {e}")


class RAGService:
    @staticmethod
    def chunk_and_index_document(
        document_id: int,
        filename: str,
        pages_data: List[Dict[str, Any]]
    ) -> int:
        """Chunk page text and store in lightweight document store."""
        if not pages_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No page text content found in document to index."
            )

        openai_api_key = os.getenv("OPENAI_API_KEY")
        new_chunks = []
        chunk_counter = 0

        for page in pages_data:
            page_num = page["page"]
            page_text = page["text"]

            if not page_text or not page_text.strip():
                continue

            chunks = recursive_character_split(page_text, chunk_size=1000, chunk_overlap=200)

            for chunk_content in chunks:
                chunk_counter += 1
                chunk_id = f"doc_{document_id}_p{page_num}_c{chunk_counter}_{uuid.uuid4().hex[:6]}"

                new_chunks.append({
                    "chunk_id": chunk_id,
                    "document_id": document_id,
                    "filename": filename,
                    "page_number": page_num,
                    "content": chunk_content,
                    "embedding": None
                })

        if not new_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to generate text chunks from document pages."
            )

        # Generate OpenAI embeddings if API key is provided
        if openai_api_key and openai_api_key.startswith("sk-"):
            texts_to_embed = [c["content"] for c in new_chunks]
            embeddings = get_openai_embeddings(texts_to_embed, openai_api_key)
            if embeddings:
                for chunk_item, emb in zip(new_chunks, embeddings):
                    chunk_item["embedding"] = emb

        # Load existing DB, remove old chunks for this document, and append new
        all_chunks = _load_chunks_db()
        filtered = [c for c in all_chunks if c.get("document_id") != document_id]
        filtered.extend(new_chunks)
        _save_chunks_db(filtered)

        return len(new_chunks)

    @staticmethod
    def search_similarity(
        query: str,
        top_k: int = 5,
        document_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Perform semantic similarity search using dense vectors or term matching."""
        all_chunks = _load_chunks_db()
        if not all_chunks:
            return []

        if document_id is not None:
            candidates = [c for c in all_chunks if c.get("document_id") == document_id]
        else:
            candidates = all_chunks

        if not candidates:
            return []

        openai_api_key = os.getenv("OPENAI_API_KEY")
        scored_results = []

        # Try dense vector search with OpenAI embeddings
        query_embedding = None
        if openai_api_key and openai_api_key.startswith("sk-"):
            query_embs = get_openai_embeddings([query], openai_api_key)
            if query_embs:
                query_embedding = query_embs[0]

        if query_embedding:
            for c in candidates:
                if c.get("embedding"):
                    score = vector_cosine_similarity(query_embedding, c["embedding"])
                else:
                    # Fallback to TF-IDF
                    score = cosine_similarity_tf(compute_tf_vector(query), compute_tf_vector(c["content"]))
                scored_results.append((score, c))
        else:
            query_tf = compute_tf_vector(query)
            for c in candidates:
                score = cosine_similarity_tf(query_tf, compute_tf_vector(c["content"]))
                # Add partial string match bonus
                if query.lower() in c["content"].lower():
                    score += 0.2
                scored_results.append((score, c))

        # Sort descending by similarity score
        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_results[:top_k]

        formatted = []
        for score, meta in top_results:
            formatted.append({
                "chunk_id": meta.get("chunk_id", ""),
                "document_id": meta.get("document_id", 0),
                "filename": meta.get("filename", ""),
                "page_number": meta.get("page_number", 1),
                "content": meta.get("content", ""),
                "score": round(float(score), 4)
            })

        return formatted

    @staticmethod
    def delete_document_embeddings(document_id: int) -> bool:
        """Delete all chunk embeddings associated with a document_id."""
        try:
            all_chunks = _load_chunks_db()
            filtered = [c for c in all_chunks if c.get("document_id") != document_id]
            _save_chunks_db(filtered)
            return True
        except Exception:
            return False

    @staticmethod
    def build_rag_prompt(query: str, context_chunks: List[Dict[str, Any]]) -> str:
        """Construct strict RAG prompt containing context, question, and instructions."""
        if not context_chunks:
            context_text = "No relevant context found."
        else:
            context_blocks = []
            for idx, item in enumerate(context_chunks, 1):
                block = f"[Source {idx} | File: {item['filename']} | Page {item['page_number']}]\n{item['content']}"
                context_blocks.append(block)
            context_text = "\n\n".join(context_blocks)

        prompt_template = f"""====================================================
RETRIEVED FINANCIAL CONTEXT:
====================================================
{context_text}

====================================================
USER QUESTION:
====================================================
{query}

====================================================
INSTRUCTIONS:
- Answer ONLY using the retrieved context above.
- Do not invent, extrapolate, or assume information outside of this context.
- If the answer is unavailable in the retrieved context, respond exactly with:
  "The uploaded report does not contain this information."
====================================================="""
        return prompt_template
