# USFS Field Personnel Research - Interview Materials

**Project:** RANGER - Post-Fire Forest Recovery Orchestration Platform
**Purpose:** Understand current USFS workflows to design effective field data collection integrations
**Last Updated:** 2025-12-21

---

## 1. Interview Request Email Template

### Subject Line Options:
- "Research Request: Post-Fire Field Data Collection Workflows"
- "Brief Interview Request - Forest Recovery Technology Research"
- "USFS Field Operations Research - 30-Minute Interview"

### Email Body:

```
Dear [Name],

My name is [Your Name], and I'm working on RANGER, a technology initiative
focused on improving post-fire forest recovery operations through better
coordination of field data and multi-agency workflows.

I'm reaching out because your experience with [field data collection / TRACS /
FSVeg / trail assessment / timber cruising] would provide valuable insights
for our research. We're conducting stakeholder interviews to understand current
workflows, tools, and challenges before designing any new integrations.

RANGER Project Context:
RANGER is an orchestration platform designed to coordinate post-fire assessment
data across burn severity analysis, trail damage assessment, timber cruising,
and NEPA compliance workflows. Our goal is to reduce duplicate data entry,
improve field-to-office coordination, and maintain compatibility with existing
USFS systems like TRACS and FSVeg.

What We're Asking:
- 30-45 minute interview (phone, video call, or in-person)
- Discussion of your current field data collection process
- Feedback on pain points and integration opportunities
- No preparation required - just sharing your experience

Interview Format:
- Semi-structured conversation about your current workflows
- All feedback kept confidential unless you authorize attribution
- Recording only with your explicit permission
- Notes will be shared with you for review before use

Your expertise would be invaluable in ensuring any technology improvements
actually serve the people doing the work in the field. Would you be available
for a brief conversation in the next few weeks?

Proposed Times:
[List 3-4 specific time slots across different days/times]

Or feel free to suggest times that work better for your schedule.

Thank you for considering this request. Please let me know if you have any
questions about the project or interview process.

Best regards,
[Your Name]
[Your Title/Affiliation]
[Contact Information]
[Project Website/Documentation Link if available]
```

---

## 2. Field Personnel Interview Guide

**Target Roles:** Silviculturists, Timber Cruisers, Trail Crew Leads, Fire Staff, Wildlife Biologists

**Time Commitment:** 30-45 minutes

### Introduction (5 minutes)

**Opening:**
"Thank you for taking the time to speak with me. This interview is about understanding how field data collection currently works for post-fire recovery operations. There are no right or wrong answers - I'm here to learn from your experience. Everything you share will help us design tools that actually work for field conditions and your real workflows."

**Consent:**
- "Is it okay if I take notes during our conversation?"
- "Would you be comfortable with audio recording? (Optional - notes only is fine)"
- "Can I follow up with clarifying questions via email if needed?"

### Current Workflow Questions (15 minutes)

**1. Role and Experience**
- What's your current role and primary responsibilities?
- How many years have you worked in post-fire recovery operations?
- Which forest(s) or district(s) do you typically work in?

**2. Field Data Collection Overview**
- Can you walk me through a typical post-fire assessment you conduct?
- What types of data are you collecting in the field? (e.g., GPS points, species counts, damage ratings, photos)
- What does a "day in the field" look like from data collection perspective?

**3. Current Tools and Technology**
- What apps or tools do you use for field data collection?
  - Mobile apps? Paper forms? GPS units? Tablets?
  - If using apps: Which specific apps? (ArcGIS Collector, Fulcrum, Survey123, etc.)
- How do you currently record:
  - Location data (GPS coordinates)?
  - Photos and attachments?
  - Measurements (DBH, height, plot data)?
  - Condition assessments (damage severity, hazard ratings)?

**4. Data Flow and Integration**
- After you collect data in the field, what happens next?
- How does field data get into TRACS, FSVeg, or other systems?
- Do you enter the data yourself or hand it off to someone?
- How long does it typically take for field data to reach the office systems?

### Pain Points and Challenges (10 minutes)

**5. Current Frustrations**
- What's the most frustrating part of your current field data workflow?
- Where do you experience delays or bottlenecks?
- Have you ever lost data? What happened?
- What tasks do you feel like you're doing twice or unnecessarily?

**6. Connectivity and Offline Work**
- How often do you have cell/internet connectivity in your work areas?
- What percentage of your fieldwork is in areas with no connectivity?
- How do your current tools handle offline data collection?
- What happens when you need to sync data after days in the backcountry?

