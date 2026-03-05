"""Workflow Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    flow_data: dict = {}


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    flow_data: Optional[dict] = None
    status: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    flow_data: dict
    status: str
    version: int
    executions: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowExecuteRequest(BaseModel):
    input_text: str
    variables: Optional[dict] = None


class WorkflowExecuteResponse(BaseModel):
    workflow_id: str
    execution_id: str
    output: str
    steps_executed: list[dict]
    duration_ms: int
