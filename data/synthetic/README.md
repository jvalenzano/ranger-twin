# Synthetic Data

This folder is reserved for AI-generated and simulated data for testing and development.

## Current Status: Empty (Phase 1)

Phase 1 uses hand-crafted fixture data in `data/fixtures/cedar-creek/`.

## Future Use (Phase 2+)

This folder will contain:
- LLM-generated trail damage reports
- Synthetic timber cruise data for testing
- Simulated sensor readings
- Generated NEPA document excerpts
- Test scenarios for edge cases

## Purpose

Synthetic data allows us to:
1. Test agent behavior without real data dependencies
2. Generate diverse scenarios for demo purposes
3. Create training data for future ML models
4. Stress-test the system with edge cases

## Generation Methods

| Data Type | Generation Method |
|-----------|-------------------|
| Trail Reports | LLM (Gemini/Claude) with templates |
| Timber Data | Statistical models based on real distributions |
| Sensor Data | Time-series simulation |
| Documents | LLM with domain-specific prompts |

## Notes

Synthetic data should be clearly labeled and never mixed with real data in production.
