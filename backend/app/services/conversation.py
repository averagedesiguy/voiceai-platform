"""Conversation memory manager — maintains context and history per session."""

from typing import Optional
from datetime import datetime


class ConversationManager:
    """
    Manages conversation state per call/session.
    Maintains message history, summarizes when context grows too large,
    and integrates knowledge base context.
    """

    def __init__(self, max_messages: int = 50, max_tokens_estimate: int = 8000):
        self.max_messages = max_messages
        self.max_tokens_estimate = max_tokens_estimate
        # In-memory store: session_id -> list of messages
        self._sessions: dict[str, dict] = {}

    def create_session(self, session_id: str, system_prompt: str, first_message: str | None = None) -> str:
        """Create a new conversation session."""
        self._sessions[session_id] = {
            "system_prompt": system_prompt,
            "messages": [],
            "summary": None,
            "created_at": datetime.utcnow().isoformat(),
            "turn_count": 0,
        }

        if first_message:
            self.add_message(session_id, "assistant", first_message)

        return session_id

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Add a message to the conversation."""
        if session_id not in self._sessions:
            return

        session = self._sessions[session_id]
        session["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
        })
        session["turn_count"] += 1

        # Trim if too long
        if len(session["messages"]) > self.max_messages:
            self._trim_messages(session_id)

    def get_messages(self, session_id: str) -> list[dict]:
        """Get formatted messages for LLM context."""
        if session_id not in self._sessions:
            return []

        session = self._sessions[session_id]
        messages = []

        # Add summary if exists
        if session["summary"]:
            messages.append({
                "role": "system",
                "content": f"Previous conversation summary: {session['summary']}",
            })

        # Add recent messages
        for msg in session["messages"]:
            messages.append({"role": msg["role"], "content": msg["content"]})

        return messages

    def get_transcript(self, session_id: str) -> str:
        """Get full transcript as text."""
        if session_id not in self._sessions:
            return ""

        lines = []
        for msg in self._sessions[session_id]["messages"]:
            speaker = "AI" if msg["role"] == "assistant" else "User"
            lines.append(f"[{speaker}]: {msg['content']}")

        return "\n".join(lines)

    def get_transcript_json(self, session_id: str) -> list[dict]:
        """Get structured transcript."""
        if session_id not in self._sessions:
            return []
        return self._sessions[session_id]["messages"]

    def inject_context(self, session_id: str, context: str, source: str = "knowledge_base") -> None:
        """Inject RAG or other context into the conversation."""
        if session_id not in self._sessions:
            return

        self._sessions[session_id]["messages"].insert(0, {
            "role": "system",
            "content": f"Relevant context from {source}:\n{context}",
            "timestamp": datetime.utcnow().isoformat(),
        })

    def end_session(self, session_id: str) -> dict | None:
        """End a session and return its data."""
        return self._sessions.pop(session_id, None)

    def _trim_messages(self, session_id: str) -> None:
        """Trim old messages, keeping a summary."""
        session = self._sessions[session_id]
        messages = session["messages"]

        # Keep the last half
        midpoint = len(messages) // 2
        old_messages = messages[:midpoint]
        session["messages"] = messages[midpoint:]

        # Create summary of trimmed messages
        summary_parts = []
        for msg in old_messages:
            speaker = "AI" if msg["role"] == "assistant" else "User"
            summary_parts.append(f"{speaker}: {msg['content'][:100]}")

        old_summary = session.get("summary", "")
        new_summary = old_summary + "\n" + "\n".join(summary_parts) if old_summary else "\n".join(summary_parts)
        session["summary"] = new_summary[-2000:]  # Cap summary length


# Singleton
conversation_manager = ConversationManager()
