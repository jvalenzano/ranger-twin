"""
Template Lookup Skill for Trail Assessor

Provides standardized regulatory guidance for trail damage assessment.
Derived from Forest Service Accessibility Guidelines (FSTAG) and TRACS standards.
"""

def lookup_template(query: str) -> dict:
    """
    Look up trail damage standards, TRACS codes, and FSTAG requirements.
    
    Args:
        query: Natural language query about trail standards.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],
            "template_id": str
        }
    """
    # Standards based on TRACS and FSTAG
    content = (
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
        "   - All reconstructions must evaluate accessibility standards per FSTAG.\n"
    )
    
    return {
        "content": content,
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
        "template_id": "trail-damage-standards"
    }
