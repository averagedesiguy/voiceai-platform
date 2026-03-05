"""Telephony service — Twilio integration for phone calls."""

from typing import Optional
from app.config import settings


class TelephonyService:
    """
    Telephony abstraction layer with Twilio as the initial provider.
    Supports outbound calls, inbound call handling, and call recording.
    """

    def __init__(self):
        self.provider = "twilio"
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initialize Twilio client if credentials are available."""
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                from twilio.rest import Client
                self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            except ImportError:
                pass

    async def make_call(
        self,
        to: str,
        webhook_url: str,
        from_number: str | None = None,
        record: bool = True,
    ) -> dict:
        """
        Initiate an outbound phone call.
        Returns: {"call_sid": str, "status": str}
        """
        if not self.client:
            return {
                "call_sid": "demo_" + to.replace("+", ""),
                "status": "demo_mode",
                "message": "Twilio not configured. Running in demo mode.",
            }

        from_num = from_number or settings.TWILIO_PHONE_NUMBER

        call = self.client.calls.create(
            to=to,
            from_=from_num,
            url=webhook_url,
            record=record,
            status_callback=webhook_url + "/status",
            status_callback_event=["initiated", "ringing", "answered", "completed"],
        )

        return {
            "call_sid": call.sid,
            "status": call.status,
        }

    async def end_call(self, call_sid: str) -> dict:
        """End an active call."""
        if not self.client or call_sid.startswith("demo_"):
            return {"status": "completed", "message": "Demo mode — call ended."}

        call = self.client.calls(call_sid).update(status="completed")
        return {"status": call.status}

    async def get_recording(self, call_sid: str) -> str | None:
        """Get recording URL for a call."""
        if not self.client or call_sid.startswith("demo_"):
            return None

        recordings = self.client.recordings.list(call_sid=call_sid, limit=1)
        if recordings:
            return f"https://api.twilio.com{recordings[0].uri.replace('.json', '.mp3')}"
        return None

    def generate_twiml_response(self, text: str) -> str:
        """Generate TwiML response for Twilio webhooks."""
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">{text}</Say>
</Response>"""

    def generate_twiml_stream(self, websocket_url: str) -> str:
        """Generate TwiML for WebSocket media streaming."""
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="{websocket_url}" />
    </Connect>
</Response>"""


# Singleton
telephony_service = TelephonyService()
