# LMOSINT Competitive & Commercial Intelligence Analysis

**Agent 4 Output | March 2026**
**Classification: Internal Strategy Document**

---

## Executive Summary

The wildfire/land management technology market is fragmented across GIS incumbents, wildfire-specific startups, defense-tech platforms, and emerging AI players. The total addressable market for USFS IT modernization is estimated at $500M-$800M annually (IT services, geospatial, fire management systems combined). TechTrend Federal has a unique inside position through existing USFS contracts (NRM modernization, Financial Management via Government Cloud Logic JV) and can leverage its 8(a) STARS III vehicle. However, displacement of entrenched GIS incumbents (Esri) is impractical. The winning strategy is to position LMOSINT as a cross-domain intelligence synthesis layer that sits *above* existing data sources -- not as a replacement for any incumbent system.

---

## 1. Incumbent Profiles

### 1.1 Esri (ArcGIS, Living Atlas)

**Entrenchment Level: MAXIMUM**

Esri is the foundational GIS platform across all USFS operations. The Forest Service maintains an Enterprise License Agreement (ELA) with Esri under FITARA discount tiers. Key facts:

- **FedRAMP Status:** ArcGIS Online is FedRAMP Moderate authorized (July 2024, via DOI). Esri Managed Cloud Services (EMCS) Advanced Plus also holds FedRAMP Moderate Rev 5 authorization. First SaaS-based GIS to achieve FedRAMP Moderate.
- **USFS Integration:** USFS Geospatial Data Discovery runs entirely on ArcGIS Hub. All USFS geodata is distributed in Esri formats (File Geodatabase, Shapefile). Enterprise Geospatial Portal (EGP) is Esri-based.
- **Cost Savings Claim:** The WildFireSA platform (built by ICF on Esri stack) claims $525K/year savings over legacy systems and 70% reduction in manual data entry.
- **Revenue Estimate:** Esri's federal government ELA pricing is not public, but the USDA-wide FITARA agreement covers multiple agencies. Esri's total annual revenue exceeds $2B, with federal being a major segment. The USFS-specific Esri spend is likely $10M-$30M/year including enterprise licensing, ArcGIS Online subscriptions, and related professional services.
- **Gaps:** Esri is a platform, not a decision-intelligence system. It excels at spatial visualization and data management but does not provide multi-agent AI reasoning, cross-domain signal fusion, or automated regulatory analysis. Esri has no native NEPA workflow, no timber cruising intelligence, and no AI-driven recovery coordination.

**Displacement Difficulty: HIGH.** Do not compete with Esri. Integrate with it. LMOSINT should consume Esri services (ArcGIS REST APIs, Feature Layers) as data sources.

---

### 1.2 Palantir Technologies

**Entrenchment Level: GROWING (but not yet in USFS)**

- **FedRAMP Status:** FedRAMP High Baseline Authorization (December 2024). Covers full product suite: AIP, Apollo, Foundry, Gotham. Also holds DoD IL5 and IL6 authorizations.
- **USFS Relationship:** No direct USFS contract found. However, Palantir holds a USDA-wide contract for "One Farmer, One File" system modernization (announced early 2025 by Agriculture Secretary Rollins). This gives Palantir a beachhead within USDA.
- **Wildfire Adjacent:** PG&E deployed Palantir Foundry for Public Safety Power Shutoff (PSPS) decisions and wildfire risk mitigation. PVM hosted a Palantir AIP Bootcamp in DC focused on wildfire management decision-making (October 2024).
- **FedStart Program:** Palantir's FedStart allows partner companies to deploy software within Palantir's accredited environment, achieving FedRAMP High without independent authorization. This is both a competitive threat and potential partnership opportunity.
- **Cost Estimate:** Palantir contracts typically range $5M-$50M+ for federal deployments. Their USDA engagement is likely in the $10M-$30M range.
- **Gaps:** Palantir is general-purpose. It lacks domain-specific forestry knowledge, NEPA expertise, timber cruising protocols, and USFS-specific operational workflows. Its strength is data integration and visualization, not land management domain reasoning.

**Displacement Difficulty: MEDIUM.** Palantir is the most dangerous long-term competitor. They have the FedRAMP posture, the USDA relationship, and the platform breadth. LMOSINT must differentiate on domain depth and cost.

---

### 1.3 Technosylva (Wildfire Analyst+)

**Entrenchment Level: HIGH (within fire operations)**

