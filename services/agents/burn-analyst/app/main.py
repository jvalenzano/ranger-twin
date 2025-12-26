"""
Burn Analyst Service Entry Point
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.agent import BurnAnalystService

app = FastAPI(title="RANGER Burn Analyst")

class HealthResponse(BaseModel):
    status: str
    agent: str
    version: str

class AnalysisRequest(BaseModel):
    session_id: str
    area_id: str

class AnalysisResponse(BaseModel):
    status: str
    analysis: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        agent="burn-analyst",
        version="0.1.0",
    )

@app.get("/")
async def root():
    """Agent info endpoint."""
    return {
        "agent": "burn-analyst",
        "status": "active",
        "description": "Burn severity analysis for post-fire recovery",
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    """
    Endpoint to trigger burn severity analysis for an area.
    """
    try:
        service = BurnAnalystService(request.session_id)
        result = await service.analyze_area(request.area_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return AnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
