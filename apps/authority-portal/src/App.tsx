import React, { useState, useRef, useEffect } from "react";
import { AuthModal } from "./components/AuthModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { WorkerPortal } from "./components/WorkerPortal";
import { CivicVisionView } from "./components/CivicVisionView";
import { BackendTelemetryView } from "./components/BackendTelemetryView";
import { CitizenPortalView } from "./components/CitizenPortalView";
import { CommandCenterView } from "./components/CommandCenterView";
import { AuthUser, UserRole } from "./components/LoginView";
import {
  LayoutDashboard, Smartphone, Users, Compass, Scan, Activity,
  Layers, ChevronLeft, ChevronRight, Bell, LogOut, LogIn, UserPlus,
  ChevronDown, User,
} from "lucide-react";

export type PortalMode = "admin" | "worker" | "citizen" | "command" | "vision" | "backend";

interface ModuleConfig {
  id: PortalMode; label: string; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string; allowedRoles: (UserRole | "guest")[];
}

const MODULES: ModuleConfig[] = [
  { id: "admin",   label: "Authority Console", subtitle: "Operational dispatch & multi-department triage",          icon: LayoutDashboard, tag: "Triage", allowedRoles: ["admin"] },
  { id: "worker",  label: "Field Worker",       subtitle: "Mobile task execution & photo proof verification",        icon: Smartphone,      tag: "Field",  allowedRoles: ["worker", "admin"] },
  { id: "citizen", label: "Citizen Portal",     subtitle: "Resident intake, tracking & public transparency",         icon: Users,           tag: "Public", allowedRoles: ["citizen", "admin", "guest"] },
  { id: "command", label: "Command Center",     subtitle: "Spatial analytics, incident clustering & ward health",    icon: Compass,         tag: "GIS",    allowedRoles: ["admin"] },
  { id: "vision",  label: "Civic Vision AI",    subtitle: "Damage severity analysis & media authenticity checks",    icon: Scan,            tag: "AI",     allowedRoles: ["admin", "worker"] },
  { id: "backend", label: "Central Brain",      subtitle: "REST playground, spatial clustering & socket telemetry",  icon: Activity,        tag: "API",    allowedRoles: ["admin"] },
];

const ROLE_LABEL: Record<UserRole | "guest", string> = {
  admin:   "Authority Dispatcher",
  worker:  "Field Operations",
  citizen: "Resident",
  guest:   "Guest",
};

// Sidebar colours — flat, no gradients
const S = {
  bg: "#1B2B4A", hover: "rgba(255,255,255,0.06)", activeBg: "#2563EB",
  text: "rgba(255,255,255,0.7)", textDim: "rgba(255,255,255,0.35)",
  border: "rgba(255,255,255,0.08)", chip: "rgba(255,255,255,0.08)",
};

