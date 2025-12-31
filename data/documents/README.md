# Documents

This folder is reserved for NEPA documents, reports, and reference materials for future phases.

## Current Status: Empty (Phase 1)

Phase 1 uses hardcoded context in the NEPA Advisor agent prompts. No actual documents are processed.

## Future Use (Phase 2+)

This folder will contain:
- NEPA Environmental Assessments (EA)
- Categorical Exclusion (CE) documentation
- BAER (Burned Area Emergency Response) reports
- Timber sale prospectuses
- Forest Management Plans
- ESA consultation documents

## Document Types

| Document | Source | Use Case |
|----------|--------|----------|
| NEPA EA/EIS | USFS NEPA database | Compliance guidance |
| BAER Reports | USFS BAER program | Post-fire assessment |
| Timber Appraisals | USFS timber program | Salvage valuation |
| Species Lists | USFWS | ESA compliance |

## RAG Integration

In Phase 2+, these documents will be:
1. Parsed and chunked for embedding
2. Stored in a vector database (Pinecone, Weaviate, etc.)
3. Retrieved by agents for grounded responses
4. Cited in agent outputs with page/section references

## Notes

All documents should be public domain or properly licensed. Never commit sensitive or restricted USFS documents.

---

## Glossary

| Acronym | Full Name | Description |
|---------|-----------|-------------|
| **BAER** | Burned Area Emergency Response | USFS post-fire emergency program |
| **CE** | Categorical Exclusion | NEPA category for minimal-impact actions |
| **EA** | Environmental Assessment | NEPA environmental review document |
| **EIS** | Environmental Impact Statement | Full NEPA environmental analysis |
| **ESA** | Endangered Species Act | Federal species protection law |
| **NEPA** | National Environmental Policy Act | Federal environmental assessment law |
| **RAG** | Retrieval-Augmented Generation | AI pattern combining retrieval + LLM |
| **USFWS** | U.S. Fish and Wildlife Service | Federal wildlife management agency |

→ **[Full Glossary](../../docs/GLOSSARY.md)**
