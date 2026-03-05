"""Call management routes — initiate, list, get, transcript, recording."""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.call import Call
from app.schemas.call import CallCreate, CallResponse, CallListResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/calls", tags=["Calls"])


@router.post("", response_model=CallResponse, status_code=status.HTTP_201_CREATED)
async def initiate_call(
    req: CallCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initiate a new AI phone call."""
    # Verify agent belongs to user
    result = await db.execute(
        select(Agent).where(Agent.id == req.agent_id, Agent.user_id == current_user.id)
    )
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.status != "active":
        raise HTTPException(status_code=400, detail="Agent is not active")

    # Create call record
    call = Call(
        agent_id=req.agent_id,
        phone_number=req.phone_number,
        direction=req.direction,
        status="queued",
        metadata_json=req.metadata,
    )
    db.add(call)

    # Increment agent call count
    agent.total_calls += 1

    await db.flush()
    await db.refresh(call)

    # In production, this would trigger the telephony service
    # For now, we simulate by setting status to 'queued'

    return call


@router.get("", response_model=list[CallListResponse])
async def list_calls(
    agent_id: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all calls for the current user's agents."""
    query = (
        select(Call)
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id)
    )
    if agent_id:
        query = query.where(Call.agent_id == agent_id)
    if status_filter:
        query = query.where(Call.status == status_filter)
    query = query.order_by(Call.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
    call_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific call."""
    result = await db.execute(
        select(Call)
        .join(Agent, Call.agent_id == Agent.id)
        .where(Call.id == call_id, Agent.user_id == current_user.id)
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.get("/{call_id}/transcript")
async def get_transcript(
    call_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the transcript for a specific call."""
    result = await db.execute(
        select(Call)
        .join(Agent, Call.agent_id == Agent.id)
        .where(Call.id == call_id, Agent.user_id == current_user.id)
    )
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return {
        "call_id": call.id,
        "transcript": call.transcript,
        "transcript_json": call.transcript_json,
    }
