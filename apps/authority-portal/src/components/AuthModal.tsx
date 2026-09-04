import React, { useState } from "react";
import { X, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { AuthUser, UserRole } from "./LoginView";

interface AuthModalProps {
  mode: "login" | "signup";
  onClose: () => void;
  onAuth: (user: AuthUser) => void;
  onSwitchMode: (mode: "login" | "signup") => void;
}

interface StoredUser { email: string; username: string; password: string; user: AuthUser; }

const BUILT_IN: StoredUser[] = [
  { email: "admin4@example.com", username: "admin4",    password: "ad123",      user: { id: "USR-A4", name: "Admin Authority", role: "admin" as UserRole,   department: "Central Operations",    initials: "AA", badge: "ADMIN" } },
  { email: "admin@example.com",  username: "admin",     password: "admin123",   user: { id: "USR-01", name: "Alex Mercer",     role: "admin" as UserRole,   department: "Authority Dispatch",     initials: "AM", badge: "ADMIN" } },
  { email: "worker@example.com", username: "worker01",  password: "worker123",  user: { id: "WRK-07", name: "Alex Rivera",     role: "worker" as UserRole,  department: "Roads & Infrastructure", initials: "AR", badge: "FIELD" } },
  { email: "citizen@example.com",username: "citizen",   password: "citizen123", user: { id: "CIT-01", name: "Jordan Smith",    role: "citizen" as UserRole, department: "Resident",               initials: "JS", badge: "PUBLIC" } },
];

const registeredUsers: StoredUser[] = [];

function findUser(id: string, pw: string): AuthUser | null {
  const all = [...BUILT_IN, ...registeredUsers];
  return all.find(u => (u.email === id.trim().toLowerCase() || u.username === id.trim()) && u.password === pw)?.user ?? null;
}

function registerUser(username: string, email: string, password: string): AuthUser {
  const user: AuthUser = { id: "CIT-" + Date.now(), name: username, role: "citizen" as UserRole, department: "Resident", initials: username.slice(0,2).toUpperCase(), badge: "PUBLIC" };
  registeredUsers.push({ email: email.toLowerCase(), username, password, user });
  return user;
}

const IS: React.CSSProperties = { width: "100%", height: 42, padding: "0 13px", borderRadius: 8, border: "1.5px solid #D0D5DD", background: "#fff", color: "#101828", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none" };

const LoginForm: React.FC<{ onAuth: (u: AuthUser) => void; onSwitch: () => void }> = ({ onAuth, onSwitch }) => {
  const [id, setId]   = useState("");
  const [pw, setPw]   = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !pw) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 600));
    const user = findUser(id, pw);
    if (user) onAuth(user);
    else { setLoading(false); setError("Incorrect email/username or password."); }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#344054", marginBottom: 6 }}>Email or Username</label>
        <input id="auth-identifier" type="text" value={id} autoComplete="username" placeholder="you@example.com"
          onChange={e => { setId(e.target.value); setError(""); }}
          style={IS}
          onFocus={e => (e.target.style.borderColor = "#2563EB")}
          onBlur={e  => (e.target.style.borderColor = "#D0D5DD")} />
      </div>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#344054", marginBottom: 6 }}>Password</label>
        <div style={{ position: "relative" }}>
          <input id="auth-password" type={show ? "text" : "password"} value={pw} autoComplete="current-password" placeholder="Enter your password"
            onChange={e => { setPw(e.target.value); setError(""); }}
            style={{ ...IS, paddingRight: 40 }}
            onFocus={e => (e.target.style.borderColor = "#2563EB")}
            onBlur={e  => (e.target.style.borderColor = "#D0D5DD")} />
          <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#98A2B3", display: "flex", padding: 3 }}>
            {show ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
          </button>
        </div>
      </div>
      {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 8, background: "#FEF3F2", border: "1px solid #FECDCA" }}><AlertCircle style={{ width: 14, height: 14, color: "#D92D20", flexShrink: 0 }} /><span style={{ fontSize: 12, color: "#B42318" }}>{error}</span></div>}
      <button id="auth-login-btn" type="submit" disabled={loading} style={{ height: 42, borderRadius: 8, background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
        {loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%" }} className="animate-spin" /> Signing in...</> : <><ArrowRight style={{ width: 14, height: 14 }} /> Sign in</>}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "#475467", margin: 0 }}>
        {"Don't have an account? "}
        <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0, textDecoration: "underline" }}>Sign up</button>
      </p>
    </form>
  );
};

