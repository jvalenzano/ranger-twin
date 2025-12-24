import os
import json
import base64
import requests
from typing import Dict, Any, List
from pathlib import Path

# Use Vertex AI / Gemini via google-genai
from google import genai
from google.genai import types

# --- CONFIGURATION ---
# Mocking the context that would be sent from the RANGER Command Console
UI_CONTEXT = {
    "active_workflow": "Damage Assessment",
    "target_label": "Hills Creek Trail #3510",
    "reported_damage": "Bridge failure, $238K estimated repair, debris flow burial",
    "markers_in_view": ["47-ALPHA", "47-BRAVO", "52-FOXTROT"],
    "current_app_time": "2025-12-23" # Snapshot from the future/current session
}

TARGET_COORDS = {"lat": 43.71, "lng": -122.05} 
TARGET_DATE = "September 2022" 
IMAGE_PATH = "/Users/jvalenzano/.gemini/antigravity/brain/13e71555-9982-4458-a35d-e1c7e02ac243/uploaded_image_1766554846090.png"

def query_osm_overpass(lat: float, lng: float, radius: int = 500) -> List[Dict[str, Any]]:
    """Query OpenStreetMap Overpass API for features near a coordinate."""
    print(f"[*] Querying OSM Overpass for infrastructure metadata near {lat}, {lng}...")
    query = f"""
    [out:json][timeout:25];
    (
      node["bridge"](around:{radius},{lat},{lng});
      way["bridge"](around:{radius},{lat},{lng});
      way["highway"="path"](around:{radius},{lat},{lng});
    );
    out body;
    >;
    out skel qt;
    """
    url = "https://overpass-api.de/api/interpreter"
    try:
        response = requests.post(url, data={"data": query})
        if response.status_code == 200:
            data = response.json()
            elements = data.get("elements", [])
            print(f"[+] Found {len(elements)} OSM elements.")
            return elements
    except Exception as e:
        print(f"[!] OSM query failed: {e}")
    return []

def analyze_forensic_insight(image_path: str, osm_data: List[Dict[str, Any]], coords: Dict[str, float], date_context: str, ui_context: Dict[str, Any]):
    """Perform multimodal forensic analysis with 'Skeptical Agent' logic."""
    print(f"[*] Initializing Forensic Orchestrator for {ui_context['target_label']}...")
    
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key) if api_key else genai.Client()
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    
    osm_summary = json.dumps(osm_data, indent=2)
    
    prompt = f"""
    You are a RANGER Forensic Intelligence Agent. 
    A user has provided a snapshot of their Command Console and asked for a "Deep Research" audit.
    
    --- UI CONTEXT (DATA FROM RANGER APP) ---
    - Workflow: {ui_context['active_workflow']}
    - Target: {ui_context['target_label']}
    - Reported Damage: {ui_context['reported_damage']}
    - Markers: {', '.join(ui_context['markers_in_view'])}
    
    --- GEOSPATIAL CONTEXT ---
    - Coordinates: {coords['lat']}, {coords['lng']}
    - Primary Incident: Cedar Creek Fire ({date_context})
    - OSM Metadata: {osm_summary if osm_data else "None"}
    
    --- YOUR MISSION (SKEPTICAL FORENSICS) ---
    1. VALIDATE: Use Google Search to cross-reference the UI Context against official Forest Service (USFS) records. Is "{ui_context['target_label']}" the correct name for Trail #3510 in the Willamette NF?
    2. ARCHIVAL RESEARCH: Look for media-rich proof (InciWeb logs, news videos, social media imagery) of the Cedar Creek Fire impact at this location.
    3. CORRELEATION: Link the visual markers in the snapshot (47-ALPHA, etc.) to the found damage reports.
    4. OUTPUT: Provide a "Forensic Chronology". If you find a data discrepancy (e.g., naming errors), flag it prominently as a 'FORENSIC ALERT'.
    
    FORMAT:
    Tactical briefing style. Include a 'Media & Citations' section with specific URLs for videos and reports.
    """
    
    print("[*] Sending orchestrated search-grounded request to Gemini...")
    
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type="image/png")
            ],
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
    except Exception as e:
        print(f"[!] Search tool failed: {e}")
        return f"Error: {e}"
    
    return response.text

if __name__ == "__main__":
    osm_results = query_osm_overpass(TARGET_COORDS["lat"], TARGET_COORDS["lng"])
    analysis_report = analyze_forensic_insight(IMAGE_PATH, osm_results, TARGET_COORDS, TARGET_DATE, UI_CONTEXT)
    
    print("\n" + "="*50)
    print("RANGER FORENSIC ORCHESTRATOR: REPORT")
    print("="*50)
    print(analysis_report)
    print("="*50)
