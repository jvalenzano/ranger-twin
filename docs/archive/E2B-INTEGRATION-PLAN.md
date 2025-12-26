# E2B Sandbox Integration Plan for RANGER

> **⚠️ ARCHIVED - 2025-12-22**
>
> This plan was evaluated and **not adopted** based on expert panel review. Key reasons:
> - **FedRAMP Compliance**: E2B has no FedRAMP authorization, blocking government deployment
> - **Unnecessary Complexity**: RANGER's agents use tool calling, not code generation - sandboxes solve a problem we don't have
> - **Latency Concerns**: Code agents add 2-4 seconds per invocation vs. sub-second tool calls
> - **Framework Impedance**: Hybrid ADK + SmolAgents creates debugging complexity without clear benefit
>
> **Current Architecture**: Pure Google ADK with ToolCallingAgents on GCP. See `docs/architecture/AGENTIC-ARCHITECTURE.md`.
>
> This document is preserved for historical reference and future reconsideration if requirements change.

---

**Status:** ~~Planning~~ **ARCHIVED**
**Created:** 2025-12-22
**Archived:** 2025-12-22
**Author:** RANGER Team
**Purpose:** Define comprehensive strategy for integrating E2B sandboxes as the execution environment for RANGER's multi-agent orchestration system

---

## Executive Summary

