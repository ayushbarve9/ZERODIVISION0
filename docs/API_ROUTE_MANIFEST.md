# API Route & WebSocket Channel Manifest
## Module 2: AI & DB Central Brain

This manifest specifies all REST API endpoints and real-time WebSocket channels exposed by **Module 2 (Backend)** for consumption by **Module 1 (Citizen Portal)**, **Module 3 (Authority Dispatch & Worker)**, and **Module 4 (City Command Center)**.

---

### REST Base URL
`/api/v1`

---

## 1. Module 1: Citizen Portal Endpoints (Person A)
*Boundary Rule: Ingestion & Feed only. No priority logic calculation.*

### `POST /api/v1/issues/check-duplicate`
Fast pre-flight check executed while the citizen is filling in or taking a photo.
- **Description:** Checks if any active report of the same category exists within Haversine distance < 30 meters.
- **Request Body (`DuplicatePreflightQuery`):**
  ```json
  {
    "latitude": 37.774929,
    "longitude": -122.419418,
    "category": "pothole",
    "radiusMeters": 30
  }
  ```
- **Response 200 (`DuplicatePreflightResponse`):**
  ```json
  {
    "hasDuplicateNearby": true,
    "matchedCandidates": [
      {
        "id": "iss_98124",
        "ticketNumber": "CIV-2026-0892",
        "title": "Severe pothole on Market St",
        "category": "pothole",
        "status": "acknowledged",
        "distanceMeters": 14.2,
        "thumbnailUrl": "https://storage.civic.gov/iss_98124_thumb.jpg",
        "reportedAgoMinutes": 32
      }
    ],
    "recommendedAction": "interrupt_modal"
  }
  ```

### `POST /api/v1/issues/ingest`
Primary intake endpoint for citizen complaint submissions.
- **Description:** Receives civic issue data, runs AI classification and spatial clustering (<30m), computes initial priority score, and broadcasts `issue:created` or `issue:clustered` WebSocket events.
- **Request Body (`CreateIssuePayload`):**
  ```json
  {
    "title": "Water main gushing on 5th Ave",
    "description": "Clean water bubbling up through the road surface.",
    "category": "water_leak",
    "location": {
      "latitude": 37.7751,
      "longitude": -122.4189,
      "accuracy": 4.5,
      "address": "450 Market St, San Francisco, CA"
    },
    "mediaBase64": "data:image/jpeg;base64,...",
    "citizenName": "Jane Doe",
    "citizenPhone": "+15550192834"
  }
  ```
- **Response 201 (`CreateIssueResponse`):**
  ```json
  {
    "success": true,
    "issue": {
      "id": "iss_98125",
      "ticketNumber": "CIV-2026-0893",
      "title": "Water main gushing on 5th Ave",
      "category": "water_leak",
      "status": "reported",
      "priority": "high",
      "sla": {
        "expectedResolutionHours": 4,
        "deadline": "2026-09-04T00:35:00.000Z",
        "isBreached": false,
        "timeRemainingMinutes": 240
      }
    },
    "isClusteredWithExisting": false,
    "clusterId": "cls_0129"
  }
  ```

### `GET /api/v1/issues/community-feed`
Public feed for citizen transparency and upvoting.
- **Query Parameters:**
  - `northEast`: `lat,lng` (bounding box)
  - `southWest`: `lat,lng`
  - `category`: optional filter
  - `status`: optional filter
  - `page`: default 1
  - `limit`: default 20
- **Response 200 (`CommunityFeedResponse`):**
  Paginated list of issues with anonymized citizen metadata.

---

## 2. Module 3: Authority Dispatch & Worker Endpoints (Person C)
*Boundary Rule: State Mutators only. Owns the Reported ➔ Assigned ➔ In Progress ➔ Completed ➔ Verified lifecycle.*

### `GET /api/v1/issues/triage`
Authority dispatcher command view with intelligent priority breakdown & SLA metrics.
- **Query Parameters:**
  - `status`: `reported | acknowledged | assigned | in_progress`
  - `sortBy`: `priorityScore | slaDeadline | duplicateCount`
  - `department`: `ROADS | WATER | SANITATION | ELECTRICAL`
- **Response 200 (`TriageListResponse`):**
  Array of `CivicIssue` objects containing complete `priorityBreakdown` (severity, proximity, duplicate multiplier, SLA age factor).

### `POST /api/v1/dispatch/assign`
Assign an issue to an available field worker.
- **Request Body (`AssignIssuePayload`):**
  ```json
  {
    "issueId": "iss_98125",
    "workerId": "wrk_404",
    "targetDeadlineHours": 4,
    "dispatcherNotes": "Requires heavy pipe clamp team."
  }
  ```
