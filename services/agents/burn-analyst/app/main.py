"""
Burn Analyst Service Entry Point
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.agent import BurnAnalystService

app = FastAPI(title="RANGER Burn Analyst")

class AnalysisRequest(BaseModel):
    session_id: str
    area_id: str

class AnalysisResponse(BaseModel):
    status: str
    analysis: str

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
    uvicorn.run(app, host="0.0.0.0", port=8001)
