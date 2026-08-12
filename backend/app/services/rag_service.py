import os
import re
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from fastapi import HTTPException, status

# Directory setup for persistent ChromaDB storage
BASE_DIR = Path(__file__).resolve().parent.parent.parent
CHROMA_DB_DIR = BASE_DIR / "chroma_db"
CHROMA_DB_DIR.mkdir(parents=True, exist_ok=True)

# Main Collection Name
COLLECTION_NAME = "financial_reports"

_chroma_client = None
_collection = None


def get_chroma_collection():
    """Lazily initialize ChromaDB client and collection."""
    global _chroma_client, _collection
    if _collection is not None:
        return _collection

    _chroma_client = chromadb.PersistentClient(
        path=str(CHROMA_DB_DIR),
        settings=ChromaSettings(allow_reset=True, anonymized_telemetry=False)
    )

    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key and openai_api_key.startswith("sk-"):
        try:
            from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
            embedding_fn = OpenAIEmbeddingFunction(
                api_key=openai_api_key,
                model_name="text-embedding-3-small"
            )
            _collection = _chroma_client.get_or_create_collection(
                name=COLLECTION_NAME,
                embedding_function=embedding_fn,
                metadata={"hnsw:space": "cosine"}
            )
            return _collection
        except Exception:
            pass

    # Fallback to SentenceTransformer embedding model
    try:
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
        embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    except Exception:
        from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
        embedding_fn = DefaultEmbeddingFunction()

    _collection = _chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )
    return _collection


class RAGService:
    @staticmethod
    def chunk_and_index_document(
        document_id: int,
        filename: str,
        pages_data: List[Dict[str, Any]]
    ) -> int:
        """Chunk page text using RecursiveCharacterTextSplitter and store in ChromaDB with metadata."""
        if not pages_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No page text content found in document to index."
            )

        collection = get_chroma_collection()

        # Initialize RecursiveCharacterTextSplitter (1000 char size, 200 char overlap)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )

        ids = []
        documents = []
        metadatas = []

        chunk_counter = 0

        for page in pages_data:
            page_num = page["page"]
            page_text = page["text"]

            if not page_text or not page_text.strip():
                continue

            # Split page into chunks
            chunks = text_splitter.split_text(page_text)

            for idx, chunk_content in enumerate(chunks):
                chunk_counter += 1
                chunk_id = f"doc_{document_id}_p{page_num}_c{chunk_counter}_{uuid.uuid4().hex[:6]}"

                ids.append(chunk_id)
                documents.append(chunk_content)
                metadatas.append({
                    "document_id": document_id,
                    "filename": filename,
                    "page_number": page_num,
                    "chunk_id": chunk_id
                })

        if not documents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to generate text chunks from document pages."
            )

        # Delete any pre-existing chunks for this document before re-indexing
        RAGService.delete_document_embeddings(document_id)

        # Add chunks & metadata to ChromaDB
        collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

        return len(documents)

    @staticmethod
    def search_similarity(
        query: str,
        top_k: int = 5,
        document_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Perform semantic similarity search in ChromaDB vector database."""
        collection = get_chroma_collection()

        where_filter = {}
        if document_id is not None:
            where_filter = {"document_id": document_id}

        try:
            results = collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_filter if where_filter else None,
                include=["documents", "metadatas", "distances"]
            )

            formatted_results = []
            if results and results.get("documents") and results["documents"][0]:
                docs = results["documents"][0]
                metas = results["metadatas"][0]
                distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

                for doc_text, meta, dist in zip(docs, metas, distances):
                    # Cosine distance to similarity conversion
                    similarity_score = round(1.0 - float(dist), 4) if dist is not None else 1.0

                    formatted_results.append({
                        "chunk_id": meta.get("chunk_id", ""),
                        "document_id": meta.get("document_id", 0),
                        "filename": meta.get("filename", ""),
                        "page_number": meta.get("page_number", 1),
                        "content": doc_text,
                        "score": similarity_score
                    })

            return formatted_results

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error querying vector database: {str(e)}"
            )

    @staticmethod
    def delete_document_embeddings(document_id: int) -> bool:
        """Delete all chunk embeddings associated with a document_id from ChromaDB."""
        try:
            collection = get_chroma_collection()
            collection.delete(where={"document_id": document_id})
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
