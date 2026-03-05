"""Speech-to-Text integration — Deepgram and OpenAI Whisper support."""

from typing import Optional
from app.config import settings


class SpeechToTextService:
    """
    Speech-to-text service supporting Deepgram (streaming) and OpenAI Whisper (batch).
    """

    def __init__(self):
        self.provider = "deepgram" if settings.DEEPGRAM_API_KEY else "whisper"

    async def transcribe_audio(self, audio_data: bytes, format: str = "wav") -> dict:
        """
        Transcribe audio data to text.
        Returns: {"text": str, "confidence": float, "words": list}
        """
        if settings.DEEPGRAM_API_KEY:
            return await self._deepgram_transcribe(audio_data, format)
        elif settings.OPENAI_API_KEY:
            return await self._whisper_transcribe(audio_data, format)
        else:
            return {
                "text": "[STT not configured — add DEEPGRAM_API_KEY or OPENAI_API_KEY]",
                "confidence": 0.0,
                "words": [],
            }

    async def _deepgram_transcribe(self, audio_data: bytes, format: str) -> dict:
        """Transcribe using Deepgram API."""
        import httpx

        headers = {
            "Authorization": f"Token {settings.DEEPGRAM_API_KEY}",
            "Content-Type": f"audio/{format}",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
                headers=headers,
                content=audio_data,
                timeout=30.0,
            )

            if response.status_code == 200:
                data = response.json()
                result = data.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0]
                return {
                    "text": result.get("transcript", ""),
                    "confidence": result.get("confidence", 0.0),
                    "words": result.get("words", []),
                }

        return {"text": "", "confidence": 0.0, "words": []}

    async def _whisper_transcribe(self, audio_data: bytes, format: str) -> dict:
        """Transcribe using OpenAI Whisper API."""
        if not settings.OPENAI_API_KEY:
            return {"text": "", "confidence": 0.0, "words": []}

        from openai import AsyncOpenAI
        import io

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        audio_file = io.BytesIO(audio_data)
        audio_file.name = f"audio.{format}"

        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
        )

        return {
            "text": response.text,
            "confidence": 0.95,
            "words": [],
        }


# Singleton
stt_service = SpeechToTextService()
