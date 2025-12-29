# Contributing to RANGER

## Development Setup

See [Local Development Guide](docs/onboarding/LOCAL-DEVELOPMENT-GUIDE.md)

## Branch Naming

```
feature/  - New features (feature/nepa-rag-integration)
fix/      - Bug fixes (fix/coordinator-routing)
docs/     - Documentation only (docs/update-readme)
refactor/ - Code refactoring (refactor/skill-loader)
test/     - Test additions (test/burn-analyst-coverage)
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add NEPA pathway decision skill
fix: resolve coordinator infinite loop
docs: update ADR-010 with migration notes
test: add burn analyst integration tests
refactor: extract common skill loader
chore: update dependencies
```

## Pull Request Process

1. Create feature branch from `develop`
2. Make changes with atomic commits
3. Run tests: `pytest agents/ -v`
4. Run linting: `ruff check .`
5. Update documentation if needed
6. Create PR with description of changes
7. Request review from team member
8. Squash and merge after approval

## Code Style

### Python
- Follow PEP 8
- Use type hints
- Docstrings for public functions (Google style)
- Format with `black` (line length 100)
- Lint with `ruff`

### TypeScript/React
- ESLint + Prettier configuration in `apps/command-console`
- Functional components with hooks
- Props interfaces defined

## Architecture Decisions

Significant changes require an ADR:
1. Copy `docs/adr/template.md`
2. Number sequentially (ADR-XXX)
3. Get team review before implementing

## Testing Requirements

- New features require tests
- Bug fixes require regression tests
- Maintain >80% coverage on agent code
- Integration tests for cross-agent workflows

## Questions?

- Check existing [ADRs](docs/adr/) for architectural context
- Review [PRODUCT-SUMMARY.md](docs/_!_PRODUCT-SUMMARY.md) for product vision
- Ask in team channel
