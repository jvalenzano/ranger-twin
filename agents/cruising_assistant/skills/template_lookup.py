"""
Template Lookup Skill for Cruising Assistant

Provides standardized regulatory guidance for timber salvage assessments.
Derived from Forest Service Handbooks (FSH 2409.12).
"""

def lookup_template(query: str) -> dict:
    """
    Look up timber salvage standards and cruise methodologies.
    
    Args:
        query: Natural language query about timber standards.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],
            "template_id": str
        }
    """
    # Standards based on FSH 2409.12 and commercial cruising standards
    content = (
        "Timber Salvage Standards (Embedded Knowledge):\n\n"
        "1. Cruise Methodologies (FSH 2409.12):\n"
        "   - Variable Radius Plot: Preferred for scattered large timber in salvage operations.\n"
        "   - Fixed Radius Plot: Used for smaller trees (<14\" DBH) or dense stocking.\n\n"
        "2. BAF Recommendations:\n"
        "   - Small Timber (<14\" DBH): 10 BAF\n"
        "   - Medium Timber (14-24\" DBH): 20 BAF\n"
        "   - Large Timber (>24\" DBH): 30-40 BAF\n\n"
        "3. Sampling Intensity:\n"
        "   - Low Variability stands: 5-10% sampling intensity.\n"
        "   - High Variability stands (Post-fire): 15-20% sampling intensity recommended.\n"
    )
    
    return {
        "content": content,
        "citations": [
            {
                "source": "USFS Timber Cruising Handbook FSH 2409.12",
                "citation_key": "FSH-2409.12",
                "retrieval_method": "embedded_template"
            }
        ],
        "template_id": "timber-salvage-standards"
    }
