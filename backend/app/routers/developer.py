"""Developer API routes — API key management."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.models.api_key import ApiKey
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/developer", tags=["Developer"])


class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    permissions: list[str] = ["read", "write"]


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    permissions: list
    is_active: bool
    last_used: str | None
    created_at: str

    class Config:
        from_attributes = True


@router.post("/api-keys", status_code=status.HTTP_201_CREATED)
async def create_api_key(
    req: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new API key. The full key is only shown once."""
    full_key, prefix, key_hash = ApiKey.generate_key()

    api_key = ApiKey(
        user_id=current_user.id,
        name=req.name,
        key_prefix=prefix,
        key_hash=key_hash,
        permissions=req.permissions,
    )
    db.add(api_key)
    await db.flush()
    await db.refresh(api_key)

    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": full_key,  # Only shown once!
        "key_prefix": api_key.key_prefix,
        "permissions": api_key.permissions,
        "created_at": str(api_key.created_at),
        "message": "Save this key now — it will not be shown again.",
    }


@router.get("/api-keys")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all API keys (shows prefix only)."""
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()
    return [
        {
            "id": k.id,
            "name": k.name,
            "key_prefix": k.key_prefix,
            "permissions": k.permissions,
            "is_active": k.is_active,
            "last_used": str(k.last_used) if k.last_used else None,
            "created_at": str(k.created_at),
        }
        for k in keys
    ]


@router.delete("/api-keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Revoke an API key."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    await db.delete(key)
