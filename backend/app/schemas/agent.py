"""Agent Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    system_prompt: str = "You are a helpful AI assistant."
    voice_id: str = "alloy"
    model: str = "gpt-4o-mini"
    language: str = "en"
    tools: list[dict] = []
    knowledge_base_id: Optional[str] = None
    first_message: str = "Hello! How can I help you today?"
    max_call_duration: int = 600


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    voice_id: Optional[str] = None
    model: Optional[str] = None
    language: Optional[str] = None
    tools: Optional[list[dict]] = None
    knowledge_base_id: Optional[str] = None
    first_message: Optional[str] = None
    max_call_duration: Optional[int] = None
    status: Optional[str] = None


class AgentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    system_prompt: str
    voice_id: str
    model: str
    language: str
    tools: list[dict]
    knowledge_base_id: Optional[str]
    first_message: Optional[str]
    max_call_duration: int
    status: str
    total_calls: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