- **Response 200:** Updated assignment record with notification status.

### `PATCH /api/v1/issues/:id/status`
State transition mutator.
- **Request Body (`UpdateIssueStatusPayload`):**
  ```json
  {
    "status": "in_progress",
    "notes": "Arrived on site, valve isolation in progress.",
    "workerId": "wrk_404"
  }
  ```
- **Response 200:** Updated `CivicIssue`.

### `POST /api/v1/workers/:id/verify-resolve`
Field worker resolution submission requiring visual proof.
- **Request Body (`SubmitVerificationPayload`):**
  ```json
  {
    "issueId": "iss_98125",
    "workerId": "wrk_404",
    "afterPhotoUrl": "https://storage.civic.gov/proof_iss_98125.jpg",
    "notes": "Ruptured 4-inch valve replaced and pressure tested.",
    "completionGeo": {
      "latitude": 37.7751,
      "longitude": -122.4189,
      "accuracy": 3.2
    },
    "partsUsed": [
      { "name": "4-inch Cast Gate Valve", "quantity": 1 }
    ],
    "submittedAt": "2026-09-03T21:40:00.000Z"
  }
  ```
- **Response 200:** Transition to `work_completed` and alert sent to dispatcher for final sign-off.

### `POST /api/v1/workers/location`
HTTP fallback for worker GPS location ping.
- **Request Body (`WorkerLocationPingPayload`):**
  ```json
  {
    "workerId": "wrk_404",
    "latitude": 37.7750,
    "longitude": -122.4188,
    "heading": 142.5,
    "speedKmh": 28.4,
    "batteryLevel": 0.84
  }
  ```

---

## 3. Module 4: City Command Center Endpoints (Person D)
*Boundary Rule: Read-only consumer. Zero data generation.*

### `GET /api/v1/command-center/spatial-data`
Macro spatial dataset optimized for Leaflet marker clustering and heatmaps.
- **Response 200 (`SpatialMapResponse`):**
  Contains:
  - `activeClusters`: Geocoded centroids with radius and member counts.
  - `individualIssues`: Lightweight points for individual rendering outside clusters.
  - `heatmapPoints`: Weighted points `[lat, lng, intensity]` for density gradient mapping.
  - `activeWorkerLocations`: Real-time worker positions with duty status.

### `GET /api/v1/command-center/root-cause-graph`
Topological graph for React Flow rendering.
- **Query Parameters:**
  - `incidentId` or `clusterId`: Root anchor
- **Response 200 (`RootCauseGraph`):**
  Formatted React Flow `{ nodes: RootCauseGraphNode[], edges: RootCauseGraphEdge[] }` tracing infrastructure failure cascading into citizen reports.

### `GET /api/v1/command-center/metrics`
Executive KPIs.
- **Response 200 (`CityMetricsResponse`):**
  SLA adherence %, active vs resolved, department benchmarks, hot spot severity index.

---

## 4. WebSocket Event Channels (Socket.io)

| Event Name | Direction | Payload | Recipient Modules | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `issue:created` | Server ➔ Client | `CivicIssue` | 3 (Dispatch), 4 (Command) | Real-time intake notification |
| `issue:clustered` | Server ➔ Client | `{ cluster, newIssueId }` | 1, 3, 4 | Spatial cluster (<30m) membership update |
| `issue:status_changed` | Server ➔ Client | `{ issueId, oldStatus, newStatus, updatedAt }` | 1, 3, 4 | Sync pipeline progression across all portals |
| `worker:telemetry` | Server ➔ Client | `WorkerTelemetry` | 3 (Dispatcher map), 4 (City map) | Live GPS tracking of field units |
| `worker:status_changed` | Server ➔ Client | `{ workerId, status }` | 3, 4 | Available / En Route / On Site status toggle |
| `alert:broadcast` | Server ➔ Client | `SystemAlert` | 3 (Banner), 4 (Alert stream) | SLA breach, hazard spike, cascade alarm |
| `command:graph_updated` | Server ➔ Client | `RootCauseGraph` | 4 (React Flow) | Live infrastructure topology update |
| `worker:ping_location` | Client ➔ Server | `WorkerLocationPingPayload` | 2 (Backend intake) | Worker mobile continuous GPS ping |
| `alert:acknowledge` | Client ➔ Server | `{ alertId, acknowledgedBy }` | 2 (Backend intake) | Dispatcher silences or acknowledges alert |
