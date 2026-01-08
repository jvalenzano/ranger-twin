"""
Template Lookup Skill for Trail Assessor

Provides standardized regulatory guidance for trail damage assessment.
Derived from Forest Service Accessibility Guidelines (FSTAG) and TRACS standards.
"""

def lookup_template(query: str) -> dict:
    """
    Standardized template lookup for Trail Assessor.
    
    Provides FSTAG accessibility requirements and TRACS damage classifications.
    
    Args:
        query: Natural language query about trail standards.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],
            "template_id": str
        }
    """
    query_lower = query.lower()
    
    # Check for FSTAG / Accessibility
    if any(term in query_lower for term in ["accessibility", "fstag", "grade", "width", "slope"]):
        return {
            "content": """Forest Service Trail Accessibility Guidelines (FSTAG) - Embedded Knowledge:

**1. Surface Requirements:**
- Firm and stable (essential for all ADA-compliant reconstruction).

**2. Clearing Widths:**
- Minimum: 36 inches continuous.
- Passing Spaces: 60 x 60 inches every 200 feet for trails >1000ft.

**3. Running Slope (Grade):**
- 1:20 (5%) or less for any distance.
- 1:12 (8.33%) for up to 200 feet.
- 1:10 (10%) for up to 30 feet.
- 1:8 (12.5%) for up to 10 feet.
- *Extremely Steep*: Grades >12.5% are generally non-accessible.

**4. Protruding Objects:**
- Nothing may protrude more than 4 inches into the clear width between 27-80 inches high.
""",
            "citations": [
                {
                    "source": "Forest Service Trail Accessibility Guidelines (FSTAG) 2013",
                    "citation_key": "FSTAG-2013",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "Architectural Barriers Act (ABA) Standards",
                    "citation_key": "ABA-STANDARDS",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "fstag-standards-enriched"
        }

    # Check for Damage Classification / TRACS
    if any(term in query_lower for term in ["damage", "type", "class", "tracs", "priority"]):
        return {
            "content": """USFS Trail Damage Classification (TRACS) - Embedded Knowledge:

**Classification Levels:**
- **TYPE I (Minor)**: Surface erosion <2", no structure damage. Safe for public travel. Priority: Level 4 (Low).
- **TYPE II (Moderate)**: Surface erosion 2-6", minor structural fatigue (e.g., loose rocks in puncheon). Caution advised. Priority: Level 3.
- **TYPE III (Major)**: Large washouts >6", structure failure (bridge decking, culvert bypass), major hazard trees. Requires closure. Priority: Level 2.
- **TYPE IV (Severe)**: Trail prism lost, complete structural collapse (bridge gone), high life-safety risk. Permanent closure or realignment likely. Priority: Level 1 (Critical).

**Infrastructure Priority:**
1. Bridges (Life Safety)
2. Culverts (Resource Protection / Soil Stability)
3. Retaining walls (Trail Integrity)
4. Tread/Surface (Visitor Experience)
""",
            "citations": [
                {
                    "source": "USFS TRACS User Guide",
                    "citation_key": "TRACS-GUIDE-V4",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "Trail Assessment and Condition Surveys (TRACS) Handbook",
                    "citation_key": "FSH-2309.18",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "trail-damage-standards-enriched"
        }

    # Default general standards
    return {
        "content": (
            "Trail Assessment Standards (Embedded Knowledge):\n\n"
            "1. USFS Damage Classification (Type I-IV):\n"
            "   - Type I (Minor): Minor surface issues, no infrastructure failure.\n"
            "   - Type II (Moderate): Significant surface erosion, minor structure damage.\n"
            "   - Type III (Major): Deep erosion, failed structures (puncheons, culverts).\n"
            "   - Type IV (Severe): Complete structural failure, trail prism lost, high hazard.\n\n"
            "2. Infrastructure Priorities:\n"
            "   - Bridge Failures: Highest priority for engineering assessment.\n"
            "   - Culvert Damage: Critical for soil stabilization post-fire.\n\n"
            "3. FSTAG Accessibility:\n"
            "   - All reconstructions must evaluate accessibility standards per FSTAG."
        ),
        "citations": [
            {
                "source": "USFS TRACS User Guide",
                "citation_key": "TRACS-GUIDE",
                "retrieval_method": "embedded_template"
            },
            {
                "source": "Forest Service Trail Accessibility Guidelines (FSTAG)",
                "citation_key": "FSTAG-2013",
                "retrieval_method": "embedded_template"
            }
        ],
        "template_id": "trail-damage-standards-basic"
    }
