# Cedar Creek Digital Twin

**Purpose:** Unified data platform and microservices for forest management and AI analysis.

## Monorepo Architecture

This repository uses a modular microservices pattern:

- `apps/`: Frontend applications (React/Vite).
- `services/`: Backend microservices (FastAPI).
- `packages/`: Shared libraries (Python/TypeScript).
- `infrastructure/`: Terraform IaC for GCP.
- `data/`: Digital twin data (managed via Git LFS).
- `scripts/`: Development and deployment utilities.
- `docs/`: Technical documentation and ADRs.

## Quick Start

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/jvalenzano/cedar-creek-twin.git
    cd cedar-creek-twin
    ```
2.  **Environment Setup:**
    ```bash
    cp .env.example .env
    # Edit .env with your credentials
    ```
3.  **Install Dependencies:**
    ```bash
    pnpm install
    pip install -e packages/twin-core
    ```
4.  **Local Run:**
    ```bash
    docker-compose up -d
    ```

## License

Internal / USDA FS Portfolio Demo
