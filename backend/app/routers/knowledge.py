"""Knowledge base routes — CRUD, upload, search."""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.models.knowledge import KnowledgeBase, Document
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


class KBCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class KBResponse(BaseModel):
    id: str
    name: str
    description: str | None
    document_count: int
    total_chunks: int
    status: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    status: str
    created_at: str

    class Config:
        from_attributes = True


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_knowledge_base(
    req: KBCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new knowledge base."""
    kb = KnowledgeBase(
        user_id=current_user.id,
        name=req.name,
        description=req.description,
    )
    db.add(kb)
    await db.flush()
    await db.refresh(kb)
    return {
        "id": kb.id,
        "name": kb.name,
        "description": kb.description,
        "document_count": kb.document_count,
        "total_chunks": kb.total_chunks,
        "status": kb.status,
        "created_at": str(kb.created_at),
    }


@router.get("")
async def list_knowledge_bases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all knowledge bases."""
    result = await db.execute(
        select(KnowledgeBase)
        .where(KnowledgeBase.user_id == current_user.id)
        .order_by(KnowledgeBase.created_at.desc())
    )
    kbs = result.scalars().all()
    return [
        {
            "id": kb.id,
            "name": kb.name,
            "description": kb.description,
            "document_count": kb.document_count,
            "total_chunks": kb.total_chunks,
            "status": kb.status,
            "created_at": str(kb.created_at),
            "updated_at": str(kb.updated_at),
        }
        for kb in kbs
    ]


@router.post("/{kb_id}/upload")
async def upload_document(
    kb_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document to a knowledge base."""
    # Verify KB belongs to user
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id, KnowledgeBase.user_id == current_user.id
        )
    )
    kb = result.scalar_one_or_none()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    # Validate file type
    allowed_types = {"pdf", "docx", "txt", "md", "csv"}
    extension = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
    if extension not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}",
        )

    # Read file content
    content = await file.read()
    file_size = len(content)

    # Create document record
    doc = Document(
        knowledge_base_id=kb_id,
        filename=file.filename or "unnamed",
        file_type=extension,
        file_size=file_size,
        status="processing",
    )
    db.add(doc)
    kb.document_count += 1
    await db.flush()
    await db.refresh(doc)

    # In production, this would trigger async processing:
    # 1. Extract text from document
    # 2. Chunk the text
    # 3. Generate embeddings
    # 4. Store in vector DB
    # For now, mark as ready
    doc.status = "ready"
    doc.chunk_count = max(1, file_size // 500)  # Estimate
    kb.total_chunks += doc.chunk_count

    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "file_size": doc.file_size,
        "chunk_count": doc.chunk_count,
        "status": doc.status,
    }


@router.get("/{kb_id}/search")
async def search_knowledge_base(
    kb_id: str,
    query: str = Query(..., min_length=1),
    top_k: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search a knowledge base with a query."""
    # Verify KB belongs to user
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id, KnowledgeBase.user_id == current_user.id
        )
    )
    kb = result.scalar_one_or_none()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")

    # In production, this would:
    # 1. Embed the query
    # 2. Search vector DB
    # 3. Return ranked results
    return {
        "query": query,
        "results": [],
        "total": 0,
        "message": "Vector search will be available when embedding service is configured",
    }