- **FedRAMP Status:** None found. Desktop/SaaS application, does not appear to be in FedRAMP marketplace.
- **USFS Relationship:** Joint venture agreement with USFS Missoula Fire Sciences Lab (5-year). First commercial company to achieve this. Integrates with IRWIN for real-time incident data.
- **Scale:** Used by 13 state fire agencies across 29 states, 20 utilities. Processes 20,000+ fire incidents/year with 1B+ daily simulations.
- **Products:** Wildfire Analyst (desktop fire spread modeling), fiResponse (dispatch optimization), Tactical Analyst (field operations). TA Associates invested (PE backing).
- **Cost Estimate:** Per-agency licensing, likely $200K-$1M/year per deployment depending on scope. Enterprise deals with utilities are larger.
- **Gaps:** Technosylva is exclusively focused on fire behavior prediction and suppression operations. It does NOT address post-fire recovery, NEPA compliance, timber salvage planning, trail assessment, or multi-agent coordination. It is a fire-season tool, not a recovery-season tool.

**Displacement Difficulty: LOW for LMOSINT's scope.** Technosylva occupies a different niche (active fire operations). LMOSINT targets post-fire recovery intelligence synthesis. These are complementary, not competitive. Technosylva data could be an upstream input to LMOSINT.

---

### 1.4 Pano AI (Wildfire Detection Cameras)

**Entrenchment Level: MODERATE (state/local, growing federal)**

- **FedRAMP Status:** None found.
- **Government Contracts:** Over $100M in total customer contracts (government + utility). Primarily state/local: Washington DNR pilot (2023), Colorado Senate Bill 25-011 ($6M/3yr), nine-state presence. Federal Forest Service / BLM adoption actively lobbied but not yet secured.
- **Pricing:** $50,000/year per camera station (all-inclusive: hardware, software, maintenance, notifications).
- **Scale:** 250+ agencies across US, Canada, Australia. Monitoring 30M+ acres. Series B: $44M raised.
- **Gaps:** Pure detection play. Cameras + AI for early wildfire identification. No post-fire intelligence, no land management analysis, no NEPA/regulatory capabilities, no recovery coordination. Hardware-dependent business model.

**Displacement Difficulty: N/A.** Not a competitor to LMOSINT. Different problem domain entirely (detection vs. intelligence synthesis). Potential data source.

---

### 1.5 Rain Industries (Autonomous Wildfire Suppression)

**Entrenchment Level: LOW (pre-commercial for federal)**

- **FedRAMP Status:** N/A (hardware/autonomous systems company).
- **USFS Relationship:** No federal contract found. Demonstrated autonomous suppression with Sikorsky/Lockheed Martin in California. Partnership with Brothers Air Support for Black Hawk integration.
- **Status:** Pre-revenue/early-revenue. Demonstration phase. Facing "slow roll" cultural resistance from federal aviation procurement.
- **Gaps:** Suppression-only. No intelligence/analytics component relevant to LMOSINT scope.

**Displacement Difficulty: N/A.** Not a competitor. Different domain (autonomous suppression hardware).

---

### 1.6 BC Wildfire Service (BCWS)

**Entrenchment Level: LOW (Canadian government internal)**

- **FedRAMP Status:** N/A (Canadian government platform).
- **Open Source Status:** BCWS Innovation Platform exists (bcwsinnovation.gov.bc.ca) but appears to be in early stages. BC Government publishes some open source code on GitHub (github.com/bcgov). The BCWS mobile/web apps transitioned to Esri vector maps in 2024.
- **Technology:** Drone-based aerial ignitions (first in Canadian history, 2022), in-house aerial infrared scanning.
- **Gaps:** Internal government tooling, not exportable. Esri-dependent for mapping. No AI/ML decision intelligence layer.

**Displacement Difficulty: N/A.** Not a US market competitor. Potential model for what USFS *could* build internally, which makes LMOSINT's time-to-value argument important.

---

### 1.7 CAL FIRE (FUELS Program / OWTRD)

**Entrenchment Level: HIGH (within California)**

- **Programs:** Fuels Treatment Effectiveness Dashboard (launched October 2024), Vegetation Management Program (since 1982, ~25K acres/year), statewide LiDAR mapping (100M+ acres with NASA Ames).
- **Office of Wildfire Technology R&D (OWTRD):** Central hub for emerging wildfire technology evaluation for the state.
- **Budget:** $117M in Wildfire Prevention Grants available. $300M+ awarded since 2021 for wildfire resilience in Southern California alone.
- **Gaps:** State-level program, not federal procurement. Technology evaluation role means CAL FIRE is a potential *customer pathway* for technologies that prove out at state level before federal adoption.

