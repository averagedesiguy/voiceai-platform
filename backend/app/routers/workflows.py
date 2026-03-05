"""Workflow management and execution routes."""

import time
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.workflow import Workflow
from app.schemas.workflow import (
    WorkflowCreate, WorkflowUpdate, WorkflowResponse,
    WorkflowExecuteRequest, WorkflowExecuteResponse,
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    req: WorkflowCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new conversation workflow."""
    workflow = Workflow(
        user_id=current_user.id,
        name=req.name,
        description=req.description,
        flow_data=req.flow_data,
    )
    db.add(workflow)
    await db.flush()
    await db.refresh(workflow)
    return workflow


@router.get("", response_model=list[WorkflowResponse])
async def list_workflows(
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all workflows."""
    query = select(Workflow).where(Workflow.user_id == current_user.id)
    if status_filter:
        query = query.where(Workflow.status == status_filter)
    query = query.order_by(Workflow.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific workflow."""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id, Workflow.user_id == current_user.id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    req: WorkflowUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a workflow."""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id, Workflow.user_id == current_user.id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workflow, field, value)
    workflow.version += 1

    await db.flush()
    await db.refresh(workflow)
    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a workflow."""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id, Workflow.user_id == current_user.id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    await db.delete(workflow)


@router.post("/{workflow_id}/execute", response_model=WorkflowExecuteResponse)
async def execute_workflow(
    workflow_id: str,
    req: WorkflowExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Execute a workflow with the given input."""
    result = await db.execute(
        select(Workflow).where(
            Workflow.id == workflow_id, Workflow.user_id == current_user.id
        )
    )
    workflow = result.scalar_one_or_none()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    if workflow.status != "active":
        raise HTTPException(status_code=400, detail="Workflow is not active")

    # Execute the flow using the workflow engine
    from app.services.workflow_engine import WorkflowEngine

    start_time = time.time()
    engine = WorkflowEngine()
    result_data = await engine.execute(workflow.flow_data, req.input_text, req.variables or {})
    duration_ms = int((time.time() - start_time) * 1000)

    # Update execution count
    workflow.executions += 1
    await db.flush()

    return WorkflowExecuteResponse(
        workflow_id=workflow.id,
        execution_id=str(uuid.uuid4()),
        output=result_data["output"],
        steps_executed=result_data["steps"],
        duration_ms=duration_ms,
    )
