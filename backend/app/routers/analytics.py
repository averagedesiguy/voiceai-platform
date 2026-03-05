"""Analytics routes — dashboard metrics."""

from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.agent import Agent
from app.models.call import Call
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard overview metrics."""
    # Total agents
    agent_count = await db.execute(
        select(func.count(Agent.id)).where(Agent.user_id == current_user.id)
    )
    total_agents = agent_count.scalar() or 0

    # Active agents
    active_agents = await db.execute(
        select(func.count(Agent.id)).where(
            Agent.user_id == current_user.id, Agent.status == "active"
        )
    )
    active_agent_count = active_agents.scalar() or 0

    # Total calls
    call_count = await db.execute(
        select(func.count(Call.id))
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id)
    )
    total_calls = call_count.scalar() or 0

    # Total cost
    cost_sum = await db.execute(
        select(func.sum(Call.cost))
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id)
    )
    total_cost = cost_sum.scalar() or 0.0

    # Average call duration
    avg_duration = await db.execute(
        select(func.avg(Call.duration))
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id, Call.status == "completed")
    )
    avg_call_duration = round(avg_duration.scalar() or 0, 1)

    # Average latency
    avg_lat = await db.execute(
        select(func.avg(Call.latency_avg_ms))
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id, Call.latency_avg_ms.isnot(None))
    )
    avg_latency = round(avg_lat.scalar() or 0, 1)

    return {
        "total_agents": total_agents,
        "active_agents": active_agent_count,
        "total_calls": total_calls,
        "total_cost": round(total_cost, 2),
        "avg_call_duration_seconds": avg_call_duration,
        "avg_latency_ms": avg_latency,
    }


@router.get("/calls")
async def get_call_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get call analytics over time."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Calls per status
    status_counts = await db.execute(
        select(Call.status, func.count(Call.id))
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id, Call.created_at >= since)
        .group_by(Call.status)
    )
    by_status = {status: count for status, count in status_counts.all()}

    # Sentiment breakdown
    sentiment_counts = await db.execute(
        select(Call.sentiment, func.count(Call.id))
        .join(Agent, Call.agent_id == Agent.id)
        .where(
            Agent.user_id == current_user.id,
            Call.created_at >= since,
            Call.sentiment.isnot(None),
        )
        .group_by(Call.sentiment)
    )
    by_sentiment = {s: c for s, c in sentiment_counts.all()}

    # Total tokens
    token_sum = await db.execute(
        select(func.sum(Call.tokens_used))
        .join(Agent, Call.agent_id == Agent.id)
        .where(Agent.user_id == current_user.id, Call.created_at >= since)
    )
    total_tokens = token_sum.scalar() or 0

    return {
        "period_days": days,
        "by_status": by_status,
        "by_sentiment": by_sentiment,
        "total_tokens": total_tokens,
    }
