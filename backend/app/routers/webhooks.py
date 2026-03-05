"""Webhook management routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

# In-memory webhook storage for MVP (would be a DB table in production)
_webhooks: dict[str, list[dict]] = {}


class WebhookCreate(BaseModel):
    url: str = Field(..., min_length=10)
    events: list[str] = ["call.started", "call.ended", "message.received"]
    secret: str | None = None


@router.post("", status_code=status.HTTP_201_CREATED)
async def register_webhook(
    req: WebhookCreate,
    current_user: User = Depends(get_current_user),
):
    """Register a webhook URL to receive events."""
    import uuid

    webhook = {
        "id": str(uuid.uuid4()),
        "url": req.url,
        "events": req.events,
        "secret": req.secret,
        "is_active": True,
    }

    if current_user.id not in _webhooks:
        _webhooks[current_user.id] = []
    _webhooks[current_user.id].append(webhook)

    return webhook


@router.get("")
async def list_webhooks(current_user: User = Depends(get_current_user)):
    """List all registered webhooks."""
    return _webhooks.get(current_user.id, [])


@router.delete("/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_webhook(
    webhook_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a webhook."""
    hooks = _webhooks.get(current_user.id, [])
    _webhooks[current_user.id] = [h for h in hooks if h["id"] != webhook_id]
