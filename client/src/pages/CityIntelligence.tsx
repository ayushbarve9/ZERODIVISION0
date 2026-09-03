import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { v4 as uuidv4 } from "uuid";
import { ArrowLeft, Radio, Download, Sparkles, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { useCityIntelStore } from "@intel/state/useCityIntelStore";
import { wsClient } from "@intel/services/wsClient";
import { InteractiveMap } from "@intel/components/maps/InteractiveMap";
import { MapScrubber } from "@intel/components/maps/MapScrubber";
import { AlertFeed } from "@intel/components/alerts/AlertFeed";
import { AnalyticsPane } from "@intel/components/analytics/AnalyticsPane";
import { TransparencyModal } from "@intel/components/intelligence/TransparencyModal";
import "@intel/index.css";

export default function CityIntelligence() {
  const {
    fetchInitialData,
    addIssue,
    updateWorkerLocation,
    addAlert,
    resetStore,
    setFocusLocation,
    setSelectedIssueId,
    updateWard,
    toggleIncidentMode,
    workers,
    incidentMode,
    issues
  } = useCityIntelStore();

  const [showTransparency, setShowTransparency] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    document.body.classList.add("is-intel-route");
    fetchInitialData();
    wsClient.connect();
    setIsConnected(true);

    const unsubIssue = wsClient.subscribe("issue:created", addIssue);
    const unsubWorker = wsClient.subscribe("worker:location", updateWorkerLocation);
    const unsubCrit = wsClient.subscribe("alert:critical", addAlert);
    const unsubSla = wsClient.subscribe("sla:breach", addAlert);

    return () => {
      document.body.classList.remove("is-intel-route");
      document.body.classList.remove("incident-mode");
      unsubIssue();
      unsubWorker();
      unsubCrit();
      unsubSla();
      wsClient.disconnect();
    };
  }, [fetchInitialData, addIssue, updateWorkerLocation, addAlert]);

  const handleExport = (type: "csv" | "json") => {
    const data = useCityIntelStore.getState().issues;
    let blob: Blob;
    if (type === "json") {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    } else {
      const csv =
        "IssueID,Category,Status,Priority,RiskLevel,Address,CreatedAt\n" +
        data.map((i) => `"${i.issueId}","${i.category}","${i.status}",${i.priorityScore},"${i.riskLevel}","${i.address}","${i.createdAt}"`).join("\n");
      blob = new Blob([csv], { type: "text/csv" });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `civic-intelligence-${new Date().toISOString().slice(0, 10)}.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDemoScenario = (type: string) => {
    if (type === "monsoon") {
      const center: [number, number] = [40.69, -73.98];
      for (let i = 0; i < 18; i++) {
        addIssue({
          issueId: uuidv4(),
          category: "Water Leakage",
          latitude: center[0] + (Math.random() - 0.5) * 0.02,
          longitude: center[1] + (Math.random() - 0.5) * 0.02,
          priorityScore: 85,
          duplicateCount: 1,
          status: "Reported",
          department: "Water & Power",
          communityImpact: 90,
          riskLevel: "High",
          slaDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
          isRecurring: false,
          address: "Ward B Water Main Sector",
          createdAt: new Date().toISOString(),
        });
      }
      addAlert({
        id: uuidv4(),
        type: "MASS_COMPLAINT",
        title: "Monsoon Water Main Burst",
        message: "18 complaints received from Ward B within 5 minutes. Major water main pressure drop detected.",
        timestamp: new Date().toISOString(),
        location: { lat: center[0], lng: center[1] },
      });
      updateWard("W-B", { healthScore: 48, status: "Critical Blackspot" });
      setFocusLocation([center[0], center[1]]);
    } else if (type === "hazard") {
      const issueId = uuidv4();
      const lat = 40.75;
      const lng = -73.99;
      addIssue({
        issueId,
        category: "Road Damage",
        latitude: lat,
        longitude: lng,
        priorityScore: 98,
        duplicateCount: 3,
        status: "Reported",
        department: "Public Works",
        communityImpact: 95,
        riskLevel: "Critical",
        slaDeadline: new Date(Date.now() - 3600000).toISOString(),
        isRecurring: true,
        address: "Transit Zone A Arterial",
        createdAt: new Date().toISOString(),
      });
      addAlert({
        id: uuidv4(),
        type: "SLA_BREACH",
        title: "Critical Road Hazard & SLA Breach",
        message: "Priority 98 road collapse near transit corridor has breached SLA by 1 hour.",
        timestamp: new Date().toISOString(),
        location: { lat, lng },
      });
      setFocusLocation([lat, lng]);
      setTimeout(() => setSelectedIssueId(issueId), 1500);
    } else if (type === "drill") {
      toggleIncidentMode();
      addAlert({
        id: uuidv4(),
        type: "EMERGENCY",
        title: "City Incident Drill Activated",
        message: "Emergency protocols engaged. All non-essential municipal work orders placed on hold.",
        timestamp: new Date().toISOString(),
      });
      workers.forEach((w) => {
        updateWorkerLocation({
          ...w,
          status: "Active",
          latitude: w.latitude + (Math.random() - 0.5) * 0.05,
          longitude: w.longitude + (Math.random() - 0.5) * 0.05,
        });
      });
    } else if (type === "reset") {
      resetStore();
      fetchInitialData();
    }
  };

  return (
    <div className="city-intel-root">
      {/* Top Navigation & Status Bar */}
      <header
        style={{
          height: "54px",
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
          zIndex: 2000,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "6px",
              color: "var(--text-main)",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            <ArrowLeft size={14} />
            Citizen Portal
          </Link>

          <div style={{ height: "20px", width: "1px", background: "var(--border-subtle)" }} />

          <div
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              letterSpacing: "-0.01em",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                background: incidentMode ? "#ef4444" : "#38bdf8",
                borderRadius: "50%",
                boxShadow: incidentMode ? "0 0 8px #ef4444" : "0 0 8px #38bdf8",
              }}
            />
            City Intelligence & Command Center
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "var(--text-muted)",
                background: "rgba(255,255,255,0.05)",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Module 4 · Live
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Live indicator */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: isConnected ? "#10b981" : "#f59e0b",
              background: isConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
              padding: "4px 10px",
              borderRadius: "12px",
              border: `1px solid ${isConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            }}
          >
            <Radio size={12} className="spin-slow" />
            <span>{isConnected ? "Telemetry Active (3s)" : "Connecting..."}</span>
          </div>

          {/* Demo Scenarios Dropdown */}
          <div className="dropdown" style={{ position: "relative", display: "inline-block" }}>
            <button
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid #f59e0b",
                color: "#fcd34d",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={13} /> Demo Scenarios ▾
            </button>
            <div
              className="dropdown-content"
              style={{
                display: "none",
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "4px",
                background: "var(--bg-card)",
                minWidth: "240px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                zIndex: 2050,
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "4px 0",
              }}
            >
              <a
                href="#monsoon"
                onClick={(e) => {
                  e.preventDefault();
                  handleDemoScenario("monsoon");
                }}
                style={{
                  color: "var(--text-main)",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                💧 1. Monsoon Water Main Burst
              </a>
              <a
                href="#hazard"
                onClick={(e) => {
                  e.preventDefault();
                  handleDemoScenario("hazard");
                }}
                style={{
                  color: "var(--text-main)",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                ⚠️ 2. Critical Road Hazard & SLA Breach
              </a>
              <a
                href="#drill"
                onClick={(e) => {
                  e.preventDefault();
                  handleDemoScenario("drill");
                }}
                style={{
                  color: "var(--text-main)",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                🚨 3. City Incident Drill
              </a>
              <div style={{ height: "1px", background: "var(--border-subtle)", margin: "4px 0" }} />
              <a
                href="#reset"
                onClick={(e) => {
                  e.preventDefault();
                  handleDemoScenario("reset");
                }}
                style={{
                  color: "#ef4444",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                ↺ Reset Database & Telemetry
              </a>
            </div>
          </div>

          {/* Public Transparency Modal Trigger */}
          <button
            onClick={() => setShowTransparency(true)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-main)",
              padding: "6px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Shield size={13} /> Public Transparency
          </button>

          {/* Export Data Dropdown */}
          <div className="dropdown" style={{ position: "relative", display: "inline-block" }}>
            <button
              style={{
                background: "var(--accent-blue)",
                border: "none",
                color: "#fff",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Download size={13} /> Export ▾
            </button>
            <div
              className="dropdown-content"
              style={{
                display: "none",
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "4px",
                background: "var(--bg-card)",
                minWidth: "170px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
                zIndex: 2050,
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                padding: "4px 0",
              }}
            >
              <a
                href="#csv"
                onClick={(e) => {
                  e.preventDefault();
                  handleExport("csv");
                }}
                style={{
                  color: "var(--text-main)",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                Export CSV ({issues.length} records)
              </a>
              <a
                href="#json"
                onClick={(e) => {
                  e.preventDefault();
                  handleExport("json");
                }}
                style={{
                  color: "var(--text-main)",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                Export JSON
              </a>
              <a
                href="#pdf"
                onClick={(e) => {
                  e.preventDefault();
                  window.print();
                }}
                style={{
                  color: "var(--text-main)",
                  padding: "10px 16px",
                  textDecoration: "none",
                  display: "block",
                  fontSize: "12.5px",
                }}
              >
                Print PDF Report
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main 3-Column Command Dashboard */}
      <div className="dashboard-main" style={{ height: "calc(100vh - 54px)" }}>
        {/* Left Column: Interactive GIS Map & Time Scrubber */}
        <div className="map-pane">
          {showBanner && (
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(15, 23, 42, 0.88)",
                border: "1px solid #38bdf8",
                padding: "8px 18px",
                borderRadius: "20px",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
            >
              <span style={{ fontSize: "12.5px", color: "var(--text-main)" }}>
                🤖 <strong>AI Recommendation:</strong> Inspect Road Section B-14 (5 recurring potholes detected; 92% sub-surface wash probability).
              </span>
              <button
                onClick={() => setShowBanner(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38bdf8",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
                aria-label="Close banner"
              >
                ×
              </button>
            </div>
          )}
          <InteractiveMap />
          <MapScrubber />
        </div>

        {/* Middle Column: Analytics Pane */}
        <div className="analytics-pane" style={{ overflowY: "auto", padding: "1.25rem" }}>
          <AnalyticsPane />
        </div>

        {/* Right Column: Live Alert Feed */}
        <div className="sidebar-pane" style={{ overflowY: "auto", padding: "1.25rem" }}>
          <AlertFeed />
        </div>
      </div>

      {showTransparency && <TransparencyModal onClose={() => setShowTransparency(false)} />}

      <style>{`
        .dropdown:hover .dropdown-content { display: block !important; }
        .dropdown-content a:hover { background-color: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}