**Displacement Difficulty: N/A.** Not a direct competitor but an important reference market. If LMOSINT can prove value in CAL FIRE / California contexts, it strengthens the USFS pitch.

---

### 1.8 Vibrant Planet (Landscape Resilience Platform)

**Entrenchment Level: MODERATE-HIGH (and growing)**

- **FedRAMP Status:** Not found in FedRAMP marketplace, but has a Federal Blanket Purchase Agreement (BPA) facilitating government partnerships.
- **USFS Relationship:** Active partnerships with USFS. Federal BPA in place. Deployments across 4M+ acres. Working with USFS on real-time prescribed fire planning.
- **Platform:** Web-based decision support for multi-jurisdictional landscape management. Treatment scenario planning, predictive analytics, environmental regulation and permitting support.
- **Recognition:** CEO on Inc. 2024 Female Founders list. Government-approved environmental vendor.
- **Research:** Modeled $600B in direct property risk from wildfire exposure (with Pyrologix, 2025).
- **Gaps:** Planning-focused rather than intelligence-synthesis focused. Does not appear to offer multi-agent AI reasoning, cross-domain signal fusion from OSINT sources, or automated NEPA compliance analysis. More of a collaborative GIS planning tool than an intelligence platform.

**Displacement Difficulty: MEDIUM.** Vibrant Planet is the closest direct competitor to LMOSINT's value proposition. Key differentiators for LMOSINT: (1) AI-driven reasoning transparency, (2) multi-agent specialist coordination, (3) OSINT signal fusion beyond spatial data, (4) open-source deployment model vs. SaaS.

---

### 1.9 OroraTech (Satellite Wildfire Detection)

**Entrenchment Level: LOW (entering US market)**

- **FedRAMP Status:** None.
- **Federal Contracts:** NASA JPL concept study contract (with Spire Global). Canadian Space Agency CAN$72M WildFireSat contract. Greek government EUR20M national wildfire early warning system.
- **Technology:** World's first dedicated wildfire satellite constellation (8 CubeSats, launched March 2025). 400km swath, 4m x 4m hotspot detection, 3-minute alert delivery.
- **US Presence:** Denver HQ opened 2025. Larimer County, CO as first US customer.
- **Gaps:** Pure detection/monitoring. No land management intelligence, recovery planning, or decision support.

**Displacement Difficulty: N/A.** Not a competitor. Potential data source for LMOSINT (satellite thermal data).

---

### 1.10 Overstory (Vegetation Intelligence)

**Entrenchment Level: LOW (utility-focused, not federal)**

- **Funding:** $43M Series B. Serving 6 of 10 largest utilities in Americas. 50+ utility customers.
- **Technology:** AI + satellite-based vegetation risk assessment. Proprietary Fuel Detection Model for utility wildfire mitigation.
- **Gaps:** Utility-focused business model. Not pursuing federal land management contracts. No USFS relationship identified.

**Displacement Difficulty: N/A.** Different market (utilities). Potential data/model source.

---

### 1.11 ICF International (USFS Digital Modernization)

**Entrenchment Level: HIGH (active prime contractor)**

- **USFS Contract:** $78M digital modernization task order (7-year term). Building WildFireSA (Enterprise Geospatial Portal Next Generation) with Xentity Corp via GSA IT Schedule.
- **FedRAMP Status:** ICF operates on FedRAMP-authorized cloud infrastructure.
- **Capabilities:** Disaster management, cloud-native geospatial technology, advanced analytics. WildFireSA went live May 2025.
- **Gaps:** ICF is a systems integrator, not a product company. They build what USFS specifies. Not developing independent AI-driven intelligence products.

**Displacement Difficulty: HIGH as a prime, but MEDIUM as a subcontractor.** ICF could be a partner rather than competitor. They need domain expertise and AI capabilities for future task orders.

---

## 2. Federal Contracting Landscape

### 2.1 Key Recent USFS IT Contract Awards

