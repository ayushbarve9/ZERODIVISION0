# Module 3: Authority Dispatch & Worker (Frontend - Person C)

## Architecture & Mutex Boundary
* **Role:** Desktop admin triage interface & Mobile field worker execution portal.
* **Strict Boundary:** State Mutators only. **Owns the entire pipeline: `Reported` ➔ `Assigned` ➔ `In Progress` ➔ `Work Completed` ➔ `Verified Resolved`.**
* **Core Responsibilities:**
  1. Desktop Triage View: Priority score inspector, dynamic SLA countdown clocks with color transitions (green ➔ amber ➔ crimson flashing).
  2. Smart Auto-Assignment & Manual Reassignment engine for departmental workers.
  3. Field Worker Mobile Interface: GPS telemetry heartbeat emitter, task navigation.
  4. Before / After photo verification workflow with compulsory camera upload and completion geo-tag.

## Tech Stack
* React 18 / Vite
* TypeScript
* Tailwind CSS
* Zustand (State management)
* Lucide Icons
* Socket.io-client

## Shared Contracts
Imports domain models directly from `@civic/shared-types`:
* `TriageListQuery` & `TriageListResponse`
* `AssignIssuePayload`, `UpdateIssueStatusPayload`
* `SubmitVerificationPayload`
* `FieldWorker`, `WorkerTelemetry`
