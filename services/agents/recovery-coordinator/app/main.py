"""
Recovery Coordinator Service Entry Point
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.coordinator import CoordinatorService

app = FastAPI(title="RANGER Recovery Coordinator")

class QueryRequest(BaseModel):
    session_id: str
    query: str

class QueryResponse(BaseModel):
    answer: str

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
    uvicorn.run(app, host="0.0.0.0", port=8005)