| Contract | Vendor | Value | Vehicle | Year |
|----------|--------|-------|---------|------|
| Digital Modernization (WildFireSA/EGP) | ICF + Xentity | $78M | GSA IT Schedule | 2024 |
| Remote Sensing & Geospatial Support BPA | Redcastle Resources | $80M | BPA | Recent |
| Enterprise App Dev-Solution Modernization | TechTrend (via GCL JV) | $2M | 8(a) STARS II | Recent |
| Financial Management System Support | Government Cloud Logic (Dologic + TechTrend) | $16.26M | 8(a) STARS III | 2024 |
| Application Authentication Service Support | Government Cloud Logic (Dologic + TechTrend) | $4.45M | 8(a) STARS III | 2024 |
| Wildfire Airtanker Services | 5 vendors | $7.2B | IDIQ | 2023 |
| Type 1 Helicopter Support | 38 vendors | $3.5B | IDIQ | Recent |

### 2.2 USFS IT Budget Context

- **FY2024 Forest Service discretionary:** $9.7B requested
- **FY2025 Forest Service discretionary:** $8.9B requested (+$658.5M over FY2024 CR)
- **FY2026 Forest Service discretionary:** $2.31B requested (dramatic cut; transfers wildfire to DOI)
- **FY2024 Wildfire Management total:** $6.352B regular + $670M emergency supplemental (IIJA)

### 2.3 USDA AI Spending Trends

- Federal AI contract obligations: $5.6B total FY2022-2024 across all agencies
- USDA AI spending grew +$8.2M during FY2022-2024 period
- Civilian agency AI spending grew 20% vs. Defense at 1%
- USDA exploring 3rd-party AI product testing/validation contract for FY2025
- Forest Service has dedicated Assistant Chief Data Officer (ACDO) and Chief AI Officer positions

### 2.4 Active/Emerging Solicitation Landscape

No active USFS-specific AI/data solicitations were found on SAM.gov as of March 2026. However:
- DOE issued an RFI for AI Infrastructure on Federal Lands (responses due May 2025)
- FY2026 budget proposes creation of U.S. Wildland Fire Service under DOI, which would consolidate USFS wildfire management and potentially create new procurement requirements
- USDA-DOI joint governance structure for wildfire technology integration mandated by Executive Order (September 2025)

### 2.5 SBIR Grants in Wildfire/AI Space

| Recipient | Agency | Amount | Focus |
|-----------|--------|--------|-------|
| OpalAI (FireGPT) | NASA SBIR Phase I | $155,813 | VLM for prescribed burn management and wildfire assessment |
| N5 Sensors | DHS S&T | Undisclosed | ~200 beta wildfire sensors deployed 2024 |
| MyRadar / ACME AtronOmatic | NOAA SBIR | Undisclosed | AI wildfire detection from satellite data |
| SkyTL | NOAA SBIR | Undisclosed | Wildfire spread prediction |

**Upcoming SBIR Windows:** USDA (June-August), EPA (April-June), NOAA (November-February)

---

## 3. FedRAMP Analysis

| Vendor | FedRAMP Status | Level | Implications |
|--------|---------------|-------|-------------|
| **Esri** | Authorized | Moderate (ArcGIS Online, EMCS Advanced Plus) | Gold standard for GIS in federal. Blocks competitors without FedRAMP. |
| **Palantir** | Authorized | **High** (full suite: AIP, Foundry, Gotham, Apollo) + IL5/IL6 | Most aggressive federal posture. FedStart program extends to partners. |
| **Google Cloud** | Authorized | **High** (100+ services including Vertex AI, Cloud Run) | Critical: RANGER/LMOSINT runs on GCP. Vertex AI is FedRAMP High authorized. |
| **Technosylva** | None found | N/A | Likely deployed on-premise or in non-FedRAMP environments. |
| **Pano AI** | None found | N/A | Hardware + SaaS, likely lacks FedRAMP authorization. |
| **Vibrant Planet** | Not in marketplace | N/A | Has Federal BPA but FedRAMP status unclear. Potential vulnerability. |
| **OroraTech** | None | N/A | European company, early US market entry. |
| **Rain** | N/A | N/A | Hardware company, FedRAMP not applicable. |
| **ICF** | Via cloud partners | N/A | Operates on authorized infrastructure, not a CSP. |

**Key Insight:** Google Cloud's FedRAMP High authorization for Vertex AI services is a significant advantage for LMOSINT. Since RANGER already runs on GCP (Google ADK + Gemini), LMOSINT can inherit FedRAMP High compliance posture through GCP Assured Workloads. This puts TechTrend ahead of Technosylva, Pano AI, and potentially Vibrant Planet on the compliance front.

