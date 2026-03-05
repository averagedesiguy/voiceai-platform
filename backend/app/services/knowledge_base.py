"""Knowledge base service — RAG pipeline for document processing and retrieval."""

from typing import Optional
from app.config import settings


class KnowledgeBaseService:
    """
    RAG (Retrieval-Augmented Generation) pipeline:
    1. Upload documents
    2. Chunk text
    3. Generate embeddings
    4. Store in vector DB
    5. Query at conversation time
    """

    def __init__(self):
        self.embedding_model = "text-embedding-3-small"

    async def process_document(self, text: str, document_id: str) -> int:
        """
        Process a document: chunk → embed → store.
        Returns: number of chunks created
        """
        chunks = self._chunk_text(text)

        if settings.OPENAI_API_KEY:
            embeddings = await self._generate_embeddings([c["text"] for c in chunks])
            # Store in vector DB (ChromaDB for MVP)
            await self._store_vectors(document_id, chunks, embeddings)

        return len(chunks)

    async def search(self, kb_id: str, query: str, top_k: int = 5) -> list[dict]:
        """
        Search a knowledge base with a query.
        Returns ranked document chunks.
        """
        if not settings.OPENAI_API_KEY:
            return []

        query_embedding = await self._generate_embeddings([query])
        if not query_embedding:
            return []

        # Search vector DB
        results = await self._search_vectors(kb_id, query_embedding[0], top_k)
        return results

    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list[dict]:
        """Split text into overlapping chunks."""
        chunks = []
        words = text.split()
        chunk_words = chunk_size  # Approximate chunk size in words

        for i in range(0, len(words), chunk_words - overlap):
            chunk_text = " ".join(words[i : i + chunk_words])
            if chunk_text.strip():
                chunks.append({
                    "text": chunk_text,
                    "index": len(chunks),
                    "start_word": i,
                })

        return chunks

    async def _generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings using OpenAI."""
        if not settings.OPENAI_API_KEY:
            return []

        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.embeddings.create(
                model=self.embedding_model,
                input=texts,
            )
            return [d.embedding for d in response.data]
        except Exception:
            return []

    async def _store_vectors(self, document_id: str, chunks: list[dict], embeddings: list[list[float]]):
        """Store vectors in ChromaDB (or similar)."""
        # ChromaDB integration would go here
        # For MVP, this is a placeholder
        pass

    async def _search_vectors(self, kb_id: str, query_embedding: list[float], top_k: int) -> list[dict]:
        """Search vectors in ChromaDB."""
        # ChromaDB search would go here
        return []


# Singleton
knowledge_service = KnowledgeBaseService()
