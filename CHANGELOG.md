# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-30

### Added
- **Skills-First Architecture**: Established a new architectural paradigm where domain expertise is encapsulated in portable `skill.md` packages.
- **Multi-Agent Coordination**: Implemented a "Maestro" pattern with a `Recovery Coordinator` managing four specialist agents:
    - `Burn Analyst`: Fire severity and boundary mapping.
    - `Trail Assessor`: Infrastructure damage and closure decisions.
    - `Cruising Assistant`: Timber volume and salvage assessment.
    - `NEPA Advisor`: Regulatory compliance and pathway decision-making.
- **AgentTool Pattern**: Optimized specialist orchestration by calling specialists as tools, preserving coordinator control and enabling cross-domain synthesis.
- **Progressive Proof Layer**: Integrated transparent reasoning chains, confidence scores, and data citations (MTBS, TRACS, FSVeg) into agent responses.
- **Vertex AI RAG Integration**: Migrated knowledge base infrastructure to Vertex AI RAG Engine across four domain-specific corpora.
- **Cloud Run Deployment**: Established a serverless production environment on Google Cloud Run with SSE streaming support.
- **Tactical Command Console**: A data-dense, dark-mode React interface for forest supervisors and field rangers.
- **Fixture-First Development**: Created a high-fidelity simulation environment using real federal data from the 2022 Cedar Creek Fire.

### Changed
- **Authentication**: Standardized on Vertex AI Application Default Credentials (ADC), eliminating the need for static API keys.
- **LLM Standardization**: Focused entirely on Google Gemini 2.0 Flash for all reasoning and generation tasks.
- **Branch Structure**: Transitioned to a clean `main`/`develop` branch model for stable releases and active development.

### Fixed
- **Infinite Loop Resolution**: Fixed a critical infinite loop bug in tool invocation by transitioning from `mode="ANY"` to a structured `mode="AUTO"` with a validation loop.
- **Data Provenance**: Ensured all agent responses include accurate citations to authoritative federal sources.

### Verified
- **100% Validation Pass Rate**: All 600+ agent and skill tests passing on GCP `ranger-twin-dev` environment.
- **SSE Streaming**: Verified real-time event streaming from Cloud Run to the Command Console.

[0.1.0]: https://github.com/TechTrend/ranger-twin/releases/tag/v0.1.0