---

## 4. TechTrend Federal's Competitive Position

### 4.1 Defensible Advantages

1. **Inside Position:** TechTrend (via Government Cloud Logic JV) already holds active USFS contracts worth $22M+. They are the "lead provider for Agile, Human-centric Design, Cloud-native Digital Services for USDA Forest Services" across multiple deputy areas (CIO-MSS, Research, NFS, Fire, Business Operations, CFO).

2. **8(a) STARS III Vehicle:** Best-in-Class (BIC) contracting vehicle designated by OMB. Provides streamlined sole-source capability for task orders up to $4.5M and competitive advantage above that threshold.

3. **GCP/FedRAMP Inheritance:** LMOSINT on Google Cloud inherits FedRAMP High authorization. Vertex AI (including Gemini) is FedRAMP High authorized as of 2024. This is a concrete compliance advantage over startups.

4. **Domain Depth:** RANGER's multi-agent architecture (Burn Analyst, Trail Assessor, NEPA Advisor, Cruising Assistant) encodes specific USFS operational workflows that no incumbent offers. Skills Library portability (ADR-005) means domain expertise is reusable across deployments.

5. **Cost Model:** Open source core + fixed-price federal deployment eliminates license fees. Compared to Esri ($10M-$30M/year), Palantir ($10M-$50M), or Technosylva ($200K-$1M/year), a $0 license + deployment services model is dramatically cheaper.

6. **White Space:** No incumbent offers AI-driven post-fire recovery intelligence synthesis. Technosylva handles active fire. Esri handles spatial data. Vibrant Planet handles landscape planning. Nobody fuses OSINT signals across domains (burn severity + trail damage + NEPA requirements + timber salvage economics + workforce planning) with transparent AI reasoning.

### 4.2 Vulnerabilities

1. **Esri Lock-in:** USFS data infrastructure is built on Esri. Any product that doesn't interoperate with ArcGIS is dead on arrival. LMOSINT must consume and produce Esri-compatible formats.

2. **Palantir's USDA Beachhead:** The "One Farmer, One File" contract gives Palantir institutional relationships within USDA. If they pivot to Forest Service workflows, they bring FedRAMP High, massive engineering resources, and established trust.

3. **Budget Uncertainty:** FY2026 proposes cutting Forest Service budget from $8.9B to $2.31B and transferring wildfire to DOI. This reshuffles procurement relationships and could delay new initiatives.

4. **Small Business Ceiling:** 8(a) STARS III has advantages but also size limitations. Scaling beyond $50M+ engagements may require teaming arrangements or graduation strategies.

5. **AI Policy Risk:** USDA's AI compliance requirements (OMB M-24-10) add overhead. The USDA Generative AI Review Board (GAIRB) must approve AI deployments. This could slow adoption.

6. **Vibrant Planet's Head Start:** Vibrant Planet already has a Federal BPA, USFS partnerships, and 4M+ acres of deployments in a similar (though not identical) problem space. They could pivot to add AI intelligence capabilities.

### 4.3 Recommended Entry Strategy

**"Intelligence Layer, Not Platform Replacement"**

1. **Phase 1 - Internal Proof:** Deploy LMOSINT as an internal tool within existing USFS contract scope (NRM modernization, Financial Management). Demonstrate cross-domain intelligence synthesis using data already flowing through TechTrend-managed systems. Cost: $0 additional to USFS (absorbed in existing contract).

2. **Phase 2 - Task Order Expansion:** Use 8(a) STARS III to issue a new task order specifically for "AI-Driven Recovery Intelligence Services" within an existing deputy area (Fire, NFS). Target $2M-$4.5M sole-source threshold. Deliver LMOSINT as a hosted service on GCP Assured Workloads (FedRAMP High).

3. **Phase 3 - Cross-Agency:** Leverage USDA-DOI joint governance mandate (September 2025 EO) to position LMOSINT as the intelligence layer for the proposed U.S. Wildland Fire Service. This is the $50M+ opportunity but requires partner teaming.

4. **Parallel Track - SBIR:** Apply for NASA, NOAA, or USDA SBIR grants for LMOSINT-specific capabilities (OSINT fusion, multi-agent coordination for land management). OpalAI's FireGPT award ($155K) validates this approach.