**7. Coordination and Communication**
- How do you coordinate with other teams (fire, trails, timber, wildlife)?
- Do different teams ever collect overlapping data on the same areas?
- How do you communicate findings back to the office during multi-day field assignments?

### Wishlist and Future Needs (8 minutes)

**8. Ideal Tool Features**
- If you could design the perfect field data collection tool, what would it do?
- What features from consumer apps (Google Maps, iPhone Camera, etc.) do you wish were in field tools?
- What would save you the most time in your current process?

**9. Integration Priorities**
- What existing systems must any new tool integrate with?
- What data formats do you typically work with? (Shapefiles, GeoJSON, CSV, photos)
- Are there specific workflows that absolutely cannot change due to regulations or safety?

**10. Training and Adoption**
- How comfortable is your team with learning new technology?
- What would make adopting a new tool easier or harder?
- How much training time is realistic for new field tools?

### Closing (2 minutes)

**11. Follow-Up**
- Is there anyone else you'd recommend I speak with about these workflows?
- Can I follow up with you if I have clarifying questions?
- Would you be interested in seeing prototypes or demos as the project progresses?

**Thank You:**
"This has been incredibly helpful. Your insights will directly inform how we design integrations that work for actual field conditions. I'll send you a summary of my notes for your review. Thank you again for your time."

---

## 3. IT/GIS Staff Interview Guide

**Target Roles:** Forest IT Staff, GIS Specialists, Data Managers, Enterprise Architecture

**Time Commitment:** 45-60 minutes

### Introduction (5 minutes)

**Opening:**
"Thank you for meeting with me. I'm researching integration opportunities between field data collection tools and existing USFS enterprise systems like TRACS and FSVeg. Your technical expertise will help us understand what's feasible and what integration patterns work best with current infrastructure."

**Consent:**
- Note-taking and recording permissions
- Technical documentation sharing (if available)
- Follow-up contact approval

### System Architecture Questions (15 minutes)

**1. Role and System Responsibility**
- What systems do you manage or support?
- How long have you worked with TRACS/FSVeg/[other relevant systems]?
- What's your role in post-fire data workflows?

**2. Current System Landscape**
- Can you describe the data flow from field collection to TRACS and FSVeg?
- What systems feed data into TRACS and FSVeg?
- Are there existing APIs or integration points available?
- What's the current tech stack? (Databases, middleware, authentication)

**3. Data Formats and Standards**
- What data formats does TRACS/FSVeg accept? (XML, JSON, CSV, Shapefiles, GeoJSON)
- Are there required schemas or data dictionaries?
- How are spatial data (GPS coordinates) typically handled?
- What metadata is required for submitted data?

**4. Authentication and Authorization**
- How do external systems authenticate with TRACS/FSVeg?
- Are there API keys, OAuth, or other auth mechanisms?
- What level of access control exists? (User-level, role-level, forest-level)
- Are there different permission levels for reading vs. writing data?

### Integration Requirements (15 minutes)

**5. Technical Constraints**
- What are the main technical limitations for external integrations?
- Are there rate limits, data size limits, or batch processing requirements?
- What network security requirements exist? (VPN, whitelisting, certificates)
- Are cloud-hosted solutions allowed or does everything need to be on-prem?

**6. Data Quality and Validation**
- What data validation happens before data enters TRACS/FSVeg?
- Are there required quality checks or business rules?
- How are errors and validation failures handled?
- Who is responsible for data quality - the source system or the destination?

**7. Existing Integration Patterns**
- What integration patterns work best with your systems? (REST APIs, file drops, message queues)
- Are there existing successful integrations I should learn from?
- What integration approaches have failed or caused problems?
- Is there an enterprise service bus or integration middleware?

**8. Development and Testing**
- Is there a sandbox or test environment available for integration development?
- How can developers get test credentials and sample data?
- What's the process for moving from test to production?
- Are there staging environments or phased rollout capabilities?

### Operational Considerations (10 minutes)

**9. Monitoring and Support**
- How are integrations monitored for health and errors?
- What logging and error reporting is available?
- Who supports integrations when issues arise?
- What's the escalation process for integration problems?

**10. Change Management**
- How often do TRACS/FSVeg APIs or schemas change?
- How are breaking changes communicated to integration partners?
- What's the deprecation policy for old integration methods?
- How much advance notice is given for system updates?

**11. Compliance and Security**
- What security certifications or compliance frameworks apply? (FedRAMP, FISMA, etc.)
- Are there data residency requirements (must stay in US, must be on gov servers)?
- What about PII or sensitive data handling requirements?
- Are there required security reviews or ATOs needed?

### Future Direction (10 minutes)

