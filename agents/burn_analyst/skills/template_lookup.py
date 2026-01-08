"""
Template Lookup Skill for Burn Analyst

Provides standardized regulatory guidance for burn severity assessments.
Derived from MTBS protocols and BAER guidelines.
"""

def lookup_template(query: str) -> dict:
    """
    Standardized template lookup for Burn Analyst.
    
    Provides technical dNBR thresholds and BAER assessment standards.
    
    Args:
        query: Search query for fire severity standards.
        
    Returns:
        dict: {
            "content": str,
            "citations": list[dict],
            "template_id": str
        }
    """
    query_lower = query.lower()
    
    # Check for dNBR / Severity thresholds
    if any(term in query_lower for term in ["threshold", "dnbr", "severity class", "mtbs"]):
        return {
            "content": """Standardized Burn Severity Thresholds (dNBR) - Embedded Knowledge:

**MTBS / BAER Classification Standards:**
- **UNBURNED / UNCHANGED**: dNBR < 100 (or < 0.1 normalized)
- **LOW SEVERITY**: 100 ≤ dNBR < 270 (0.1 - 0.27 normalized)
- **MODERATE SEVERITY**: 270 ≤ dNBR < 660 (0.27 - 0.66 normalized)
- **HIGH SEVERITY**: dNBR ≥ 660 (≥ 0.66 normalized)

**Soil Burn Severity Indicators (BAER):**
- **Low**: Surface organic layers slightly charred; fine roots intact.
- **Moderate**: up to 80% coverage of ground char; some deep char.
- **High**: >80% coverage of ground char; deep ash; roots consumed; soil structure changed.

**BAER Emergency Assessment Timeline:**
- Immediate: Watershed impact assessment for "High" zones.
- 7 Days: Initial BAER report due for incidents >500 acres.
- 14 Days: Funding request for emergency stabilization.
""",
            "citations": [
                {
                    "source": "Burned Area Emergency Response (BAER) Handbook FSH 2509.13",
                    "citation_key": "FSH-2509.13",
                    "retrieval_method": "embedded_template"
                },
                {
                    "source": "Monitoring Trends in Burn Severity (MTBS) Calibration Standards",
                    "citation_key": "MTBS-TECH-2023",
                    "retrieval_method": "embedded_template"
                }
            ],
            "template_id": "burn-severity-standards-enriched"
        }

    # Default general standards
    return {
        "content": (
            "Standard Burn Severity Standards (Embedded Knowledge):\n\n"
            "Fire severity is classified using dNBR (differenced Normalized Burn Ratio) "
            "thresholds derived from pre- and post-fire Landsat imagery. These "
            "standards guide BAER (Burned Area Emergency Response) prioritization.\n\n"
            "1. High Severity (dNBR > 660): Complete canopy loss, high soil heating.\n"
            "2. Moderate Severity (dNBR 270-660): Partial canopy loss, mixed ground char.\n"
            "3. Low Severity (dNBR 100-270): Surface fire, minimal canopy impact."
        ),
        "citations": [
            {
                "source": "USFS Post-Fire Assessment Standards",
                "citation_key": "USFS-BAER-GUIDE",
                "retrieval_method": "embedded_template"
            }
        ],
        "template_id": "burn-severity-standards-basic"
    }
