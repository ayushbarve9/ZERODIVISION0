// Civic Editorial mock data and intelligence adapter
// Synchronized with Module 4 (City Intelligence & Command Center)
import { useCityIntelStore } from "@intel/state/useCityIntelStore";
import type { CivicIssue as IntelCivicIssue } from "@intel/types/intelTypes";

export type IssueSeverity = "Low" | "Medium" | "High" | "Critical";

export interface IntelligenceResponse {
  issue_id: string;
  category: string;
  priority: string;
  duplicate_status: string;
}

export interface TimelineEvent {
  label: string;
  date: string;
  detail: string;
  complete: boolean;
}

export interface CitizenIssue {
  id: string;
  title: string;
  category: "Pothole" | "Garbage" | "Streetlight" | "Water Leakage" | "Road Damage";
  status: "Reported" | "In progress" | "Under review" | "Resolved";
  severity: IssueSeverity;
  location: string;
  coordinates: { lat: number; lng: number };
  image: string;
  reportedAt: string;
  updatedAt: string;
  supporters: number;
  comments: number;
  description: string;
  timeline: TimelineEvent[];
}

export interface NotificationItem {
  id: string;
  kind: "status" | "community" | "resolution" | "alert";
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export const issueImages = {
  pothole: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%232b3536'/><path d='M120 280 C180 230, 320 220, 480 270 C410 330, 240 340, 120 280 Z' fill='%23192021'/><path d='M150 275 C200 245, 300 240, 450 268' stroke='%23445455' stroke-width='4' fill='none'/><circle cx='280' cy='280' r='30' fill='%23121718'/><text x='30' y='50' fill='%2375c7b2' font-family='sans-serif' font-size='18' font-weight='600'>DISTRICT 4 INFRASTRUCTURE</text><text x='30' y='80' fill='%23e5ece9' font-family='serif' font-size='26'>Crosswalk Roadway Cavity</text></svg>",
  light: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%2316222f'/><circle cx='300' cy='120' r='50' fill='%23fbbf24' opacity='0.3'/><circle cx='300' cy='120' r='20' fill='%23fef08a'/><line x1='300' y1='140' x2='300' y2='380' stroke='%23475569' stroke-width='10'/><text x='30' y='50' fill='%2338bdf8' font-family='sans-serif' font-size='18' font-weight='600'>ELECTRICAL GRID REPORT</text><text x='30' y='80' fill='%23f8fafc' font-family='serif' font-size='26'>Flickering Street Lamp Post</text></svg>",
  water: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='600' height='400' fill='%230f2830'/><path d='M0 320 Q150 280, 300 310 T600 290 L600 400 L0 400 Z' fill='%2338bdf8' opacity='0.6'/><path d='M0 340 Q150 310, 300 330 T600 320 L600 400 L0 400 Z' fill='%230284c7'/><circle cx='250' cy='290' r='14' fill='%23e0f2fe'/><text x='30' y='50' fill='%2338bdf8' font-family='sans-serif' font-size='18' font-weight='600'>WATER & SEWER SERVICE</text><text x='30' y='80' fill='%23f8fafc' font-family='serif' font-size='26'>Sub-surface Water Main Leak</text></svg>",
  community: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'><rect width='800' height='500' fill='%23193438'/><circle cx='250' cy='220' r='90' fill='%2375C7B2' opacity='0.35'/><circle cx='550' cy='220' r='110' fill='%2338BDF8' opacity='0.25'/><rect x='100' y='360' width='600' height='6' rx='3' fill='%2375C7B2'/><text x='100' y='180' fill='%23F6F4EE' font-family='serif' font-size='38' font-weight='500'>Common Ground Civic Signal</text><text x='100' y='220' fill='%239EC5BE' font-family='sans-serif' font-size='18'>Connecting Resident Reports to Real-Time Municipal Action</text></svg>"
};

export const mockIssues: CitizenIssue[] = [
  {
    id: "CG-2048",
    title: "Deep pothole at east crosswalk",
    category: "Pothole",
    status: "In progress",
    severity: "High",
    location: "Hawthorne Ave & 8th Street",
    coordinates: { lat: 40.7411, lng: -73.9897 },
    image: issueImages.pothole,
    reportedAt: "12 Sep 2024",
    updatedAt: "2 hours ago",
    supporters: 19,
    comments: 4,
    description: "The pavement has collapsed alongside the crosswalk ramp, creating a 6-inch drop that collects water and damages bicycle tires.",
    timeline: [
      { label: "Report submitted", date: "12 Sep · 09:40", detail: "Report submitted by resident with GPS location and photo evidence.", complete: true },
      { label: "AI Classification", date: "12 Sep · 09:41", detail: "Classified as Pothole, Priority Score 82/100, Assigned to Public Works Ward B.", complete: true },
      { label: "Public Works Scheduled", date: "13 Sep · 08:15", detail: "Field crew scheduled for asphalt resurfacing with estimated 24hr turnaround.", complete: true },
      { label: "Crew Dispatched", date: "Today · 08:18", detail: "Maintenance crew dispatched. On-site inspection confirmed work order.", complete: true },
      { label: "Repair Completion & Verification", date: "Estimated tomorrow", detail: "Resident notification will trigger verification prompt once patch is inspected.", complete: false }
    ]
  },
  {
    id: "CG-1994",
    title: "Flickering street lamp post #42",
    category: "Streetlight",
    status: "Resolved",
    severity: "Medium",
    location: "240 Lexington Ave",
    coordinates: { lat: 40.7484, lng: -73.9857 },
    image: issueImages.light,
    reportedAt: "08 Sep 2024",
    updatedAt: "Yesterday",
    supporters: 14,
    comments: 2,
    description: "Lamp post turns on and off intermittently throughout the night, leaving the transit stop completely dark.",
    timeline: [
      { label: "Report submitted", date: "08 Sep · 20:15", detail: "Reported by commuter via mobile app.", complete: true },
      { label: "Electrical triage", date: "09 Sep · 09:00", detail: "Ballast failure diagnosed by Energy & Lighting operations.", complete: true },
      { label: "Replacement completed", date: "11 Sep · 14:30", detail: "LED fixture and photocell sensor replaced by field technician.", complete: true },
      { label: "Citizen verified", date: "Yesterday · 10:00", detail: "Verified resolved by 3 neighborhood residents.", complete: true }
    ]
  },
  {
    id: "CG-2031",
    title: "Sub-surface water leakage near hydrant",
    category: "Water Leakage",
    status: "Under review",
    severity: "Critical",
    location: "Park Ave & 34th St",
    coordinates: { lat: 40.7471, lng: -73.9782 },
    image: issueImages.water,
    reportedAt: "10 Sep 2024",
    updatedAt: "30 mins ago",
    supporters: 32,
    comments: 7,
    description: "Continuous clean water bubbling up through curb expansion joints; potential sub-surface pipe scour.",
    timeline: [
      { label: "Report submitted", date: "10 Sep · 18:20", detail: "Resident observed water bubbling through road surface.", complete: true },
      { label: "Critical Hazard Triaged", date: "10 Sep · 18:22", detail: "Flagged as Critical Priority 94 by AI Diagnostic system.", complete: true },
      { label: "Acoustic sensor inspection", date: "Today · 07:30", detail: "Water & Power acoustic probe placed to pinpoint underground fissure.", complete: true },
      { label: "Root-cause remediation", date: "Pending approval", detail: "Excavation crew awaiting command approval for pipe sleeve lining.", complete: false }
    ]
  },
  {
    id: "CG-2015",
    title: "Overflowing commercial garbage bins",
    category: "Garbage",
    status: "In progress",
    severity: "Low",
    location: "Bedford & N 6th St",
    coordinates: { lat: 40.7182, lng: -73.9571 },
    image: issueImages.community,
    reportedAt: "11 Sep 2024",
    updatedAt: "4 hours ago",
    supporters: 8,
    comments: 1,
    description: "Weekend market refuse overflowing past bin enclosures into tree pits.",
    timeline: [
      { label: "Report submitted", date: "11 Sep · 11:00", detail: "Submitted with photo evidence.", complete: true },
      { label: "Sanitation route update", date: "11 Sep · 14:00", detail: "Added to priority secondary sweep.", complete: true },
      { label: "Compactor truck dispatched", date: "Today · 06:45", detail: "Crew en route to clean site.", complete: true }
    ]
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "notif-1",
    kind: "status",
    title: "Crew assigned to Hawthorne Ave pothole",
    detail: "Public Works team has scheduled a field technician to inspect and patch the road surface.",
    time: "2 hours ago",
    unread: true
  },
  {
    id: "notif-2",
    kind: "resolution",
    title: "Street lamp #42 repair completed",
    detail: "Electrical services marked the lamp post resolved. Please take a look and confirm if fixed.",
    time: "Yesterday · 16:20",
    unread: true
  },
  {
    id: "notif-3",
    kind: "community",
    title: "6 new neighbors supported your report",
    detail: "Residents along 8th Street backed report #CG-2048 to increase service priority.",
    time: "2 days ago",
    unread: false
  },
  {
    id: "notif-4",
    kind: "alert",
    title: "District 4 Weather Advisory Notice",
    detail: "Heavy rain expected; drainage monitoring crews placed on standby across low-lying sectors.",
    time: "3 days ago",
    unread: false
  }
];

export function getIssue(id?: string): CitizenIssue {
  if (!id) return mockIssues[0];
  const found = mockIssues.find((i) => i.id === id);
  return found || mockIssues[0];
}

// Submits an issue and feeds directly into the Module 4 City Intelligence Command Center!
export async function submitIssue(payload: {
  photo: string | null;
  latitude: number;
  longitude: number;
  description: string;
  severity: IssueSeverity;
}): Promise<IntelligenceResponse> {
  // Simulate AI Classification
  await new Promise((r) => setTimeout(r, 600));

  const issueNum = Math.floor(1000 + Math.random() * 9000);
  const issueId = `CG-${issueNum}`;

  // Map user description to probable category
  let category: IntelCivicIssue["category"] = "Pothole";
  const lowerDesc = payload.description.toLowerCase();
  if (lowerDesc.includes("water") || lowerDesc.includes("leak") || lowerDesc.includes("pipe")) {
    category = "Water Leakage";
  } else if (lowerDesc.includes("light") || lowerDesc.includes("dark") || lowerDesc.includes("lamp")) {
    category = "Streetlight";
  } else if (lowerDesc.includes("trash") || lowerDesc.includes("garbage") || lowerDesc.includes("waste")) {
    category = "Garbage";
  } else if (lowerDesc.includes("road") || lowerDesc.includes("crack") || lowerDesc.includes("curb")) {
    category = "Road Damage";
  }

  const priorityScore =
    payload.severity === "Critical" ? 95 :
    payload.severity === "High" ? 82 :
    payload.severity === "Medium" ? 64 : 35;

  const newIssue: CitizenIssue = {
    id: issueId,
    title: `${category} reported at current location`,
    category,
    status: "Reported",
    severity: payload.severity,
    location: `${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`,
    coordinates: { lat: payload.latitude, lng: payload.longitude },
    image: payload.photo || issueImages.pothole,
    reportedAt: "Just now",
    updatedAt: "Just now",
    supporters: 1,
    comments: 0,
    description: payload.description,
    timeline: [
      { label: "Report submitted", date: "Just now", detail: "Received by citizen portal.", complete: true },
      { label: "AI Classification", date: "Just now", detail: `Auto-categorized as ${category} (Priority ${priorityScore}/100).`, complete: true },
      { label: "Municipal handoff", date: "Pending", detail: "Sent to City Intelligence Command Center.", complete: false }
    ]
  };

  mockIssues.unshift(newIssue);

  // Cross-module bridge: Push to Module 4's Zustand store and Live Alert feed!
  try {
    const intelStore = useCityIntelStore.getState();
    const department =
      category === "Water Leakage" ? "Water & Power" :
      category === "Garbage" ? "Sanitation" : "Public Works";

    intelStore.addIssue({
      issueId,
      category,
      latitude: payload.latitude,
      longitude: payload.longitude,
      priorityScore,
      duplicateCount: 1,
      status: "Reported",
      department,
      communityImpact: Math.floor(priorityScore * 0.8),
      riskLevel: payload.severity,
      slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      isRecurring: false,
      address: `Citizen GPS: ${payload.latitude.toFixed(4)}, ${payload.longitude.toFixed(4)}`,
      createdAt: new Date().toISOString()
    });

    if (payload.severity === "Critical" || payload.severity === "High") {
      intelStore.addAlert({
        id: `alert-${Date.now()}`,
        type: payload.severity === "Critical" ? "CRITICAL" : "MASS_COMPLAINT",
        title: `Citizen Urgent Alert: ${category}`,
        message: `High-priority issue ${issueId} submitted near District 4. ${payload.description.slice(0, 75)}...`,
        timestamp: new Date().toISOString(),
        associatedIssueId: issueId,
        location: { lat: payload.latitude, lng: payload.longitude }
      });
    }

    intelStore.setFocusLocation([payload.latitude, payload.longitude]);
  } catch (err) {
    console.warn("Module 4 sync warning:", err);
  }

  return {
    issue_id: issueId,
    category,
    priority: `${priorityScore}/100 (${payload.severity})`,
    duplicate_status: "Unique report (0 duplicates detected)"
  };
}