**12. Roadmap and Modernization**
- Are there plans to modernize TRACS/FSVeg integration capabilities?
- Is the agency moving toward cloud-native or API-first architectures?
- What integration technologies are being encouraged vs. deprecated?
- Are there enterprise-wide initiatives we should align with?

**13. Documentation and Resources**
- What technical documentation is available? (API docs, schemas, integration guides)
- Are there developer portals or onboarding resources?
- Who should I contact for specific technical questions?
- Are there forums or communities for integration developers?

### Closing (5 minutes)

**14. Recommendations**
- Based on your experience, what integration approach would you recommend for a new field data tool?
- What mistakes do you see other integration projects make?
- Are there any "gotchas" or undocumented requirements I should know about?

**15. Follow-Up**
- Can I reach out with technical questions as development progresses?
- Would you be willing to review integration architecture proposals?
- Are there specific documentation artifacts I should request formally?

**Thank You:**
"Your insights on the technical landscape are invaluable. Understanding the real integration constraints early will save significant time and effort. I appreciate you sharing both the official processes and the practical realities."

---

## 4. Interview Notes Template

**Copy this template for each interview session:**

---

### Interview Metadata

**Date:** [YYYY-MM-DD]
**Time:** [Start - End]
**Interviewer:** [Your Name]
**Interviewee:** [Name]
**Role/Title:** [Title]
**Organization:** [Forest/District/Office]
**Years of Experience:** [Number]
**Interview Type:** [ ] Field Personnel  [ ] IT/GIS Staff  [ ] Other: ________
**Recording:** [ ] Yes (with consent)  [ ] No (notes only)

---

### Key Background

