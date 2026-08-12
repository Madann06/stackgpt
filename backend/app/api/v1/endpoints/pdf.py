from typing import Any, List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentDetailResponse, PageText
from app.services.pdf_service import PDFService

router = APIRouter()


@router.post("/upload", response_model=DocumentDetailResponse, status_code=status.HTTP_201_CREATED)
def upload_pdf_document(
    file: UploadFile = File(..., description="Financial annual report PDF file to upload and process"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Upload a financial annual report PDF, extract cleaned page text, and store metadata."""
    # Step 1: Validate file & save to uploads directory
    original_filename, stored_filename, file_path = PDFService.validate_and_save_upload(file)

    try:
        # Step 2: Extract & clean text using PyMuPDF (fitz)
        total_pages, pages_data = PDFService.extract_text_page_by_page(file_path)

        # Step 3: Store metadata in database
        doc_record = Document(
            user_id=current_user.id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            total_pages=total_pages
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        # Step 4: Construct structured response
        extracted_text = [PageText(page=p["page"], text=p["text"]) for p in pages_data]

        return {
            "id": doc_record.id,
            "user_id": doc_record.user_id,
            "original_filename": doc_record.original_filename,
            "stored_filename": doc_record.stored_filename,
            "file_path": doc_record.file_path,
            "total_pages": doc_record.total_pages,
            "uploaded_at": doc_record.uploaded_at,
            "extracted_text": extracted_text
        }

    except Exception as e:
        # Clean up file on failure
        PDFService.delete_pdf_file_from_disk(file_path)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing uploaded PDF: {str(e)}"
        )


@router.get("/list", response_model=List[DocumentResponse])
def list_user_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List all uploaded PDF documents for the current user."""
    documents = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc()).all()
    return documents


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document_details(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Fetch PDF document metadata and page-by-page extracted text by document ID."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    # Re-extract page text from stored file
    _, pages_data = PDFService.extract_text_page_by_page(doc.file_path)
    extracted_text = [PageText(page=p["page"], text=p["text"]) for p in pages_data]

    return {
        "id": doc.id,
        "user_id": doc.user_id,
        "original_filename": doc.original_filename,
        "stored_filename": doc.stored_filename,
        "file_path": doc.file_path,
        "total_pages": doc.total_pages,
        "uploaded_at": doc.uploaded_at,
        "extracted_text": extracted_text
    }


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete PDF document metadata from database and delete file from disk."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found."
        )

    # Delete physical file from disk
    PDFService.delete_pdf_file_from_disk(doc.file_path)

    # Delete database record
    db.delete(doc)
    db.commit()

    return {
        "message": f"Document '{doc.original_filename}' (ID: {document_id}) deleted successfully."
    }
