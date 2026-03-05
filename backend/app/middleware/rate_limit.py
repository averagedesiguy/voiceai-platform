"""Rate limiting middleware."""

import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings


class RateLimiter:
    """In-memory rate limiter. Replace with Redis for production."""

    def __init__(self, max_requests: int = 60, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _clean_old(self, key: str):
        now = time.time()
        self._requests[key] = [
            t for t in self._requests[key] if now - t < self.window_seconds
        ]

    def is_allowed(self, key: str) -> tuple[bool, int]:
        """Check if a request is allowed. Returns (allowed, remaining)."""
        self._clean_old(key)
        current = len(self._requests[key])
        if current >= self.max_requests:
            return False, 0
        self._requests[key].append(time.time())
        return True, self.max_requests - current - 1


rate_limiter = RateLimiter(max_requests=settings.RATE_LIMIT_PER_MINUTE)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting requests."""

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for docs
        if request.url.path in ("/docs", "/openapi.json", "/redoc"):
            return await call_next(request)

        # Use IP + user-agent as key (or auth token if available)
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}"

        allowed, remaining = rate_limiter.is_allowed(key)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please retry later.",
                headers={"Retry-After": "60"},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
