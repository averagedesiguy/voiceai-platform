"""Text-to-Speech integration — ElevenLabs support."""

from typing import AsyncGenerator
from app.config import settings


class TextToSpeechService:
    """
    Text-to-speech service using ElevenLabs for high-quality neural voices.
    """

    # Available voice IDs (ElevenLabs defaults)
    VOICES = {
        "alloy": "21m00Tcm4TlvDq8ikWAM",  # Rachel
        "echo": "AZnzlk1XvdvUeBnXmlld",   # Domi
        "fable": "EXAVITQu4vr4xnSDxMaL",  # Bella
        "onyx": "ErXwobaYiN019PkySvjV",   # Antoni
        "nova": "MF3mGyEYCl7XYWbV9V6O",   # Elli
        "shimmer": "ThT5KcBeYPX3keUQqHPh", # Dorothy
    }

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY

    async def synthesize(self, text: str, voice_id: str = "alloy") -> bytes:
        """
        Convert text to speech audio.
        Returns: audio bytes (mp3)
        """
        if not self.api_key:
            return b""  # Return empty bytes if not configured

        import httpx

        # Map friendly name to ElevenLabs voice ID
        el_voice_id = self.VOICES.get(voice_id, voice_id)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{el_voice_id}",
                headers={
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": "eleven_turbo_v2_5",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                        "style": 0.0,
                        "use_speaker_boost": True,
                    },
                },
                timeout=30.0,
            )

            if response.status_code == 200:
                return response.content

        return b""

    async def synthesize_stream(self, text: str, voice_id: str = "alloy") -> AsyncGenerator[bytes, None]:
        """Stream TTS audio chunks for low-latency playback."""
        if not self.api_key:
            return

        import httpx

        el_voice_id = self.VOICES.get(voice_id, voice_id)

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"https://api.elevenlabs.io/v1/text-to-speech/{el_voice_id}/stream",
                headers={
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": "eleven_turbo_v2_5",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
                timeout=30.0,
            ) as response:
                async for chunk in response.aiter_bytes(1024):
                    yield chunk


# Singleton
tts_service = TextToSpeechService()
