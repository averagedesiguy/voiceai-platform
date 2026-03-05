"""Agent database model."""

import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False, default="You are a helpful AI assistant.")
    voice_id: Mapped[str] = mapped_column(String(100), nullable=True, default="alloy")
    model: Mapped[str] = mapped_column(String(100), default="gpt-4o-mini")
    language: Mapped[str] = mapped_column(String(10), default="en")
    tools: Mapped[dict] = mapped_column(JSON, default=list)
    knowledge_base_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("knowledge_bases.id", ondelete="SET NULL"), nullable=True
    )
    first_message: Mapped[str] = mapped_column(Text, nullable=True, default="Hello! How can I help you today?")
    max_call_duration: Mapped[int] = mapped_column(default=600)  # seconds
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, paused, archived
    total_calls: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="agents")
    calls = relationship("Call", back_populates="agent", cascade="all, delete-orphan")
    knowledge_base = relationship("KnowledgeBase", back_populates="agents")
