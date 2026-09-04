# Module 1: Citizen Portal (Frontend - Person A)

## Architecture & Mutex Boundary
* **Role:** Mobile-first PWA for citizen ingestion and local community transparency.
* **Strict Boundary:** Only emits intake data. **Zero prioritization logic.**
* **Core Responsibilities:**
  1. HTML5 Geolocation capture with high accuracy coordinates.
  2. HTML5 Camera API integration for instant photo capture (before repair).
  3. Pre-flight duplicate check against `POST /api/v1/issues/check-duplicate` to display interrupt warnings if reports exist within < 30m.
  4. Citizen issue tracking & read-only community map feed with upvote capability.

## Tech Stack
* React 18 / Vite
* TypeScript
* Tailwind CSS (Dark command-center aesthetic)
* Zustand (State management)
* Axios
* Socket.io-client (Real-time status updates on submitted tickets)

## Shared Contracts
Imports domain models directly from `@civic/shared-types`:
* `CreateIssuePayload`
* `DuplicatePreflightQuery`
* `DuplicatePreflightResponse`
* `CommunityFeedResponse`
* `CivicIssue`
