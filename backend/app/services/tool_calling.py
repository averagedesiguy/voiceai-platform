"""Tool calling framework — extensible tool execution for AI agents."""

import json
from typing import Any, Callable, Awaitable
from datetime import datetime


# Tool registry
_tools: dict[str, dict] = {}


def register_tool(
    name: str,
    description: str,
    parameters: dict,
    handler: Callable[..., Awaitable[Any]],
):
    """Register a tool that AI agents can call."""
    _tools[name] = {
        "name": name,
        "description": description,
        "parameters": parameters,
        "handler": handler,
    }


def get_tool_definitions() -> list[dict]:
    """Get all tool definitions for LLM function calling."""
    return [
        {
            "name": t["name"],
            "description": t["description"],
            "parameters": t["parameters"],
        }
        for t in _tools.values()
    ]


async def execute_tool(name: str, arguments: dict) -> dict:
    """Execute a registered tool and return the result."""
    if name not in _tools:
        return {"error": f"Tool '{name}' not found", "success": False}

    try:
        result = await _tools[name]["handler"](**arguments)
        return {"result": result, "success": True}
    except Exception as e:
        return {"error": str(e), "success": False}


# ── Built-in tools ──────────────────────────────────────────────

async def _get_current_time(**kwargs) -> str:
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")


async def _check_calendar(date: str = "", **kwargs) -> dict:
    """Demo: Check calendar availability."""
    return {
        "date": date or "today",
        "available_slots": ["09:00", "10:30", "14:00", "15:30"],
        "message": "These time slots are available for booking.",
    }


async def _create_booking(name: str = "", date: str = "", time: str = "", **kwargs) -> dict:
    """Demo: Create a booking."""
    return {
        "booking_id": f"BK-{datetime.utcnow().strftime('%Y%m%d%H%M')}",
        "name": name,
        "date": date,
        "time": time,
        "status": "confirmed",
        "message": f"Booking confirmed for {name} on {date} at {time}.",
    }


async def _send_sms(to: str = "", message: str = "", **kwargs) -> dict:
    """Demo: Send an SMS."""
    return {
        "to": to,
        "message": message,
        "status": "sent",
        "message_id": f"SMS-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
    }


# Register built-in tools
register_tool(
    "get_current_time",
    "Get the current date and time",
    {"type": "object", "properties": {}},
    _get_current_time,
)

register_tool(
    "check_calendar",
    "Check available time slots on a given date",
    {
        "type": "object",
        "properties": {
            "date": {"type": "string", "description": "The date to check (YYYY-MM-DD)"},
        },
    },
    _check_calendar,
)

register_tool(
    "create_booking",
    "Create a new booking/appointment",
    {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Customer name"},
            "date": {"type": "string", "description": "Booking date (YYYY-MM-DD)"},
            "time": {"type": "string", "description": "Booking time (HH:MM)"},
        },
        "required": ["name", "date", "time"],
    },
    _create_booking,
)

register_tool(
    "send_sms",
    "Send an SMS message to a phone number",
    {
        "type": "object",
        "properties": {
            "to": {"type": "string", "description": "Phone number to send to"},
            "message": {"type": "string", "description": "SMS message content"},
        },
        "required": ["to", "message"],
    },
    _send_sms,
)
