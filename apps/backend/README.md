# Module 2: AI & DB Backend (Backend - Person B)

## Architecture & Mutex Boundary
* **Role:** The central brain, API gateway, and real-time event broadcaster.
* **Strict Boundary:** Pure JSON REST APIs & WebSockets. **Zero UI or CSS.**
* **Core Responsibilities:**
  1. Intake processing & AI Vision classification pipeline.
  2. Spatial duplicate clustering using Haversine formula ($d < 30\text{ meters}$).
  3. Mathematical Priority Scoring formula:
     $$\text{Priority} = w_s \cdot S + w_i \cdot I + w_d \cdot D + w_t \cdot T + w_h \cdot H$$
  4. SLA countdown engine and proactive breach alerting.
  5. Socket.io event broadcasting for live sync across Modules 1, 3, and 4.

## Tech Stack
* Node.js / Express (or Python / FastAPI)
* TypeScript
* Socket.io
* PostgreSQL / PostGIS or MongoDB with 2dsphere indexing
* AI Vision provider integration (damage classification & severity estimation)

## Shared Contracts
Imports & implements domain contracts from `@civic/shared-types`:
* `ServerToClientEvents` & `ClientToServerEvents`
* All REST DTOs (`api-contracts.ts`)
* `CivicIssue`, `DuplicateCluster`, `SystemAlert`, `FieldWorker`
