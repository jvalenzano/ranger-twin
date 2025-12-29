# Validation Issues (2025-12-30)

## [FIXED] Leaked API Key in Production Coordinator
- **Status**: Resolved (2025-12-30)
- **Discovery Date**: 2025-12-30
- **Component**: Coordinator Service Backend
- **Impact**: Total system failure. The coordinator cannot process queries.
- **Error Details**: `403 PERMISSION_DENIED: Your API key was reported as leaked. Please use another API key.`
- **Diagnostic**: The `google-adk` backend is attempting to use a Google API Key that has been flagged as compromised.
- **Recommended Action**: Rotate the `GOOGLE_API_KEY` for the `ranger-coordinator` service. Update environment variables in GCP Cloud Run.
