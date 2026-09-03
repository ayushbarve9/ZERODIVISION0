// Civic Editorial shell: asymmetric rail navigation, quiet utility header, and visible status language keep the portal oriented and trustworthy.
import { Link, useLocation } from "wouter";
import { Activity, Bell, ChevronDown, ChevronRight, ClipboardList, Compass, FilePlus2, HelpCircle, Home, LogIn, LogOut, MapPin, Menu, Radio, Search, ShieldCheck, UserRoundPlus, X } from "lucide-react";
import { useState } from "react";
import { notifications } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

type CivicShellProps = {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
};

const navItems = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Report an issue", href: "/report", icon: FilePlus2 },
  { label: "My complaints", href: "/complaints", icon: ClipboardList },
  { label: "Nearby issues", href: "/nearby", icon: Compass },
];

export default function CivicShell({ children, title, eyebrow = "Citizen portal", action }: CivicShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuSource, setProfileMenuSource] = useState<"rail" | "topbar" | null>(null);
  const { profile, isGuest, signOut } = useAuth();
  const unreadCount = notifications.filter((item) => item.unread).length;
  const profileName = profile?.name || "Guest user";
  const profileInitials = profile ? profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() : "GU";
  const toggleProfileMenu = (source: "rail" | "topbar") => {
    setProfileMenuOpen((open) => {
      const nextOpen = profileMenuSource !== source || !open;
      setProfileMenuSource(nextOpen ? source : null);
      return nextOpen;
    });
  };

  return (
    <div className="app-shell">
      <aside className={`app-rail ${mobileOpen ? "is-open" : ""}`}>
        <div className="rail-brand">
          <Link href="/" className="brand-lockup" onClick={() => setMobileOpen(false)}>
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span className="brand-type"><strong>common</strong><em>ground</em></span>
          </Link>
          <button className="icon-button rail-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="rail-section-label">Your civic space</div>
        <nav className="rail-nav" aria-label="Primary navigation">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href} className={`rail-link ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
                {href === "/complaints" && <span className="rail-count">3</span>}
              </Link>
            );
          })}
        </nav>

        <div className="rail-divider" />
        <div className="rail-section-label">Municipal Operations</div>
        <nav className="rail-nav" aria-label="Command operations">
          <Link href="/intelligence" className={`rail-link ${location.startsWith("/intelligence") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
            <Activity size={18} strokeWidth={location.startsWith("/intelligence") ? 2.2 : 1.8} />
            <span>City Intelligence</span>
            <span className="rail-badge-live">GIS Live</span>
          </Link>
        </nav>

        <div className="rail-divider" />
        <div className="rail-section-label">Good to know</div>
        <nav className="rail-nav" aria-label="Support navigation">
          <Link href="/notifications" className={`rail-link ${location.startsWith("/notifications") ? "active" : ""}`} onClick={() => setMobileOpen(false)}>
            <Bell size={18} strokeWidth={1.8} /><span>Notifications</span>{unreadCount > 0 && <span className="rail-dot" />}
          </Link>
          <button className="rail-link rail-button" onClick={() => window.alert("Common Ground support is ready to help.")}>
            <HelpCircle size={18} strokeWidth={1.8} /><span>Help centre</span>
          </button>
        </nav>

        <div className="rail-footer">
          <div className="privacy-note"><ShieldCheck size={16} /><span>Your reports are private by default.</span></div>
          <button type="button" className={`account-card ${isGuest ? "guest-account" : ""}`} onClick={() => toggleProfileMenu("rail")} aria-expanded={profileMenuOpen && profileMenuSource === "rail"} aria-haspopup="menu">
            <div className="avatar">{profileInitials}</div>
            <div className="account-copy"><strong>{profileName}</strong><span>{isGuest ? "Sign in to follow reports" : `Resident · ${profile?.district}`}</span></div>
            <ChevronDown size={15} className={`muted-icon ${profileMenuOpen ? "is-rotated" : ""}`} />
          </button>
          {profileMenuOpen && profileMenuSource === "rail" && <div className="profile-menu" role="menu">
            {isGuest ? <>
              <div className="profile-menu-heading"><span className="section-kicker light">Your profile</span><strong>Keep your civic trail together.</strong></div>
              <Link href="/login" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}><span className="profile-menu-icon"><LogIn size={15} /></span><span><strong>Log in</strong><small>Access your reports and updates</small></span><ChevronRight size={14} /></Link>
              <Link href="/register" className="profile-menu-item" onClick={() => setProfileMenuOpen(false)}><span className="profile-menu-icon moss"><UserRoundPlus size={15} /></span><span><strong>Create an account</strong><small>Don’t have an account? Create one</small></span><ChevronRight size={14} /></Link>
            </> : <>
              <div className="profile-menu-heading"><span className="section-kicker light">Signed in as</span><strong>{profileName}</strong></div>
              <button className="profile-menu-item" onClick={() => { signOut(); setProfileMenuOpen(false); }}><span className="profile-menu-icon"><LogOut size={15} /></span><span><strong>Log out</strong><small>Return to guest mode</small></span><ChevronRight size={14} /></button>
            </>}
          </div>}
        </div>
      </aside>

      {mobileOpen && <button className="rail-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <main className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="topbar-context"><span>New York City <span className="context-separator">/</span> District 4</span><span className="live-indicator"><i /> Live service updates</span></div>
          <div className="topbar-actions">
            <Link href="/intelligence" className="command-center-topbar-link" title="Open City Intelligence & Command Center">
              <Radio size={14} className="spin-slow" />
              <span>Command Center</span>
            </Link>
            <label className="search-box"><Search size={16} /><input placeholder="Search your reports" aria-label="Search your reports" /><kbd>⌘ K</kbd></label>
            <Link href="/notifications" className="icon-button notification-button" aria-label={`${unreadCount} unread notifications`}><Bell size={19} />{unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}</Link>
            <button type="button" className={`topbar-avatar ${isGuest ? "guest-avatar" : ""}`} onClick={() => toggleProfileMenu("topbar")} aria-label="Open profile menu">{profileInitials}</button>
            {profileMenuOpen && profileMenuSource === "topbar" && <div className="profile-menu topbar-profile-menu" role="menu">
              {isGuest ? <>
                <div className="profile-menu-heading"><span className="section-kicker">Guest profile</span><strong>Keep your civic trail together.</strong></div>
                <Link href="/login" className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); setProfileMenuSource(null); }}><span className="profile-menu-icon"><LogIn size={15} /></span><span><strong>Log in</strong><small>Access your reports and updates</small></span><ChevronRight size={14} /></Link>
                <Link href="/register" className="profile-menu-item" onClick={() => { setProfileMenuOpen(false); setProfileMenuSource(null); }}><span className="profile-menu-icon moss"><UserRoundPlus size={15} /></span><span><strong>Create an account</strong><small>Don’t have an account? Create one</small></span><ChevronRight size={14} /></Link>
              </> : <button className="profile-menu-item" onClick={() => { signOut(); setProfileMenuOpen(false); setProfileMenuSource(null); }}><span className="profile-menu-icon"><LogOut size={15} /></span><span><strong>Log out</strong><small>Return to guest mode</small></span><ChevronRight size={14} /></button>}
            </div>}
          </div>
        </header>

        <div className="page-frame">
          <div className="page-heading">
            <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>
            {action && <div className="page-action">{action}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