// ─── PROFILE DROPDOWN ─────────────────────────────────────────────────────────
const ProfileDropdown: React.FC<{
  user: AuthUser | null;
  onLogin: () => void; onSignup: () => void; onLogout: () => void;
}> = ({ user, onLogin, onSignup, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = user ? user.initials : "G";
  const displayName = user ? user.name : "Guest";
  const roleLabel = user ? ROLE_LABEL[user.role] : "Not signed in";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", borderRadius: 10, border: "1px solid #E4E7EC", background: "#fff", cursor: "pointer", transition: "background 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: user ? "#2563EB" : "#E4E7EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: user ? "#fff" : "#667085", fontFamily: "monospace" }}>
          {user ? initials : <User style={{ width: 14, height: 14 }} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }} className="hidden md:flex">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#101828", lineHeight: 1.3 }}>{displayName}</span>
          <span style={{ fontSize: 10, color: "#667085" }}>{roleLabel}</span>
        </div>
        <ChevronDown style={{ width: 13, height: 13, color: "#98A2B3", flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)", width: 200,
          background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12,
          boxShadow: "0 8px 30px rgba(16,24,40,0.12)", zIndex: 200, overflow: "hidden",
        }} className="fade-in">
          {/* User info header */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #F2F4F7" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{displayName}</div>
            <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>{roleLabel}</div>
          </div>

          <div style={{ padding: 6 }}>
            {!user ? (
              <>
                <button onClick={() => { setOpen(false); onLogin(); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#344054", fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <LogIn style={{ width: 14, height: 14, color: "#667085" }} />
                  Sign in
                </button>
                <button onClick={() => { setOpen(false); onSignup(); }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#344054", fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <UserPlus style={{ width: 14, height: 14, color: "#667085" }} />
                  Create account
                </button>
              </>
            ) : (
              <button onClick={() => { setOpen(false); onLogout(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#B42318", fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FEF3F2")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <LogOut style={{ width: 14, height: 14 }} />
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [viewMode,    setViewMode]    = useState<PortalMode>("citizen"); // default = citizen (guest-accessible)
  const [collapsed,   setCollapsed]   = useState(false);
  const [authModal,   setAuthModal]   = useState<"login" | "signup" | null>(null);

  const userRole = currentUser?.role ?? "guest";

  const handleAuth = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthModal(null);
    // Route to appropriate dashboard
    if (user.role === "admin")   setViewMode("admin");
    else if (user.role === "worker") setViewMode("worker");
    else setViewMode("citizen");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode("citizen");
  };

  const allowed = MODULES.filter(m => m.allowedRoles.includes(userRole));
  const active  = allowed.find(m => m.id === viewMode) || allowed[0];
  const ActiveIcon = active.icon;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#F7F8FA", color: "#101828", fontFamily: "Inter, sans-serif" }}>

      {/* ─── AUTH MODAL OVERLAY ─── */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onAuth={handleAuth}
          onSwitchMode={m => setAuthModal(m)}
        />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside style={{ width: collapsed ? 64 : 240, background: S.bg, borderRight: "1px solid " + S.border, display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0, transition: "width 0.25s ease", boxShadow: "1px 0 0 rgba(0,0,0,0.06)" }}>
        <div>
          {/* Brand */}
          <div style={{ height: 56, borderBottom: "1px solid " + S.border, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            {!collapsed ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>CIVIC UNIFIED</div>
                    <div style={{ fontSize: 10, color: S.textDim }}>Smart Civic Platform</div>
                  </div>
                </div>
                <button onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: S.textDim, display: "flex" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers className="w-3.5 h-3.5 text-white" />
                </div>
                <button onClick={() => setCollapsed(false)} style={{ position: "absolute", left: 42, top: -2, background: "#2563EB", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#fff", display: "flex" }}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Role chip */}
          {!collapsed && (
            <div style={{ margin: "10px 10px 4px", padding: "8px 10px", borderRadius: 8, background: S.chip, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: currentUser ? "#2563EB" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "monospace", flexShrink: 0 }}>
                {currentUser ? currentUser.initials : "G"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 11, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser ? currentUser.name : "Guest"}</div>
                <div style={{ fontSize: 10, color: S.textDim }}>{ROLE_LABEL[userRole]}</div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav style={{ padding: "6px 8px" }}>
            {!collapsed && <div style={{ padding: "8px 8px 4px", fontSize: 10, fontWeight: 600, color: S.textDim, textTransform: "uppercase", letterSpacing: "0.12em" }}>Modules</div>}
            {allowed.map(mod => {
              const Icon = mod.icon;
              const isActive = viewMode === mod.id;
              return (
                <button key={mod.id} onClick={() => setViewMode(mod.id)} title={collapsed ? mod.label : undefined}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "9px 0" : "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", background: isActive ? S.activeBg : "transparent", marginBottom: 2, transition: "background 0.15s", position: "relative" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = S.hover; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isActive ? "rgba(255,255,255,0.2)" : S.chip }}>
                    <Icon className={"w-3.5 h-3.5 " + (isActive ? "text-white" : "text-white/55")} />
                  </div>
                  {!collapsed && (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", overflow: "hidden" }}>
                      <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.label}</span>
                      {mod.tag && <span style={{ fontSize: 9, fontFamily: "monospace", padding: "1px 5px", borderRadius: 4, flexShrink: 0, marginLeft: 4, background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.07)", color: isActive ? "rgba(255,255,255,0.85)" : S.textDim, letterSpacing: "0.06em" }}>{mod.tag}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div style={{ padding: 10, borderTop: "1px solid " + S.border }}>
          {!collapsed ? (
            <div style={{ padding: "7px 10px", borderRadius: 8, background: S.chip, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, color: S.textDim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>Status</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: "#6EE7B7" }}>
                <span className="status-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
                Online
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span className="status-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399" }} title="Online" />
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Header */}
        <header style={{ height: 56, background: "#FFFFFF", borderBottom: "1px solid #E4E7EC", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EFF4FF", border: "1px solid #C7D7FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ActiveIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#101828", display: "flex", alignItems: "center", gap: 8 }}>
                {active.label}
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "#EFF4FF", color: "#2563EB", border: "1px solid #C7D7FB", letterSpacing: "0.06em", fontFamily: "monospace" }}>LIVE</span>
              </div>
              <div style={{ fontSize: 11, color: "#667085", marginTop: 1 }}>{active.subtitle}</div>
            </div>
          </div>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 6, border: "1px solid #E4E7EC", background: "#F9FAFB" }}>
              <span className="status-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#344054", fontFamily: "monospace" }}>Connected</span>
            </div>
            <button style={{ width: 34, height: 34, borderRadius: 8, background: "#F9FAFB", border: "1px solid #E4E7EC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Bell style={{ width: 15, height: 15, color: "#667085" }} />
            </button>
            {/* Profile dropdown */}
            <ProfileDropdown
              user={currentUser}
              onLogin={() => setAuthModal("login")}
              onSignup={() => setAuthModal("signup")}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: "auto", background: "#F7F8FA" }}>
          {viewMode === "admin"   && currentUser?.role === "admin" && <AdminDashboard />}
          {viewMode === "worker"  && <WorkerPortal />}
          {viewMode === "citizen" && <CitizenPortalView />}
          {viewMode === "command" && currentUser?.role === "admin" && <CommandCenterView />}
          {viewMode === "vision"  && <CivicVisionView />}
          {viewMode === "backend" && currentUser?.role === "admin" && <BackendTelemetryView />}
        </main>
      </div>
    </div>
  );
};

export default App;