This document outlines the integration of [E2B](https://e2b.dev) as RANGER's agent sandbox environment, directly implementing IndyDevDan's **"Agent Sandboxes" bet** for 2026. E2B provides secure, isolated cloud environments where RANGER's specialist agents can execute code, analyze data, and perform computational tasks without risk to the host system.

**Key Strategic Alignment:**
- ✅ **Trust through isolation**: Agents run in sandboxed VMs with hardware-level security
- ✅ **Multi-agent orchestration**: Each agent gets its own compute environment
- ✅ **Tool calling at scale**: Sandboxes enable long chains of tool executions
- ✅ **Deferred trust verification**: "Best of N" pattern with parallel sandbox execution

**Bottom Line:** E2B transforms RANGER from a **monolithic agent system** to a **distributed, multi-agent platform** where specialist agents operate in isolated, auditable environments.

---

## What is E2B?

### Core Capabilities

E2B (Execution Environment 2B) is an open-source platform that provides:

1. **Secure Code Execution Sandboxes**
   - Firecracker microVMs with KVM virtualization
   - Hardware-level isolation (150ms cold start)
   - Up to 24-hour sandbox sessions
   - Multi-language support (Python, JavaScript, Ruby, C++)

2. **Full Filesystem Access**
   - Upload/download files to/from sandboxes
   - Watch directories for changes
   - Persistent storage via pause/resume

3. **Command Execution**
   - Run arbitrary terminal commands
   - Stream stdout/stderr in real-time
   - Long-running process support

4. **Sandbox Lifecycle Management**
   - Create, pause, resume, kill sandboxes
   - Configurable timeouts (default 5 minutes)
   - List and reconnect to existing sandboxes

5. **LLM Integration**
   - Python/JavaScript SDKs for agent frameworks
   - Code interpreter mode for AI-generated code
   - Execution results with logs and errors

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ RANGER Orchestrator (Recovery Coordinator)             │
│  - Receives user query                                  │
│  - Routes to specialist agents                          │
└───────────────┬─────────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │  E2B API      │  (Cloud or Self-Hosted)
        └───────┬───────┘
                │
    ┌───────────┼───────────┬───────────┬──────────┐
    │           │           │           │          │
┌───▼───┐   ┌──▼────┐  ┌──▼────┐  ┌──▼────┐  ┌──▼────┐
│ Burn  │   │ Trail │  │Timber │  │ NEPA  │  │Cruising│
│Analyst│   │Assess │  │Cruise │  │Advisor│  │Assistant│
│Sandbox│   │Sandbox│  │Sandbox│  │Sandbox│  │ Sandbox│
└───────┘   └───────┘  └───────┘  └───────┘  └────────┘
 Python      Python     Python     Python     Python
 env         env        env        env        env
```

**Security Model:**
- Each sandbox is an isolated Firecracker microVM
- Network access controlled (can be disabled)
- File system isolated from host
- Process-level jailer for additional security

---

## Strategic Integration: Reasoning Engines in Sandboxes

### The "Reasoning Engine, Not Knowledge Store" Paradigm

As outlined in the strategic feedback document, RANGER agents should be:
- **Tool-driven**, not knowledge-driven
- **Fire-agnostic**, not Cedar Creek-specific
- **Reasoning engines** that synthesize data, not databases

**E2B sandboxes enable this by:**

1. **Providing isolated compute for tool execution**
   - Each agent's tools run in its dedicated sandbox
   - Agents can execute complex data transformations
   - Long-running analyses don't block other agents

2. **Enabling code-first tool patterns**
   - Agents can generate and execute Python/JavaScript
   - Iterate over datasets with loops and conditionals
   - Compose multiple tool calls programmatically

3. **Supporting "Best of N" verification**
   - Spin up 3-5 sandboxes with different approaches
   - Let each agent attempt the same task
   - Select the best result, discard the rest

**Example: Burn Severity Analysis**

```python
# Agent prompt generates this code, executed in E2B sandbox
fire_boundary = query_fire_boundary("cedar_creek_2022")
imagery = query_sentinel_imagery(fire_boundary, "2022-08-01", "2022-09-30")

# Code-first iteration (impossible with JSON tool calling)
high_severity_clusters = []
for sector in fire_boundary.sectors:
    dnbr = calculate_dnbr(imagery.pre, imagery.post, sector)
    if dnbr.mean > 0.66:  # High severity threshold
        high_severity_clusters.append({
            "sector": sector.id,
            "severity": dnbr.mean,
            "area_acres": sector.area
        })

# Brief Recovery Coordinator with findings
brief_coordinator({
    "from": "burn_analyst",
    "subject": "High severity zones identified",
    "data": high_severity_clusters
})
```

**This code:**
- Runs in an isolated E2B sandbox
- Iterates over fire sectors (code-first pattern)
- Calls multiple tools sequentially
- Returns structured results to orchestrator

---

## RANGER-Specific Integration Strategy

### Phase 1: Single Shared Sandbox (Minimal Viable Integration)

**Goal:** Prove E2B integration works with simulated tools

**Architecture:**
```
Recovery Coordinator (Node.js)
    │
    └─> Single E2B Sandbox (Python)
            - All 5 agent tools installed
            - Simulated data fixtures available
            - Shared by all agents
```

**Implementation:**
1. Create single E2B sandbox on Recovery Coordinator startup
2. Install Python dependencies:
   ```python
   # requirements.txt
   geopandas
   rasterio
   pyproj
   pandas
   numpy
   ```
3. Upload simulated data fixtures to `/data/` directory:
   ```
   /data/
     cedar_creek/
       fire_boundary.geojson
       burn_severity_mtbs.tif
       trails_damage_points.geojson
       timber_plots.geojson
   ```
4. Each agent calls tools via sandbox commands:
   ```typescript
   const result = await sandbox.commands.run(
     'python /tools/burn_analyst/query_severity.py --fire_id=cedar_creek_2022'
   );
   ```

**Benefits:**
- ✅ Simplest integration path
- ✅ Validates E2B SDK integration
- ✅ Tests tool execution in isolated environment

**Limitations:**
- ⚠️ Shared sandbox = potential resource contention
- ⚠️ No parallelization of agents
- ⚠️ Single point of failure

---

### Phase 2: Per-Agent Dedicated Sandboxes

**Goal:** Enable parallel agent execution and isolation

**Architecture:**
```
Recovery Coordinator (Node.js)
    │
    ├─> Burn Analyst Sandbox (Python)
    │     - GIS libraries, rasterio
    │     - MTBS/Sentinel tools
    │
    ├─> Trail Assessor Sandbox (Python)
    │     - GeoPandas, routing libs
    │     - Trail damage tools
    │
    ├─> Timber Cruiser Sandbox (Python)
    │     - Forestry calculation libs
    │     - Volume estimation tools
    │
    ├─> NEPA Advisor Sandbox (Python)
    │     - LangChain, vector DB
    │     - Policy retrieval tools
    │
    └─> Cruising Assistant Sandbox (Python)
          - Audio processing, Whisper
          - Transcription tools
```

**Implementation:**
1. **Sandbox Templates** (E2B custom templates)
   - Create per-agent Docker images with dependencies
   - Upload to E2B as custom templates
   - Each agent spawns from its template

2. **Lifecycle Management**
   - Orchestrator maintains sandbox pool
   - Lazy initialization (create on first use)
   - Auto-pause after 5 minutes idle
   - Resume on next invocation

3. **Data Sharing**
   - Common data fixtures uploaded to all sandboxes
   - Agent-specific data isolated to their sandbox
   - Results returned via stdout/JSON files

**Benefits:**
- ✅ Parallel agent execution
- ✅ Resource isolation per agent
- ✅ Specialized dependencies per agent
- ✅ Fault tolerance (one agent crash doesn't affect others)

**Code Example:**

```typescript
// packages/orchestrator/src/services/SandboxManager.ts
import { Sandbox } from '@e2b/code-interpreter';

class SandboxManager {
  private sandboxes: Map<AgentName, Sandbox> = new Map();

  async getOrCreateSandbox(agentName: AgentName): Promise<Sandbox> {
    if (this.sandboxes.has(agentName)) {
      const sandbox = this.sandboxes.get(agentName)!;
      // Reconnect if paused
      return await Sandbox.connect(sandbox.sandboxId);
    }

    // Create new sandbox from agent-specific template
    const sandbox = await Sandbox.create({
      template: `ranger-${agentName}`,
      timeoutMs: 5 * 60 * 1000,  // 5 minutes
    });

    this.sandboxes.set(agentName, sandbox);
    return sandbox;
  }

  async pauseAll(): Promise<void> {
    for (const [name, sandbox] of this.sandboxes) {
      await sandbox.betaPause();
      console.log(`Paused ${name} sandbox: ${sandbox.sandboxId}`);
    }
  }
}
```

---

### Phase 3: Dynamic Sandbox Orchestration ("Best of N")

**Goal:** Implement multi-agent verification and parallel task execution

**Architecture:**
```
User Query: "Assess burn severity in Trail Sector 7"
    │
    └─> Recovery Coordinator
            │
            └─> Spawn 3 Burn Analyst Sandboxes in parallel
                    │
                    ├─> Sandbox 1: MTBS classification
                    ├─> Sandbox 2: dNBR calculation
                    └─> Sandbox 3: Sentinel-2 NDVI analysis
                    │
                    └─> Compare results, select best, kill others
```

**Implementation:**

```typescript
async function assessBurnSeverity(fireId: string): Promise<BurnSeverity> {
  const approaches = [
    { method: 'mtbs', tool: '/tools/burn/mtbs_classify.py' },
    { method: 'dnbr', tool: '/tools/burn/calculate_dnbr.py' },
    { method: 'ndvi', tool: '/tools/burn/ndvi_analysis.py' },
  ];

  // Spawn 3 sandboxes in parallel
  const sandboxes = await Promise.all(
    approaches.map(() => Sandbox.create({ template: 'ranger-burn-analyst' }))
  );

  // Execute different approaches in parallel
  const results = await Promise.all(
    sandboxes.map((sbx, i) =>
      sbx.commands.run(`python ${approaches[i].tool} --fire_id=${fireId}`)
    )
  );

  // Parse results
  const parsed = results.map((r, i) => ({
    method: approaches[i].method,
    data: JSON.parse(r.stdout),
    confidence: r.exitCode === 0 ? 1.0 : 0.0,
  }));

  // Select best result (highest confidence, most data points)
  const best = parsed.sort((a, b) => 
    b.confidence - a.confidence || 
    b.data.points.length - a.data.points.length
  )[0];

  // Kill all sandboxes
  await Promise.all(sandboxes.map(sbx => sbx.kill()));

  return best.data;
}
```

**Benefits:**
- ✅ Verification through multiple approaches
- ✅ Highest quality results (best of N)
- ✅ Deferred trust (pick winner at the end)
- ✅ Parallelization for speed

---

## Tool Architecture with E2B Sandboxes

### Abstract Tool Interface (Language-Agnostic)

Each RANGER agent has a set of tools defined as **Python scripts** in the sandbox:

```
/tools/
  burn_analyst/
    query_fire_boundary.py
    query_burn_severity.py
    calculate_dnbr.py
  trail_assessor/
    query_trails_in_sector.py
    assess_trail_damage.py
  timber_cruiser/
    query_timber_plots.py
    calculate_volume.py
  nepa_advisor/
    search_policy_docs.py
    generate_citations.py
  cruising_assistant/
    transcribe_audio.py
    extract_measurements.py
```

**Tool Interface Standard:**

```python
# /tools/burn_analyst/query_burn_severity.py
import sys
import json
import argparse

def query_burn_severity(fire_id: str, source: str = "mtbs"):
    """
    Query burn severity data for a fire.
    
    Args:
        fire_id: Unique fire identifier
        source: Data source (mtbs, dnbr, sentinel)
    
    Returns:
        JSON with severity classification grid
    """
    # Phase 1: Load from simulated fixture
    fixture_path = f"/data/{fire_id}/burn_severity_{source}.geojson"
    with open(fixture_path) as f:
        data = json.load(f)
    
    # Phase 2+: Query real API
    # response = requests.get(f"https://api.mtbs.gov/fires/{fire_id}/severity")
    # data = response.json()
    
    return data

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--fire_id", required=True)
    parser.add_argument("--source", default="mtbs")
    args = parser.parse_args()
    
    result = query_burn_severity(args.fire_id, args.source)
    print(json.dumps(result))  # stdout = return value
```

**Calling from Orchestrator:**

```typescript
const sandbox = await sandboxManager.getOrCreateSandbox('burn_analyst');

const result = await sandbox.commands.run(
  'python /tools/burn_analyst/query_burn_severity.py ' +
  '--fire_id=cedar_creek_2022 --source=mtbs'
);

if (result.exitCode !== 0) {
  throw new Error(`Tool failed: ${result.stderr}`);
}

const severityData = JSON.parse(result.stdout);
```

---

### Simulated vs. Production Tool Implementations

**Phase 1 (Simulated):**
```python
# Tool reads from fixture file in sandbox
def query_fire_boundary(fire_id: str):
    fixture = f"/data/{fire_id}/fire_boundary.geojson"
    return json.load(open(fixture))
```

**Phase 2+ (Production):**
```python
# Same interface, real API call
def query_fire_boundary(fire_id: str):
    response = requests.get(f"https://api.nifc.gov/fires/{fire_id}/boundary")
    return response.json()
```

**Key Insight:** Agent prompts never change. Only tool implementations change. The orchestrator calls tools the same way regardless of phase.

---

## Implementation Roadmap

### Sprint 1: E2B Foundation (Week 1)

**Objective:** Get E2B integrated with Recovery Coordinator

**Tasks:**
1. [ ] Sign up for E2B account ✅ (DONE)
2. [ ] Install E2B SDK in orchestrator package
   ```bash
   cd packages/orchestrator
   npm install @e2b/code-interpreter dotenv
   ```
3. [ ] Create `SandboxManager` service
   - Singleton pattern, manages all sandboxes
   - Implements `getOrCreateSandbox(agentName)`
   - Implements `pauseAll()`, `killAll()` for cleanup
4. [ ] Create E2B API key environment variable
   ```bash
   # .env
   E2B_API_KEY=e2b_***
   ```
5. [ ] Write hello-world test
   ```typescript
   const sandbox = await Sandbox.create();
   const result = await sandbox.runCode('print("RANGER sandbox ready")');
   console.log(result.logs);  // Should print: RANGER sandbox ready
   await sandbox.kill();
   ```

**Verification:**
- [ ] E2B sandbox creates successfully
- [ ] Can execute Python code in sandbox
- [ ] Can read execution logs
- [ ] Sandbox cleanup works (kill/pause)

---

### Sprint 2: Burn Analyst Sandbox (Week 2)

**Objective:** Implement first agent with E2B sandbox tools

**Tasks:**
1. [ ] Create `burn_analyst` tool directory structure
   ```
   packages/orchestrator/sandbox-tools/
     burn_analyst/
       query_fire_boundary.py
       query_burn_severity.py
       calculate_dnbr.py
   ```
2. [ ] Upload Cedar Creek fixtures to sandbox
   ```typescript
   const sandbox = await sandboxManager.getOrCreateSandbox('burn_analyst');
   await sandbox.files.write('/data/cedar_creek/fire_boundary.geojson', fixtureData);
   ```
3. [ ] Implement tools with fixture data sources
4. [ ] Integrate with Recovery Coordinator briefing flow
   ```typescript
   const burnAnalyst = new BurnAnalyst(sandboxManager);
   const report = await burnAnalyst.assessFireSeverity('cedar_creek_2022');
   ```
5. [ ] Update Burn Analyst agent prompt
   - Remove Cedar Creek-specific knowledge
   - Add tool catalog
   - Add reasoning patterns

**Verification:**
- [ ] Burn Analyst can query fire boundary from sandbox
- [ ] Burn Analyst can calculate severity metrics
- [ ] Results returned as structured JSON
- [ ] Recovery Coordinator receives and displays report

---

### Sprint 3: Multi-Agent Sandbox Orchestration (Week 3-4)

**Objective:** All 5 agents running in dedicated sandboxes

**Tasks:**
1. [ ] Implement tool directories for remaining agents:
   - Trail Assessor
   - Timber Cruiser
   - NEPA Advisor
   - Cruising Assistant
2. [ ] Create agent-specific sandbox templates (optional)
   - Dockerfile with dependencies
   - Upload to E2B as custom template
3. [ ] Implement parallel agent execution
   ```typescript
   const [burnReport, trailReport, timberReport] = await Promise.all([
     burnAnalyst.assess(fireId),
     trailAnalyst.assess(fireId),
     timberCruiser.assess(fireId),
   ]);
   ```
4. [ ] Add sandbox lifecycle logging
   - Track sandbox creation/pause/resume
   - Log tool execution times
   - Monitor resource usage

**Verification:**
- [ ] All 5 agents can execute in parallel
- [ ] No sandbox resource contention
- [ ] Recovery Coordinator aggregates all reports
- [ ] Sandbox pool cleanup after session

---

### Sprint 4: "Best of N" Verification (Week 5)

**Objective:** Implement multi-approach verification for critical analyses

**Tasks:**
1. [ ] Implement `BestOfN` orchestration pattern
   ```typescript
   class BestOfN {
     async execute(approaches: Approach[]): Promise<Result> {
       const sandboxes = await this.spawnN(approaches.length);
       const results = await this.runParallel(sandboxes, approaches);
       const winner = this.selectBest(results);
       await this.killAll(sandboxes);
       return winner;
     }
   }
   ```
2. [ ] Add confidence scoring to tool outputs
   ```python
   # Tool output format
   {
     "data": { ... },
     "confidence": 0.95,
     "method": "mtbs",
     "source": "https://mtbs.gov/..."
   }
   ```
3. [ ] Create demo scenarios:
   - Burn severity: MTBS vs dNBR vs NDVI
   - Trail damage: GPS vs survey vs imagery
4. [ ] Update Command Console UI to show verification results
   - Display all N approaches
   - Highlight selected winner
   - Show confidence scores

**Verification:**
- [ ] Can spawn N sandboxes for same task
- [ ] Results compared correctly
- [ ] Highest confidence approach selected
- [ ] All sandboxes cleaned up after selection

---

## Cost Management & Limits

### E2B Pricing Tiers (from your dashboard screenshot)

**Current Plan:** Hobbyist (Free Tier)
- **Concurrent sandboxes:** 20 limit
- **Peak usage:** 0 sandboxes currently
- **Start rate:** 0.000 per second

**Recommendations:**

1. **Phase 1 (Single Sandbox):** Free tier sufficient
   - 1 sandbox per session
   - ~10 concurrent users max

2. **Phase 2 (Per-Agent Sandboxes):** Free tier sufficient
   - 5 sandboxes per session (1 per agent)
   - ~4 concurrent users max

3. **Phase 3 (Best of N):** Consider Pro tier
   - 15+ sandboxes per session (3x per agent)
   - Burst capacity needed

**Cost Optimization Strategies:**

```typescript
class SandboxManager {
  // Strategy 1: Pause idle sandboxes after 2 minutes
  private async autoPauseIdle() {
    const idleThreshold = 2 * 60 * 1000;  // 2 min
    
    for (const [name, sandbox] of this.sandboxes) {
      const lastUsed = this.lastUsedMap.get(name);
      if (Date.now() - lastUsed > idleThreshold) {
        await sandbox.betaPause();
        console.log(`Auto-paused ${name} sandbox`);
      }
    }
  }

  // Strategy 2: Pool management (max 5 concurrent)
  async getOrCreateSandbox(agentName: AgentName): Promise<Sandbox> {
    if (this.sandboxes.size >= 5) {
      // Pause least recently used
      const lru = this.getLeastRecentlyUsed();
      await this.sandboxes.get(lru)!.betaPause();
    }
    
    return this.createSandbox(agentName);
  }
}
```

---

## Security & Compliance

### E2B Security Model

**Hardware Isolation:**
- Firecracker microVMs (AWS technology)
- KVM virtualization
- Jailer process for additional containment

**Network Controls:**
- Can disable internet access per sandbox
- Egress filtering available
- No ingress traffic by default

**Data Isolation:**
- Each sandbox has isolated filesystem
- No cross-sandbox communication
- Data cleared on sandbox kill

### RANGER-Specific Security Considerations

**Sensitive Data Handling:**

```python
# NEVER upload real user data to E2B in Phase 1
# ❌ BAD:
sandbox.files.write('/data/real_fire_data.json', realUserData)

# ✅ GOOD:
sandbox.files.write('/data/cedar_creek_fixture.json', simulatedData)
```

**For Production (Phase 2+):**
1. Use **self-hosted E2B** on GCP
   - Deploy E2B to your GCP project
   - Full control over VM infrastructure
   - Data never leaves your cloud
2. Enable audit logging for all sandbox operations
3. Encrypt data at rest in sandbox filesystems
4. Set sandbox auto-kill timeout (max 1 hour)

---

## Verification Strategy

### Automated Tests

**Unit Tests:**
```typescript
// packages/orchestrator/__tests__/SandboxManager.test.ts
describe('SandboxManager', () => {
  it('should create sandbox for agent', async () => {
    const manager = new SandboxManager();
    const sandbox = await manager.getOrCreateSandbox('burn_analyst');
    expect(sandbox.sandboxId).toBeDefined();
  });

  it('should reuse paused sandbox', async () => {
    const manager = new SandboxManager();
    const sbx1 = await manager.getOrCreateSandbox('burn_analyst');
    await sbx1.betaPause();
    
    const sbx2 = await manager.getOrCreateSandbox('burn_analyst');
    expect(sbx2.sandboxId).toBe(sbx1.sandboxId);
  });
});
```

**Integration Tests:**
```typescript
// packages/orchestrator/__tests__/BurnAnalyst.integration.test.ts
describe('BurnAnalyst with E2B', () => {
  it('should query fire boundary from sandbox', async () => {
    const analyst = new BurnAnalyst(sandboxManager);
    const boundary = await analyst.queryFireBoundary('cedar_creek_2022');
    
    expect(boundary.type).toBe('FeatureCollection');
    expect(boundary.features.length).toBeGreaterThan(0);
  });
});
```

### Manual Verification

**Phase 1 Checklist:**
1. [ ] Open E2B dashboard: https://e2b.dev/dashboard
2. [ ] Start RANGER Command Console
3. [ ] Click "Start Recovery Analysis" button
4. [ ] Observe E2B dashboard: "Concurrent Sandboxes" should show 1
5. [ ] Wait for analysis to complete
6. [ ] Verify sandbox auto-paused after 5 minutes
7. [ ] Check E2B dashboard: "Concurrent Sandboxes" back to 0

**Phase 2 Checklist:**
1. [ ] Trigger multi-agent cascade demo
2. [ ] E2B dashboard should show 5 concurrent sandboxes
3. [ ] Each agent report displays in Command Console
4. [ ] After 5 min idle, all sandboxes paused
5. [ ] Trigger second analysis: sandboxes resume (not recreated)

---

## Migration Path to Self-Hosted E2B

**When to migrate:** Phase 2 (real data)

**Why:** Data sovereignty, cost control, USDA compliance

**How:**

1. **Deploy E2B to GCP:**
   ```bash
   # Use E2B's self-hosting guide
   git clone https://github.com/e2b-dev/infra
   cd infra
   terraform init
   terraform apply -var="cloud_provider=gcp"
   ```

2. **Update E2B API endpoint:**
   ```bash
   # .env
   E2B_API_KEY=your_self_hosted_key
   E2B_API_URL=https://e2b.your-domain.com  # Self-hosted endpoint
   ```

3. **Configure networking:**
   - VPC peering between E2B VMs and RANGER services
   - Private IP communication only
   - No public internet for sandboxes

**Cost Comparison:**

| Tier | Sandboxes | Cost |
|------|-----------|------|
| E2B Cloud (Hobby) | 20 | Free |
| E2B Cloud (Pro) | 100 | $50/mo |
| Self-Hosted GCP | Unlimited | ~$200/mo (10 VMs) |

**Recommendation:** Start with E2B Cloud, migrate to self-hosted when:
- Handling real USDA data
- Need >20 concurrent sandboxes
- Require audit compliance

---

## Next Steps

### Immediate Actions (This Week)

1. ✅ **E2B Account Setup** (DONE)
   - Created account at e2b.dev
   - API key ready

2. **Install E2B SDK**
   ```bash
   cd packages/orchestrator
   npm install @e2b/code-interpreter dotenv
   ```

3. **Create Hello World Test**
   - Validate E2B integration works
   - Document sandbox creation flow

4. **Review This Plan**
   - Get team alignment on approach
   - Identify any gaps or concerns

### Upcoming Milestones

- **Week 1:** E2B foundation + Burn Analyst sandbox
- **Week 2-3:** All 5 agents in dedicated sandboxes
- **Week 4:** Multi-agent orchestration demo
- **Week 5:** "Best of N" verification pattern

---

## Appendix: Code Examples

### Complete Sandbox Manager implementation

```typescript
// packages/orchestrator/src/services/SandboxManager.ts
import { Sandbox } from '@e2b/code-interpreter';

export type AgentName = 
  | 'burn_analyst'
  | 'trail_assessor'
  | 'timber_cruiser'
  | 'nepa_advisor'
  | 'cruising_assistant';

export class SandboxManager {
  private sandboxes: Map<AgentName, Sandbox> = new Map();
  private lastUsed: Map<AgentName, number> = new Map();
  private autoPauseInterval?: NodeJS.Timeout;

  constructor(private config: {
    apiKey: string;
    defaultTimeoutMs?: number;
    autoPauseIdleMs?: number;
  }) {
    // Start auto-pause timer
    if (config.autoPauseIdleMs) {
      this.autoPauseInterval = setInterval(
        () => this.autoPauseIdle(),
        config.autoPauseIdleMs / 2
      );
    }
  }

  async getOrCreateSandbox(agentName: AgentName): Promise<Sandbox> {
    // Try to reuse existing sandbox
    if (this.sandboxes.has(agentName)) {
      const sandbox = this.sandboxes.get(agentName)!;
      
      try {
        // Reconnect (auto-resumes if paused)
        await Sandbox.connect(sandbox.sandboxId, {
          timeoutMs: this.config.defaultTimeoutMs || 5 * 60 * 1000,
        });
        
        this.lastUsed.set(agentName, Date.now());
        console.log(`Reused ${agentName} sandbox: ${sandbox.sandboxId}`);
        return sandbox;
      } catch (error) {
        console.error(`Failed to reconnect ${agentName} sandbox:`, error);
        this.sandboxes.delete(agentName);
      }
    }

    // Create new sandbox
    const sandbox = await Sandbox.create({
      apiKey: this.config.apiKey,
      timeoutMs: this.config.defaultTimeoutMs || 5 * 60 * 1000,
    });

    this.sandboxes.set(agentName, sandbox);
    this.lastUsed.set(agentName, Date.now());
    
    console.log(`Created ${agentName} sandbox: ${sandbox.sandboxId}`);
    return sandbox;
  }

  async executeTool(
    agentName: AgentName,
    toolPath: string,
    args: Record<string, string>
  ): Promise<any> {
    const sandbox = await this.getOrCreateSandbox(agentName);
    
    const argString = Object.entries(args)
      .map(([k, v]) => `--${k}=${v}`)
      .join(' ');
    
    const result = await sandbox.commands.run(`python ${toolPath} ${argString}`);
    
    if (result.exitCode !== 0) {
      throw new Error(`Tool execution failed: ${result.stderr}`);
    }

    return JSON.parse(result.stdout);
  }

  private async autoPauseIdle(): Promise<void> {
    const idleThreshold = this.config.autoPauseIdleMs || 2 * 60 * 1000;
    const now = Date.now();

    for (const [name, lastUsedTime] of this.lastUsed) {
      if (now - lastUsedTime > idleThreshold) {
        const sandbox = this.sandboxes.get(name);
        if (sandbox) {
          try {
            await sandbox.betaPause();
            console.log(`Auto-paused ${name} sandbox after ${(now - lastUsedTime) / 1000}s idle`);
          } catch (error) {
            console.error(`Failed to auto-pause ${name}:`, error);
          }
        }
      }
    }
  }

  async pauseAll(): Promise<void> {
    for (const [name, sandbox] of this.sandboxes) {
      try {
        await sandbox.betaPause();
        console.log(`Paused ${name} sandbox`);
      } catch (error) {
        console.error(`Failed to pause ${name}:`, error);
      }
    }
  }

  async killAll(): Promise<void> {
    for (const [name, sandbox] of this.sandboxes) {
      try {
        await sandbox.kill();
        console.log(`Killed ${name} sandbox`);
      } catch (error) {
        console.error(`Failed to kill ${name}:`, error);
      }
    }
    
    this.sandboxes.clear();
    this.lastUsed.clear();
    
    if (this.autoPauseInterval) {
      clearInterval(this.autoPauseInterval);
    }
  }
}
```

---

## References

- [E2B Documentation](https://e2b.dev/docs)
- [E2B GitHub](https://github.com/e2b-dev)
- [SmolAgents (alternative)](https://github.com/huggingface/smolagents)
- [IndyDevDan 2026 Predictions](../IndyDevDan.md)
- [RANGER Project Brief](./PROJECT-BRIEF.md)
- [RANGER Architecture](./architecture/)

---

**Document Status:** Draft for review  
**Last Updated:** 2025-12-22  
**Next Review:** After team feedback
