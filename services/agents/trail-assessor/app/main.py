"""
Trail Assessor Service Entry Point
"""

import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.agent import TrailAssessorService

app = FastAPI(title="RANGER Trail Assessor")

class HealthResponse(BaseModel):
    status: str
    agent: str
    version: str

class AssessmentRequest(BaseModel):
    session_id: str
    trail_id: str

class AssessmentResponse(BaseModel):
    status: str
    analysis: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        agent="trail-assessor",
        version="0.1.0",
    )

@app.get("/")
async def root():
    """Agent info endpoint."""
    return {
        "agent": "trail-assessor",
        "status": "active",
        "description": "Trail damage assessment for post-fire recovery",
    }

@app.post("/assess", response_model=AssessmentResponse)
async def assess(request: AssessmentRequest):
    """
    Endpoint to trigger trail damage assessment.
    """
    try:
        service = TrailAssessorService(request.session_id)
        result = await service.assess_trail(request.trail_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return AssessmentResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
