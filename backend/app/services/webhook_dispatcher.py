"""Webhook event dispatcher — sends events to registered webhook URLs."""

import json
import asyncio
from datetime import datetime
from typing import Optional
import hashlib
import hmac


class WebhookDispatcher:
    """
    Dispatches events to registered webhook URLs.
    Supports retry logic with exponential backoff and HMAC signature verification.
    """

    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 5, 30]  # seconds

    async def dispatch(
        self,
        event_type: str,
        payload: dict,
        webhook_urls: list[dict],
    ) -> list[dict]:
        """
        Send an event to all registered webhooks.

        Args:
            event_type: e.g. "call.started", "call.ended"
            payload: event data
            webhook_urls: list of {"url": str, "secret": str | None, "events": list}

        Returns: list of delivery results
        """
        results = []

        for webhook in webhook_urls:
            # Check if this webhook is subscribed to this event
            if event_type not in webhook.get("events", []):
                continue

            result = await self._send_webhook(
                url=webhook["url"],
                event_type=event_type,
                payload=payload,
                secret=webhook.get("secret"),
            )
            results.append(result)

        return results

    async def _send_webhook(
        self,
        url: str,
        event_type: str,
        payload: dict,
        secret: str | None = None,
    ) -> dict:
        """Send a single webhook delivery with retry logic."""
        import httpx

        body = json.dumps({
            "event": event_type,
            "data": payload,
            "timestamp": datetime.utcnow().isoformat(),
        })

        headers = {
            "Content-Type": "application/json",
            "X-VoiceAI-Event": event_type,
        }

        # Add HMAC signature if secret is provided
        if secret:
            signature = hmac.new(
                secret.encode(), body.encode(), hashlib.sha256
            ).hexdigest()
            headers["X-VoiceAI-Signature"] = f"sha256={signature}"

        # Retry with exponential backoff
        for attempt in range(self.MAX_RETRIES):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        url,
                        content=body,
                        headers=headers,
                        timeout=10.0,
                    )

                    if response.status_code < 400:
                        return {
                            "url": url,
                            "status": response.status_code,
                            "success": True,
                            "attempt": attempt + 1,
                        }
            except Exception as e:
                if attempt < self.MAX_RETRIES - 1:
                    await asyncio.sleep(self.RETRY_DELAYS[attempt])
                else:
                    return {
                        "url": url,
                        "error": str(e),
                        "success": False,
                        "attempt": attempt + 1,
                    }

        return {"url": url, "success": False, "attempt": self.MAX_RETRIES}


# Singleton
webhook_dispatcher = WebhookDispatcher()