**Primary Responsibilities:**
[Brief description of interviewee's role and duties]

**Relevant Experience:**
[Post-fire work, specific systems used, geographic area covered]

---

### Current Workflows

**Field Data Collection Process:**
[Step-by-step description of how they currently collect data]

**Tools and Technology Used:**
- **Mobile Apps:** [List apps and usage]
- **Hardware:** [GPS units, tablets, cameras, etc.]
- **Paper Forms:** [Which forms, when used]
- **Other:** [Field notes, voice recording, etc.]

**Data Types Collected:**
- [ ] GPS coordinates
- [ ] Photos
- [ ] Measurements (DBH, height, etc.)
- [ ] Condition assessments
- [ ] Species data
- [ ] Other: [List]

**Data Flow to Enterprise Systems:**
[How field data reaches TRACS, FSVeg, GIS systems]

---

### Pain Points Identified

**Top Frustrations (Ranked):**
1. [Most critical pain point]
2. [Second priority]
3. [Third priority]

**Connectivity Challenges:**
[Offline work percentage, sync issues, data loss incidents]

**Duplicate Work / Inefficiencies:**
[Tasks done multiple times, manual re-entry, coordination gaps]

**Lost or Delayed Data:**
[Specific incidents, impact, frequency]

---

### Technical Requirements (IT/GIS Interviews)

**Systems and Architecture:**
- **Primary Systems:** [TRACS, FSVeg, others]
- **Integration Points:** [APIs, file drops, databases]
- **Authentication:** [Methods used]
- **Data Formats:** [Required formats and schemas]

**Constraints and Limitations:**
- **Technical:** [Rate limits, size limits, network requirements]
- **Security:** [Compliance frameworks, data residency]
- **Process:** [Change management, approval workflows]

**Available Resources:**
- **Sandbox/Test Environments:** [Yes/No, access process]
- **Documentation:** [API docs, schemas, integration guides]
- **Support Contacts:** [Who to reach for technical questions]

---

### Wishlist and Opportunities

**Desired Features:**
1. [Feature request or capability gap]
2. [Second priority]
3. [Third priority]

**Integration Opportunities:**
- [Specific system or workflow that could be integrated]
- [Data sharing opportunity between teams]
- [Automation potential]

**Quick Wins:**
[Low-effort, high-impact improvements identified]

---

### Quotes and Insights

**Notable Quotes:**
> "[Verbatim quote capturing key insight]"
> - Context: [When this was said and why it matters]

> "[Another significant quote]"
> - Context: [Explanation]

**Key Insights:**
- [Important realization or pattern identified]
- [Unexpected finding or contradiction to assumptions]
- [Critical success factor for adoption]

---

### Follow-Up Items

**Questions for Clarification:**
- [ ] [Question 1]
- [ ] [Question 2]

**Additional Contacts Recommended:**
- [Name, Role, Why recommended]
- [Name, Role, Why recommended]

**Documentation to Request:**
- [ ] [Specific document or resource]
- [ ] [Schema or API documentation]

**Prototype/Demo Interest:**
- [ ] Yes, wants to see prototypes
- [ ] Yes, willing to participate in user testing
- [ ] No, too busy
- [ ] Maybe later in project

---

### Integration Design Implications

**Must-Have Requirements:**
[Non-negotiable technical or process requirements identified]

**Nice-to-Have Features:**
[Desirable but not critical capabilities]

**Red Flags / Risks:**
[Potential blockers, political issues, technical constraints]

**Alignment with RANGER:**
[How insights map to current RANGER architecture and roadmap]

---

### Next Steps

**Immediate Actions:**
- [ ] Send thank-you email with notes for review
- [ ] Request additional documentation: [List]
- [ ] Schedule follow-up with: [Contact]
- [ ] Share findings with team
- [ ] Update research synthesis document

**Long-Term Follow-Up:**
- [ ] Include in prototype testing group
- [ ] Invite to demo sessions
- [ ] Share final integration architecture
- [ ] Request feedback on implementation

---

### Interviewer Reflections

**What Surprised Me:**
[Unexpected findings or challenges to assumptions]

**Most Valuable Insight:**
[Single most important takeaway from this interview]

**How This Changes RANGER Design:**
[Specific architectural or feature decisions influenced]

---

**Notes Reviewed by Interviewee:** [ ] Yes  [ ] No  [ ] Pending
**Review Date:** [YYYY-MM-DD]
**Corrections/Additions:** [Any changes requested by interviewee]

---

## Research Synthesis Process

After conducting multiple interviews, synthesize findings:

### 1. Pattern Identification
- Common pain points across multiple interviewees
- Conflicting requirements between different roles
- Unanimous feature requests or concerns

### 2. Priority Matrix
Create a 2x2 matrix of:
- **High Value, Low Effort:** Quick wins to implement first
- **High Value, High Effort:** Strategic priorities requiring planning
- **Low Value, Low Effort:** Nice-to-haves if time permits
- **Low Value, High Effort:** Deprioritize or avoid

### 3. Integration Architecture Updates
Document how research findings impact:
- Field Companion PWA feature set
- API Gateway integration points
- Data synchronization strategy
- Offline-first architecture decisions

### 4. Stakeholder Communication
- Summary report for USFS contacts (sanitized, professional)
- Internal team briefing with technical implications
- Executive summary for project sponsors
- Public-facing research insights (if appropriate)

---

## Interview Ethics and Best Practices

### Confidentiality
- Default to anonymous attribution unless explicit permission given
- Sanitize forest/district names if interviewee requests
- Protect critical/sensitive operational details
- Do not share political or personnel complaints outside research team

### Respect for Time
- Start and end on time
- Send questions in advance if possible
- Offer to pause for urgent work interruptions
- Provide written summary within 48 hours

### Bias Awareness
- Don't lead questions toward desired answers
- Challenge your own assumptions
- Seek disconfirming evidence
- Listen for what's NOT being said

### Cultural Sensitivity
- Respect USFS organizational culture and terminology
- Acknowledge field crews' expertise and experience
- Don't position technology as "fixing" people - it's fixing tools
- Recognize political dynamics of technology adoption

---

## Contact Log

Track all outreach and interview coordination:

| Date | Contact Name | Role | Organization | Status | Next Action |
|------|-------------|------|--------------|--------|-------------|
| [Date] | [Name] | [Role] | [Forest/Office] | [Requested/Scheduled/Completed] | [Follow-up needed] |
| | | | | | |
| | | | | | |

**Legend:**
- **Status:** Requested, Declined, Scheduled, Completed, Follow-up Pending
- **Next Action:** Send reminder, Schedule call, Send notes, Request docs, etc.

---

## Appendix: Sample Follow-Up Email

### Subject: Interview Notes for Review - RANGER Research

```
Hi [Name],

Thank you again for taking the time to speak with me [yesterday/last week] about
post-fire field data workflows. Your insights were incredibly valuable.

I've attached my notes from our conversation for your review. Please let me know if:
- I've misrepresented anything you said
- You'd like any corrections or clarifications
- There's anything you'd prefer kept off the record
- You have any additional thoughts after reflecting on our discussion

No response needed if everything looks accurate.

I'll be synthesizing findings from multiple interviews over the next few weeks.
If you're interested, I'm happy to share high-level themes we're discovering
across the research.

[If they expressed interest in prototypes:]
I'll also keep you posted on prototype development and reach out when we have
something ready for user testing.

Thanks again for your time and expertise.

Best,
[Your Name]
```

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-12-21 | Initial interview materials created | [Author] |
| | | | |

---

**End of Interview Materials**
