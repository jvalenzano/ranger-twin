"""
Template Lookup Skill for Burn Analyst

Provides standardized regulatory guidance for burn severity assessments.
Derived from MTBS protocols and BAER guidelines.
"""

def lookup_template(query: str) -> dict:
    """
    Look up burn severity standards and protocols.
    
    Args:
        query: Natural language query about burn standards.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],
            "template_id": str
        }
    """
    # Standards based on Key & Benson (2006) and MTBS protocols
    content = (
        "Burn Severity Standards (Embedded Knowledge):\n\n"
        "1. dNBR Thresholds (MTBS Standard):\n"
        "   - Low Severity: 0.10 to 0.27\n"
        "   - Moderate Severity: 0.27 to 0.66\n"
        "   - High Severity: > 0.66\n\n"
        "2. BAER Soil Burn Severity (SBS):\n"
        "   - High SBS: Complete loss of ground cover, charred organic matter, altered soil structure.\n"
        "   - Moderate SBS: Partial loss of ground cover, significant charring but roots intact.\n"
        "   - Low SBS: Surface charring, most ground cover remains, soil structure unchanged.\n"
    )
    
    return {
        "content": content,
        "citations": [
            {
                "source": "MTBS Technical Protocols (Key & Benson, 2006)",
                "citation_key": "MTBS-2006-KB",
                "retrieval_method": "embedded_template"
            },
            {
                "source": "USDA Forest Service BAER Guidance",
                "citation_key": "BAER-GUIDE-SBS",
                "retrieval_method": "embedded_template"
            }
        ],
        "template_id": "burn-severity-standards"
    }
