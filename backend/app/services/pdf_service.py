import os
import re
import uuid
from pathlib import Path
from typing import List, Dict, Any, Tuple
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from fastapi import UploadFile, HTTPException, status


# Directory configuration for local uploads
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB limit


def clean_page_text(raw_text: str) -> str:
    """Clean extracted page text while preserving paragraph structure.
    
    Removes:
    - Multiple consecutive spaces
    - Excessive blank lines (collapsed to double newlines)
    - Page artifacts / control characters
    - Common header/footer noise (e.g. 'Page X of Y')
    """
    if not raw_text:
        return ""

    # Replace carriage returns & null bytes
    text = raw_text.replace("\r", "\n").replace("\x00", "")

    # Split into lines for line-level cleaning
    lines = text.split("\n")
    cleaned_lines = []

    for line in lines:
        stripped_line = line.strip()

        # Filter out common header/footer page count artifacts
        if re.match(r'^(page\s+\d+(\s+of\s+\d+)?|\d+\s*/\s*\d+)$', stripped_line, re.IGNORECASE):
            continue

        # Replace multiple spaces with a single space
        normalized_line = re.sub(r'[ \t]+', ' ', stripped_line)
        if normalized_line:
            cleaned_lines.append(normalized_line)

    # Join lines with newlines
    cleaned_text = "\n".join(cleaned_lines)

    # Collapse 3 or more consecutive newlines down to 2 newlines (paragraph boundary)
    cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)

    return cleaned_text.strip()


class PDFService:
    @staticmethod
    def validate_and_save_upload(file: UploadFile) -> Tuple[str, str, str]:
        """Validate PDF upload file and save it securely to the uploads directory.
        
        Returns:
            Tuple of (original_filename, stored_filename, full_file_path)
        """
        # Validate filename and extension
        original_filename = file.filename or "uploaded_document.pdf"
        if not original_filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only PDF files (.pdf) are allowed."
            )

        # Validate MIME type if provided
        if file.content_type and "pdf" not in file.content_type.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Content-Type. Expected 'application/pdf'."
            )

        # Read file contents and check size
        try:
            file_bytes = file.file.read()
            if len(file_bytes) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded file is empty (0 bytes)."
                )
            if len(file_bytes) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
                )

            # Generate unique stored filename
            file_uuid = uuid.uuid4().hex[:12]
            sanitized_name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', Path(original_filename).stem)
            stored_filename = f"{sanitized_name}_{file_uuid}.pdf"
            file_path = UPLOADS_DIR / stored_filename

            # Write file to disk
            with open(file_path, "wb") as f:
                f.write(file_bytes)

            return original_filename, stored_filename, str(file_path)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process and save PDF upload: {str(e)}"
            )

    @staticmethod
    def extract_text_page_by_page(file_path: str) -> Tuple[int, List[Dict[str, Any]]]:
        """Use PyMuPDF (fitz) to extract and clean text page by page.
        
        Returns:
            Tuple of (total_pages, list of {"page": int, "text": str})
        """
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"PDF file not found at path: {file_path}"
            )

        try:
            doc = fitz.open(file_path)
            if doc.is_encrypted:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded PDF file is encrypted or password-protected."
                )

            total_pages = len(doc)
            pages_data = []

            for page_num in range(total_pages):
                page = doc.load_page(page_num)
                raw_text = page.get_text("text")
                cleaned_text = clean_page_text(raw_text)

                pages_data.append({
                    "page": page_num + 1,
                    "text": cleaned_text
                })

            doc.close()
            return total_pages, pages_data

        except fitz.FileDataError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded PDF file is corrupted or unreadable."
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error extracting text from PDF: {str(e)}"
            )

    @staticmethod
    def delete_pdf_file_from_disk(file_path: str) -> bool:
        """Safely delete physical file from disk if it exists."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception:
            pass
        return False
