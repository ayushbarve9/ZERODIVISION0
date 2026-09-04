# Smart Civic Issue Reporting & Resolution Platform
> Real-Time Spatial Intelligence & Autonomous Municipal Triage

This platform enables citizens to report municipal civic problems (potholes, water leaks, garbage, road hazards), automatically clusters duplicate reports using AI and spatial proximity ($<30\text{m}$), computes intelligent multi-factor priority scores, and delivers a unified command and dispatch system for municipal authorities and field workers.

---

## The Mutex Architecture Model

To enable parallel development without team overlap, the platform enforces 4 strictly separated modules:

| Module | Role | Owner | Strict Boundary |
| :--- | :--- | :--- | :--- |
| **Module 1: Citizen Portal** | Mobile-first PWA for issue intake & community feed | Person A | **Only emits data.** Zero prioritization calculation. |
| **Module 2: AI & DB Backend** | Central brain, AI vision, clustering & WebSockets | Person B | **Pure REST & WebSockets.** Zero UI / CSS. |
| **Module 3: Authority Dispatch & Worker** | Desktop triage & mobile field worker execution | Person C | **State Mutators only.** Owns Reported ➔ Assigned ➔ Resolved pipeline. |
| **Module 4: City Command Center** | Macro spatial intelligence & root-cause graphs | Person D | **Read-only consumer.** Zero data generation. |

All modules share a single source of truth: `packages/shared-types`.

---

## Monorepo Directory Structure

```text
ZERODIVISION0/
├── package.json                         # Root workspaces orchestrator
├── tsconfig.base.json                   # Common TypeScript compiler options & aliases
├── docs/
│   └── API_ROUTE_MANIFEST.md           # Master REST & WebSocket specifications
├── packages/
│   └── shared-types/                    # SINGLE SOURCE OF TRUTH
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                 # Master bundle export
│           ├── issue.ts                 # Issue, Priority Breakdown, DuplicateCluster
│           ├── user-worker.ts           # Roles, FieldWorker, Telemetry, Proof
│           ├── system-alert.ts          # SystemAlert, React Flow Root-Cause nodes/edges
│           └── api-contracts.ts         # REST DTOs and Socket.io Event Maps
└── apps/
    ├── citizen-portal/                  # Module 1 (Person A)
    ├── backend/                         # Module 2 (Person B)
    ├── authority-portal/                # Module 3 (Person C)
    └── command-center/                  # Module 4 (Person D)
```

---

## Key Mathematical & Technical Standards

### 1. Spatial Clustering (Haversine < 30m)
When a citizen reports an issue, the backend checks for existing issues in the same category within a 30-meter radius using the Haversine formula:
$$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$
If $d < 30\text{m}$, the new report is automatically linked into a `DuplicateCluster`, avoiding duplicate work orders while escalating the cluster priority.

### 2. Multi-Factor Priority Scoring
$$\text{Priority} = w_s \cdot S + w_i \cdot I + w_d \cdot D + w_t \cdot T + w_h \cdot H$$
- $S$: AI visual damage magnitude (0 - 100)
- $I$: Proximity to critical infrastructure (hospitals, schools, arterial roads)
- $D$: Duplicate report multiplier ($\sqrt{\text{count}}$)
- $T$: Elapsed time vs SLA target deadline
- $H$: Real-time environmental hazard factor (e.g. torrential rainfall)

---

## Quick Start

```bash
# Typecheck all shared types and workspace packages
npm run typecheck --workspace=@civic/shared-types
```