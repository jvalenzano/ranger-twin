# Scripts

Utility scripts for development, testing, and deployment.

## Scripts

| Script | Purpose |
|--------|---------|
| `deploy-frontend.sh` | Deploy Command Console to Cloud Run |
| `test-frontend-local.sh` | Run frontend tests locally |
| `test-integration.py` | Run integration tests against agents |
| `verify-adk.py` | Verify ADK installation and agent loading |
| `hygiene-cleanup.sh` | Documentation hygiene and cleanup |

## Usage

### Deployment

```bash
# Deploy frontend to Cloud Run
./scripts/deploy-frontend.sh
```

### Testing

```bash
# Verify ADK agents load correctly
python scripts/verify-adk.py

# Run integration tests
python scripts/test-integration.py
```

### Development

```bash
# Run local frontend tests
./scripts/test-frontend-local.sh
```

## Prototypes

The `prototypes/` subdirectory contains experimental scripts and proof-of-concept code that may be promoted to production.

## References

- **Runbooks:** `docs/runbooks/` for operational procedures
- **Testing:** `docs/testing/` for test documentation
