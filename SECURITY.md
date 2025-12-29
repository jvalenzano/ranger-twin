# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅                 |
| < 1.0   | ❌ (pre-release)   |

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Please report security vulnerabilities to: **security@techtrend.federal** (or appropriate contact)

**Response Timeline:**
- Acknowledgment: Within 48 hours
- Initial assessment: Within 5 business days
- Resolution timeline: Communicated after assessment

**Include in your report:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)
- Your contact information for follow-up

## Security Practices

### Secret Management

| Practice | Status | Notes |
|----------|--------|-------|
| Secrets in environment variables | ✅ Implemented | See `.env.example` for required variables |
| `.env` files gitignored | ✅ Implemented | Only `.env.example` templates committed |
| No hardcoded credentials | ✅ Verified | Automated checks recommended |
| GCP Secret Manager (production) | 📋 Planned | Phase 2 deployment |

**Gitignored sensitive files:**
```
.env
.env.local
agents/*/data/.vertex_rag_config.json  # Contains GCP resource IDs
**/.nepa_store_config.json             # Legacy, being removed
```

### Dependency Management

| Practice | Status | Notes |
|----------|--------|-------|
| Dependencies from trusted sources | ✅ Implemented | PyPI, npm registry only |
| Version constraints | ⚠️ Partial | `requirements.txt` uses `>=` not `==` |
| Manual audits | ✅ Available | Run `pip-audit` and `npm audit` locally |
| Automated CI scanning | 📋 Planned | GitHub Actions workflow to be added |

**Manual audit commands:**
```bash
# Python dependencies
pip install pip-audit
pip-audit

# Node dependencies
cd apps/command-console && npm audit
```

### Authentication & Authorization

| Layer | Current (Phase 1) | Production (Phase 2+) |
|-------|-------------------|----------------------|
| Local development | Application Default Credentials (ADC) | Same |
| GCP service-to-service | Google Cloud IAM | Same + Workload Identity |
| User authentication | None (demo mode) | USDA eAuth / Google Identity Platform |
| API authorization | None (open endpoints) | OAuth 2.0 / API keys |

### Data Protection

| Practice | Status | Notes |
|----------|--------|-------|
| HTTPS/TLS in transit | ✅ Enforced | Cloud Run enforces HTTPS |
| GCS bucket security | ✅ Configured | Uniform bucket-level access |
| No PII in fixtures | ✅ Verified | Cedar Creek data is public/synthetic |
| No PII in logs | ✅ Policy | Structured logging without user data |

### Frontend Security Considerations

The Command Console frontend includes a browser-accessible API key:

```
VITE_GEMINI_API_KEY=...
```

**This is intentional for Phase 1 demo purposes.** The key is:
- Restricted to Gemini API only (no GCP resource access)
- Rate-limited by Google
- Intended for replacement with backend proxy in Phase 2

**Phase 2 mitigation:** All LLM calls will route through authenticated backend endpoints.

### MCP Server Security

MCP (Model Context Protocol) servers expose data endpoints:

| Server | Port | Access Control |
|--------|------|----------------|
| MCP Fixtures | 8080 | None (localhost only in dev) |
| Production MCP | Cloud Run | IAM + Cloud Run authentication |

**Development:** MCP servers bind to localhost only.
**Production:** Cloud Run services require authentication via `--no-allow-unauthenticated`.

### Compliance Posture

| Requirement | Status | Notes |
|-------------|--------|-------|
| FedRAMP High path | ✅ Architecture | Built on FedRAMP High authorized services |
| Vertex AI compliance | ✅ Inherited | Vertex AI is FedRAMP High authorized |
| Audit logging | 📋 Planned | GCP Cloud Audit Logs to be enabled |
| Data residency | ✅ Configured | All resources in `europe-west3` (EU) or `us-central1` |

**Note:** RANGER itself is not yet FedRAMP authorized. The architecture is designed to facilitate future authorization by using only FedRAMP-authorized underlying services.

## Security Checklist for Contributors

### Before Every Commit

- [ ] No secrets, API keys, or credentials in code
- [ ] No secrets in commit messages
- [ ] Sensitive files are in `.gitignore`

### Before Every PR

- [ ] Dependencies from trusted sources (PyPI, npm) only
- [ ] New dependencies reviewed for security advisories
- [ ] Input validation on any new user-facing endpoints
- [ ] Error messages don't leak sensitive information (stack traces, paths)
- [ ] No new `eval()`, `exec()`, or dynamic code execution

### Periodic Reviews

- [ ] Run `pip-audit` on Python dependencies
- [ ] Run `npm audit` on Node dependencies
- [ ] Review GCP IAM permissions for least privilege
- [ ] Check for unused service accounts

## Incident Response

In the event of a security incident:

1. **Contain:** Revoke compromised credentials immediately
2. **Assess:** Determine scope and impact
3. **Notify:** Contact security lead and affected parties
4. **Remediate:** Fix vulnerability, rotate credentials
5. **Document:** Record incident details and lessons learned

**Emergency credential rotation:**
```bash
# Revoke and regenerate Google API key
# https://console.cloud.google.com/apis/credentials

# Rotate GCP service account keys
gcloud iam service-accounts keys create new-key.json \
  --iam-account=SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com
```

## References

- [ADR-006: Google-Only LLM Strategy](docs/adr/ADR-006-google-only-llm-strategy.md) — API key management
- [ADR-010: Vertex RAG Migration](docs/adr/ADR-010-vertex-rag-migration.md) — Knowledge base security
- [Google Cloud Security](https://cloud.google.com/security) — GCP security documentation
- [FedRAMP Marketplace](https://marketplace.fedramp.gov/) — Verify service authorizations

---

*Last reviewed: December 2025*
*Next review: Before Phase 2 deployment*