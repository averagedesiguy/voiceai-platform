"""Call database model."""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Float, Integer, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Call(Base):
    __tablename__ = "calls"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    phone_number: Mapped[str] = mapped_column(String(20), nullable=True)
    direction: Mapped[str] = mapped_column(String(10), default="outbound")  # inbound, outbound
    status: Mapped[str] = mapped_column(String(20), default="queued")  # queued, ringing, in-progress, completed, failed
    duration: Mapped[int] = mapped_column(Integer, default=0)  # seconds
    transcript: Mapped[str] = mapped_column(Text, nullable=True)
    transcript_json: Mapped[dict] = mapped_column(JSON, nullable=True)  # structured transcript
    recording_url: Mapped[str] = mapped_column(String(500), nullable=True)
    sentiment: Mapped[str] = mapped_column(String(20), nullable=True)  # positive, neutral, negative
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=True)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    latency_avg_ms: Mapped[int] = mapped_column(Integer, nullable=True)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    agent = relationship("Agent", back_populates="calls")