const SignupForm: React.FC<{ onAuth: (u: AuthUser) => void; onSwitch: () => void }> = ({ onAuth, onSwitch }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [pw, setPw]             = useState("");
  const [confirm, setConfirm]   = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [ok, setOk]             = useState(false);

  const validate = () => {
    if (!username.trim() || username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!email.trim() || !email.includes("@")) return "Please enter a valid email.";
    if (pw.length < 6) return "Password must be at least 6 characters.";
    if (pw !== confirm) return "Passwords do not match.";
    if ([...BUILT_IN, ...registeredUsers].some(u => u.email === email.trim().toLowerCase())) return "An account with that email already exists.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(); if (err) { setError(err); return; }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 700));
    const user = registerUser(username.trim(), email.trim(), pw);
    setOk(true);
    await new Promise(r => setTimeout(r, 400));
    onAuth(user);
  };

  const F = (label: string, id: string, val: string, setter: (v: string) => void, type = "text", ph = "", extra?: React.ReactNode) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#344054", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input id={id} type={type} value={val} placeholder={ph} autoComplete={type === "password" ? "new-password" : id}
          onChange={e => { setter(e.target.value); setError(""); }}
          style={{ ...IS, paddingRight: extra ? 40 : 13 }}
          onFocus={e => (e.target.style.borderColor = "#2563EB")}
          onBlur={e  => (e.target.style.borderColor = "#D0D5DD")} />
        {extra}
      </div>
    </div>
  );

  const eye = <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#98A2B3", display: "flex", padding: 3 }}>{show ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}</button>;

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {F("Username", "signup-username", username, setUsername, "text", "Choose a username")}
      {F("Email address", "signup-email", email, setEmail, "email", "you@example.com")}
      {F("Password", "signup-password", pw, setPw, show ? "text" : "password", "At least 6 characters", eye)}
      {F("Confirm Password", "signup-confirm", confirm, setConfirm, show ? "text" : "password", "Repeat your password")}
      {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 8, background: "#FEF3F2", border: "1px solid #FECDCA" }}><AlertCircle style={{ width: 14, height: 14, color: "#D92D20", flexShrink: 0 }} /><span style={{ fontSize: 12, color: "#B42318" }}>{error}</span></div>}
      <button id="auth-signup-btn" type="submit" disabled={loading || ok} style={{ height: 42, borderRadius: 8, background: ok ? "#027A48" : "#2563EB", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, marginTop: 4 }}>
        {ok ? <><CheckCircle2 style={{ width: 14, height: 14 }} /> Account created!</> : loading ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%" }} className="animate-spin" /> Creating...</> : <><ArrowRight style={{ width: 14, height: 14 }} /> Create account</>}
      </button>
      <p style={{ textAlign: "center", fontSize: 13, color: "#475467", margin: 0 }}>
        {"Already have an account? "}
        <button type="button" onClick={onSwitch} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0, textDecoration: "underline" }}>Sign in</button>
      </p>
    </form>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onAuth, onSwitchMode }) => (
  <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    style={{ position: "fixed", inset: 0, background: "rgba(16,24,40,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(16,24,40,0.18)", padding: "28px 28px 24px", position: "relative" }} className="fade-in">
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "#F9FAFB", border: "1px solid #E4E7EC", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#667085" }}>
        <X style={{ width: 15, height: 15 }} />
      </button>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#101828", letterSpacing: "-0.02em" }}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#667085" }}>{mode === "login" ? "Sign in to Civic Unified" : "Join the Civic Unified community"}</p>
      </div>
      <div style={{ display: "flex", background: "#F2F4F7", borderRadius: 10, padding: 4, marginBottom: 22, gap: 4 }}>
        {(["login", "signup"] as const).map(m => (
          <button key={m} type="button" onClick={() => onSwitchMode(m)}
            style={{ flex: 1, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s", background: mode === m ? "#fff" : "transparent", color: mode === m ? "#101828" : "#667085", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {m === "login" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>
      {mode === "login"
        ? <LoginForm  onAuth={onAuth} onSwitch={() => onSwitchMode("signup")} />
        : <SignupForm onAuth={onAuth} onSwitch={() => onSwitchMode("login")} />}
    </div>
  </div>
);
