"""
Recovery Coordinator Service Entry Point
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.coordinator import CoordinatorService

app = FastAPI(title="RANGER Recovery Coordinator")

class HealthResponse(BaseModel):
    status: str
    agent: str
    version: str

class QueryRequest(BaseModel):
    session_id: str
    query: str

class QueryResponse(BaseModel):
    answer: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        agent="recovery-coordinator",
        version="0.1.0",
    )

@app.get("/")
async def root():
    """Agent info endpoint."""
    return {
        "agent": "recovery-coordinator",
        "status": "active",
        "description": "Root orchestrator for RANGER multi-agent platform",
    }

@app.post("/chat", response_model=QueryResponse)
async def chat(request: QueryRequest):
    """
    Unified chat endpoint for the RANGER platform.
    Routes through the Recovery Coordinator.
    """
    try:
        service = CoordinatorService(request.session_id)
        answer = await service.chat(request.query)
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8005))
    uvicorn.run(app, host="0.0.0.0", port=port)
