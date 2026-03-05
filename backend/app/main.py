"""
VoiceAI Platform — Main FastAPI Application
=============================================
AI Communication Platform API powering voice agents, chat agents,
workflow automation, and developer APIs.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.middleware.rate_limit import RateLimitMiddleware

# Import routers
from app.routers import auth, agents, calls, workflows, knowledge, analytics, developer, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print("🚀 VoiceAI Platform starting...")
    await init_db()
    print("✅ Database initialized")
    print(f"📡 API docs available at http://localhost:{settings.PORT}/docs")

    yield  # Application runs

    # Shutdown
    print("👋 VoiceAI Platform shutting down...")
from fastapi import FastAPI
app = FastAPI()

app = FastAPI(
    title="VoiceAI Platform",
    description=(
        "AI Communication Platform — Build and deploy intelligent voice agents, "
        "chat agents, and workflow automations. A Twilio + Voiceflow + Bland AI alternative."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.add_middleware(RateLimitMiddleware)

# ── Routes ───────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(calls.router, prefix="/api/v1")
app.include_router(workflows.router, prefix="/api/v1")
app.include_router(knowledge.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(developer.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")


# ── Root & Health ────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Platform info and health check."""
    return {
        "name": "VoiceAI Platform",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "description": "AI Communication Platform — Voice Agents, Chat Agents, Workflows & APIs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# ── Chat / Conversation test endpoint ────────────────────────────

@app.post("/api/v1/chat", tags=["Chat"])
async def chat_with_agent(
    request: dict,
):
    """
    Quick chat test endpoint — send a message and get an AI response.
    No authentication required (for demo purposes).

    Body: {"message": "Hello", "agent_id": "optional", "model": "gpt-4o-mini"}
    """
    from app.services.ai_engine import ai_engine

    message = request.get("message", "Hello!")
    model = request.get("model", "gpt-4o-mini")
    system_prompt = request.get("system_prompt", "You are a helpful AI assistant.")

    result = await ai_engine.chat(
        messages=[{"role": "user", "content": message}],
        model=model,
        system_prompt=system_prompt,
    )

    return {
        "response": result["content"],
        "tokens": result["tokens"],
        "model": model,
    }


# ── WebSocket endpoint for real-time voice ───────────────────────

from fastapi import WebSocket, WebSocketDisconnect


@app.websocket("/api/v1/voice/stream")
async def voice_stream(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice conversation streaming.
    Protocol:
    1. Client sends audio chunks (base64 encoded)
    2. Server processes STT → LLM → TTS
    3. Server sends back audio response chunks
    """
    await websocket.accept()

    from app.services.ai_engine import ai_engine
    from app.services.conversation import conversation_manager
    import uuid
    import json

    session_id = str(uuid.uuid4())

    try:
        # Wait for config message
        config = await websocket.receive_json()
        system_prompt = config.get("system_prompt", "You are a helpful AI assistant.")
        model = config.get("model", "gpt-4o-mini")
        voice_id = config.get("voice_id", "alloy")

        conversation_manager.create_session(session_id, system_prompt)

        await websocket.send_json({
            "type": "session.created",
            "session_id": session_id,
        })

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")

            if msg_type == "text":
                # Text-based conversation
                user_text = data.get("content", "")
                conversation_manager.add_message(session_id, "user", user_text)

                messages = conversation_manager.get_messages(session_id)
                result = await ai_engine.chat(
                    messages=messages,
                    model=model,
                    system_prompt=system_prompt,
                )

                conversation_manager.add_message(session_id, "assistant", result["content"])

                await websocket.send_json({
                    "type": "response",
                    "content": result["content"],
                    "tokens": result["tokens"],
                })

            elif msg_type == "audio":
                # Audio chunk — would process through STT pipeline
                await websocket.send_json({
                    "type": "processing",
                    "message": "Audio processing requires STT service configuration.",
                })

            elif msg_type == "end":
                break

    except WebSocketDisconnect:
        pass
    finally:
        session_data = conversation_manager.end_session(session_id)
        try:
            await websocket.send_json({
                "type": "session.ended",
                "session_id": session_id,
            })
        except Exception:
            pass
