"""
Template Lookup Skill for Cruising Assistant

Provides standardized regulatory guidance for timber salvage assessments.
Derived from Forest Service Handbooks (FSH 2409.12).
"""

def lookup_template(query: str) -> dict:
    """
    Standardized template lookup for Cruising Assistant.
    
    Provides timber salvage standards and cruise methodology guidance.
    
    Args:
        query: Natural language query about timber standards.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],
            "template_id": str
        }
    """
    query_lower = query.lower()
    
    # Check for methodology / cruise design
    if any(term in query_lower for term in ["method", "design", "plot", "baf", "variable", "fixed"]):
        return {
            "content": """Timber Cruise Design Standards (FSH 2409.12) - Embedded Knowledge:

**1. Primary Methodologies:**
- **Variable Radius (Prism) Plot**: Standard for merchantable timber salvage. Recommended for stands >12" DBH.
- **Fixed Radius Plot**: Used for regeneration audits or small-diameter salvage. Standard sizes: 1/10th or 1/20th acre.
- **Strip Cruising**: Rarely used except for uniform fuel break assessments.

**2. BAF Selection Guidelines (Variable Radius):**
- **10 BAF**: Small timber / low density.
- **20 BAF**: Standard mixed conifer salvage.
- **40 BAF**: High-density large-diameter Douglas-fir/Cedar.
- *Rule of Thumb*: Aim for 5-8 "in" trees per plot.

**3. Sampling Intensity Requirements:**
- **Tier 1 (Critical/High Value)**: 15-20% sampling intensity.
- **Tier 2 (Standard Salvage)**: 10% sampling intensity.
- **Tier 3 (Overview/Research)**: 5% sampling intensity.
""",
            "citations": [
                {
                    "source": "USFS Timber Cruising Handbook FSH 2409.12",
                    "citation_key": "FSH-2409.12",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "Region 6 Cruising Quality Standards",
                    "citation_key": "R6-CRUISE-2022",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "timber-methodology-enriched"
        }

    # Default general standards
    return {
        "content": (
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
            "   - High Variability stands (Post-fire): 15-20% sampling intensity recommended."
        ),
        "citations": [
            {
                "source": "USFS Timber Cruising Handbook FSH 2409.12",
                "citation_key": "FSH-2409.12",
                "retrieval_method": "embedded_template"
            }
        ],
        "template_id": "timber-salvage-standards-basic"
    }
