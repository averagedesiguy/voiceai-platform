"""AI Conversation Engine — LLM orchestration with streaming, tool calling, and multi-provider support."""

import json
from typing import AsyncGenerator, Optional
from app.config import settings


class AIEngine:
    """
    LLM orchestration engine supporting OpenAI and Anthropic.
    Handles streaming responses, system prompts, and tool calling.
    """

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self._init_clients()

    def _init_clients(self):
        """Initialize available AI provider clients."""
        if settings.OPENAI_API_KEY:
            try:
                from openai import AsyncOpenAI
                self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception:
                pass

        if settings.ANTHROPIC_API_KEY:
            try:
                from anthropic import AsyncAnthropic
                self.anthropic_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception:
                pass

    async def chat(
        self,
        messages: list[dict],
        model: str = "gpt-4o-mini",
        system_prompt: str = "You are a helpful AI assistant.",
        tools: list[dict] | None = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> dict:
        """
        Send a chat completion request.
        Returns: {"content": str, "tool_calls": list, "tokens": int}
        """
        # Determine provider from model name
        if model.startswith("claude"):
            return await self._anthropic_chat(messages, model, system_prompt, tools, temperature, max_tokens)
        else:
            return await self._openai_chat(messages, model, system_prompt, tools, temperature, max_tokens)

    async def chat_stream(
        self,
        messages: list[dict],
        model: str = "gpt-4o-mini",
        system_prompt: str = "You are a helpful AI assistant.",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncGenerator[str, None]:
        """Stream a chat completion response token by token."""
        if model.startswith("claude") and self.anthropic_client:
            async for chunk in self._anthropic_stream(messages, model, system_prompt, temperature, max_tokens):
                yield chunk
        elif self.openai_client:
            async for chunk in self._openai_stream(messages, model, system_prompt, temperature, max_tokens):
                yield chunk
        else:
            yield "AI service not configured. Please add an API key in settings."

    async def _openai_chat(self, messages, model, system_prompt, tools, temperature, max_tokens) -> dict:
        """OpenAI chat completion."""
        if not self.openai_client:
            return {"content": "OpenAI not configured. Add OPENAI_API_KEY to .env", "tool_calls": [], "tokens": 0}

        full_messages = [{"role": "system", "content": system_prompt}] + messages

        kwargs = {
            "model": model,
            "messages": full_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if tools:
            kwargs["tools"] = self._format_openai_tools(tools)

        response = await self.openai_client.chat.completions.create(**kwargs)
        choice = response.choices[0]

        tool_calls = []
        if choice.message.tool_calls:
            for tc in choice.message.tool_calls:
                tool_calls.append({
                    "id": tc.id,
                    "name": tc.function.name,
                    "arguments": json.loads(tc.function.arguments),
                })

        return {
            "content": choice.message.content or "",
            "tool_calls": tool_calls,
            "tokens": response.usage.total_tokens if response.usage else 0,
        }

    async def _openai_stream(self, messages, model, system_prompt, temperature, max_tokens):
        """OpenAI streaming chat completion."""
        if not self.openai_client:
            yield "OpenAI not configured."
            return

        full_messages = [{"role": "system", "content": system_prompt}] + messages

        stream = await self.openai_client.chat.completions.create(
            model=model,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def _anthropic_chat(self, messages, model, system_prompt, tools, temperature, max_tokens) -> dict:
        """Anthropic chat completion."""
        if not self.anthropic_client:
            return {"content": "Anthropic not configured. Add ANTHROPIC_API_KEY to .env", "tool_calls": [], "tokens": 0}

        response = await self.anthropic_client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
            temperature=temperature,
        )

        content = ""
        for block in response.content:
            if hasattr(block, "text"):
                content += block.text

        return {
            "content": content,
            "tool_calls": [],
            "tokens": (response.usage.input_tokens + response.usage.output_tokens) if response.usage else 0,
        }

    async def _anthropic_stream(self, messages, model, system_prompt, temperature, max_tokens):
        """Anthropic streaming chat completion."""
        if not self.anthropic_client:
            yield "Anthropic not configured."
            return

        async with self.anthropic_client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
            temperature=temperature,
        ) as stream:
            async for text in stream.text_stream:
                yield text

    def _format_openai_tools(self, tools: list[dict]) -> list[dict]:
        """Format tool definitions for OpenAI function calling."""
        formatted = []
        for tool in tools:
            formatted.append({
                "type": "function",
                "function": {
                    "name": tool.get("name", "unknown"),
                    "description": tool.get("description", ""),
                    "parameters": tool.get("parameters", {"type": "object", "properties": {}}),
                },
            })
        return formatted


# Singleton
ai_engine = AIEngine()
