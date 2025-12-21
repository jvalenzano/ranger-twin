"""
Chat Router for API Gateway

Routes user queries to the Recovery Coordinator service.
"""

import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

COORDINATOR_URL = os.getenv("COORDINATOR_URL", "http://localhost:8000")

class ChatRequest(BaseModel):
    session_id: str
    query: str

class ChatResponse(BaseModel):
    answer: str

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Proxy chat requests to the Recovery Coordinator.
    """
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{COORDINATOR_URL}/chat",
                json=request.model_dump(),
                timeout=30.0
            )
            response.raise_for_status()
            return ChatResponse(**response.json())
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Coordinator service error: {e}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