5. **Data Strategy:** Integrate with IRWIN (wildfire incident data), Esri ArcGIS REST APIs (spatial data), NIFC data feeds (situational awareness), and Vertex AI RAG (regulatory knowledge). Position LMOSINT as the system that makes all other systems smarter by connecting their data.

---

## 5. Market Gap Analysis

| Capability | Esri | Palantir | Technosylva | Vibrant Planet | LMOSINT Target |
|-----------|------|----------|-------------|---------------|----------------|
| Spatial visualization | Yes | Yes | Yes | Yes | Via Esri integration |
| Fire behavior modeling | No | No | Yes | No | Via Technosylva data |
| Post-fire recovery coordination | No | No | No | Partial | **Primary focus** |
| Multi-agent AI reasoning | No | No | No | No | **Primary focus** |
| NEPA compliance analysis | No | No | No | Partial | **Primary focus** |
| Timber salvage intelligence | No | No | No | No | **Primary focus** |
| Trail/infrastructure assessment | No | No | No | No | **Primary focus** |
| Cross-domain OSINT fusion | No | Partial | No | No | **Primary focus** |
| Reasoning transparency (Proof Layer) | No | No | No | No | **Primary focus** |
| FedRAMP pathway | Moderate | High | None | Unclear | High (via GCP) |
| Open source core | No | No | No | No | **Yes** |

**Bottom Line:** LMOSINT occupies a genuine white space. No incumbent offers AI-driven post-fire recovery intelligence with multi-agent reasoning transparency. The risk is not incumbents doing what LMOSINT does -- it's incumbents adding "AI features" to their existing platforms that are "good enough" for risk-averse federal buyers. Speed to deployment and demonstrated value within existing USFS contracts is the best defense against this risk.

---

## Sources

- [Esri FedRAMP Authorization](https://www.esri.com/about/newsroom/announcements/esris-arcgis-online-earns-fedramp-moderateauthorization-expanding-value-for-users)
- [Palantir FedRAMP High Authorization](https://investors.palantir.com/news-details/2024/Palantir-Granted-FedRAMP-High-Baseline-Authorization/)
- [ICF USFS $78M Task Order](https://www.prnewswire.com/news-releases/us-forest-service-selects-icf-for-new-78-million-digital-modernization-task-order-302011788.html)
- [ICF WildFireSA Modernization](https://www.icf.com/clients/disaster-management/enterprise-geospatial-portal-usfs-wildfiresa)
- [Government Cloud Logic $16M Award](https://orangeslices.ai/contract-award-16m-usda-fs-financial-management-system-support-services-task/)
- [Technosylva USFS Fire Lab](https://technosylva.com/solutions/fire-agencies/)
- [Pano AI $100M Contracts](https://www.thefoundersmagazine.com/pano-ai/)
- [Vibrant Planet Platform](https://www.vibrantplanet.net/platform)
- [OroraTech US Expansion](https://www.businesswire.com/news/home/20250424423291/en/OroraTech-Brings-Worlds-Largest-Wildfire-Satellite-Constellation-to-the-United-States)
- [OpalAI FireGPT SBIR](https://www.sbir.gov/awards/211988)
- [Google Cloud FedRAMP](https://cloud.google.com/security/compliance/fedramp)
- [Palantir USDA One Farmer One File](https://www.thefencepost.com/news/usda-to-develop-one-farmer-one-file-with-palantir/)
- [CAL FIRE Wildfire Technology](https://www.fire.ca.gov/what-we-do/wildfire-technology)
- [USFS FY2026 Budget Justification](https://www.fs.usda.gov/sites/default/files/fs-fy26-congressional-budget-justification.pdf)
- [Planscape Open Source](https://nature.berkeley.edu/news/2024/12/open-source-platform-empowers-communities-tackle-wildfire-crisis)
- [TechTrend USFS Modernization](https://techtrend.us/blog/2021/12/29/usda-forest-service-modernization/)
- [USFS Enterprise App Dev Award](https://fedciv.g2xchange.com/usda-forest-service-awards-enterprise-application-development-solution-modernization-support-task/)
- [Dologic GCL JV STARS III](https://www.dologic.com/2022/08/17/government-cloud-logic-llc-joint-venture-wins-8a-stars-iii-gwac-contract/)
- [FedRAMP 20x AI Initiative](https://www.gsa.gov/about-us/newsroom/news-releases/gsa-fedramp-prioritize-20x-authorizations-for-ai-08252025)
