"""Call Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CallCreate(BaseModel):
    agent_id: str
    phone_number: Optional[str] = None
    direction: str = "outbound"
    metadata: Optional[dict] = None


class CallResponse(BaseModel):
    id: str
    agent_id: str
    phone_number: Optional[str]
    direction: str
    status: str
    duration: int
    transcript: Optional[str]
    recording_url: Optional[str]
    sentiment: Optional[str]
    sentiment_score: Optional[float]
    cost: float
    latency_avg_ms: Optional[int]
    tokens_used: int
    error_message: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class CallListResponse(BaseModel):
    id: str
    agent_id: str
    phone_number: Optional[str]
    direction: str
    status: str
    duration: int
    sentiment: Optional[str]
    cost: float
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True
