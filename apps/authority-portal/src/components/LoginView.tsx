import React, { useState, useEffect } from 'react';
import {
  Layers, Shield, Wrench, Users,
  Eye, EyeOff, ArrowRight, Lock, AlertCircle, CheckCircle2,
} from 'lucide-react';

export type UserRole = 'admin' | 'worker' | 'citizen';

export interface AuthUser {
  id: string; name: string; role: UserRole;
  department?: string; initials: string; badge: string;
}

interface Credential { username: string; password: string; user: AuthUser; }

const CREDENTIALS: Credential[] = [
  { username: 'admin',      password: 'admin123',    user: { id: 'USR-001', name: 'Admin Authority',  role: 'admin',   department: 'Central Operations',    initials: 'AA', badge: 'ADMIN' } },
  { username: 'dispatcher', password: 'dispatch123', user: { id: 'USR-002', name: 'Alex Mercer',      role: 'admin',   department: 'Authority Dispatch',     initials: 'AM', badge: 'ADMIN' } },
  { username: 'worker01',   password: 'worker123',   user: { id: 'WRK-007', name: 'Alex Rivera',      role: 'worker',  department: 'Roads & Infrastructure',  initials: 'AR', badge: 'FIELD' } },
  { username: 'worker02',   password: 'worker123',   user: { id: 'WRK-014', name: 'Samantha Chen',    role: 'worker',  department: 'Water & Utilities',       initials: 'SC', badge: 'FIELD' } },
  { username: 'citizen',    password: 'citizen123',  user: { id: 'CIT-001', name: 'Jordan Smith',     role: 'citizen', initials: 'JS', badge: 'PUBLIC' } },
  { username: 'resident',   password: 'resident123', user: { id: 'CIT-002', name: 'Maria Gonzalez',   role: 'citizen', initials: 'MG', badge: 'PUBLIC' } },
];

interface RoleConfig {
  id: UserRole; label: string; description: string;
  icon: React.ComponentType<{ className?: string }>;
  capabilities: string[]; demoUser: string; demoPass: string;
}

const ROLES: RoleConfig[] = [
  {
    id: 'admin', label: 'Authority Dispatcher', description: 'Issue triage, worker assignment & oversight',
    icon: Shield,
    capabilities: ['Full issue triage', 'Worker dispatch', 'AI damage analysis', 'Command center & GIS'],
    demoUser: 'admin', demoPass: 'admin123',
  },
  {
    id: 'worker', label: 'Field Worker', description: 'On-site task execution & resolution proof',
    icon: Wrench,
    capabilities: ['Assigned task queue', 'GPS navigation', 'Before/after photo upload', 'SLA countdown'],
    demoUser: 'worker01', demoPass: 'worker123',
  },
  {
    id: 'citizen', label: 'Resident', description: 'Issue reporting & public resolution tracking',
    icon: Users,
    capabilities: ['Submit civic issues', 'Track resolution status', 'Photo evidence upload', 'Community updates'],
    demoUser: 'citizen', demoPass: 'citizen123',
  },
];

export const LoginView: React.FC<{ onLogin: (user: AuthUser) => void }> = ({ onLogin }) => {
  const [role,     setRole]      = useState<UserRole>('admin');
  const [username, setUsername]  = useState('admin');
  const [password, setPassword]  = useState('admin123');
  const [showPwd,  setShowPwd]   = useState(false);
  const [loading,  setLoading]   = useState(false);
  const [error,    setError]     = useState('');
  const [success,  setSuccess]   = useState(false);
  const [ready,    setReady]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setReady(true), 30); return () => clearTimeout(t); }, []);

  const selectRole = (r: UserRole) => {
    setRole(r); setError('');
    const cfg = ROLES.find(x => x.id === r);
    if (cfg) { setUsername(cfg.demoUser); setPassword(cfg.demoPass); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Please enter your username and password.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 800));
    const match = CREDENTIALS.find(c => c.username === username.trim() && c.password === password && c.user.role === role);
    if (match) {
      setSuccess(true);
      await new Promise(r => setTimeout(r, 500));
      onLogin(match.user);
    } else {
      setLoading(false);
      setError('Invalid credentials. Check your username, password, and selected role.');
    }
  };

  const cfg = ROLES.find(r => r.id === role)!;
  const CfgIcon = cfg.icon;

  /* ── Colours ── */
  const navy      = '#1B2B4A';
  const navyLight = '#243660';
  const navyDim   = 'rgba(255,255,255,0.35)';
  const navyText  = 'rgba(255,255,255,0.75)';
  const blue      = '#2563EB';
  const border    = '#E4E7EC';

  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif', opacity: ready ? 1 : 0, transition: 'opacity 0.4s',
    }}>
      <style>{`
        .login-input { outline: none; transition: border-color 0.15s; }
        .login-input:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .role-card { transition: all 0.15s ease; cursor: pointer; border: none; }
        .role-card:hover { background: rgba(255,255,255,0.08) !important; }
        .submit-btn { transition: background 0.15s; cursor: pointer; border: none; }
        .submit-btn:hover:not(:disabled) { background: #1D4ED8 !important; }
        .submit-btn:active:not(:disabled) { background: #1E40AF !important; }
        .sign-in-link { color: #2563EB; cursor: pointer; text-decoration: none; }
        .sign-in-link:hover { text-decoration: underline; }
        @keyframes status-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .s-dot { animation: status-pulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* ═══════════ LEFT — BRAND PANEL ═══════════ */}
      <div style={{
        width: '42%', background: navy,
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }} className="hidden lg:flex">

        {/* Top strip */}
        <div style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="s-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: navyDim, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>Secure Gateway</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Lock style={{ width: 11, height: 11, color: navyDim }} />
            <span style={{ fontSize: 10, color: navyDim, fontFamily: 'monospace' }}>TLS 1.3</span>
          </div>
        </div>

        {/* Centered logo */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers style={{ width: 34, height: 34, color: '#fff' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '0.12em', fontFamily: 'monospace' }}>CIVIC UNIFIED</div>
            <div style={{ fontSize: 12, color: navyDim, letterSpacing: '0.08em', marginTop: 8 }}>Smart Civic Resolution Platform</div>
          </div>
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
            {[
              { n: '14', label: 'Active districts' },
              { n: '4', label: 'Field officers online' },
              { n: '100%', label: 'Encrypted transmissions' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 11, color: navyDim }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — selected role info */}
        <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ padding: 16, borderRadius: 10, background: navyLight, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CfgIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{cfg.label}</div>
                <div style={{ fontSize: 11, color: navyDim, marginTop: 1 }}>{cfg.description}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {cfg.capabilities.map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 style={{ width: 12, height: 12, color: '#93C5FD', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: navyText }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT — FORM PANEL ═══════════ */}
      <div style={{ flex: 1, background: '#F7F8FA', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* Mobile brand bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, background: navy, padding: '0 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }} className="lg:hidden">
          <div style={{ width: 26, height: 26, borderRadius: 7, background: blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers style={{ width: 13, height: 13, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', fontFamily: 'monospace' }}>CIVIC UNIFIED</span>
        </div>

        {/* Form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 36px', maxWidth: 460, margin: '0 auto', width: '100%' }}>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.02em' }}>Sign in to your account</h1>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: '#667085' }}>Select your role, then enter your credentials</p>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#344054', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ROLES.map(r => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button key={r.id} type="button" className="role-card"
                    onClick={() => selectRole(r.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '14px 8px', borderRadius: 10,
                      background: active ? navy : '#fff',
                      border: `1.5px solid ${active ? navy : border}`,
                      boxShadow: active ? '0 2px 8px rgba(27,43,74,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? blue : '#F2F4F7',
                    }}>
                      <Icon className={active ? 'w-4 h-4 text-white' : 'w-4 h-4 text-gray-500'} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#fff' : '#344054', textAlign: 'center', lineHeight: 1.2 }}>
                      {r.id === 'admin' ? 'Dispatcher' : r.id === 'worker' ? 'Field Worker' : 'Resident'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credentials form */}
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#344054', marginBottom: 6 }}>Username</label>
              <input id="login-username" type="text" value={username} autoComplete="username"
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter username"
                className="login-input"
                style={{ width: '100%', height: 42, padding: '0 13px', borderRadius: 8, border: `1.5px solid ${border}`, background: '#fff', color: '#101828', fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#344054', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="login-password" type={showPwd ? 'text' : 'password'} value={password} autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                  className="login-input"
                  style={{ width: '100%', height: 42, padding: '0 40px 0 13px', borderRadius: 8, border: `1.5px solid ${border}`, background: '#fff', color: '#101828', fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: '#98A2B3', display: 'flex', alignItems: 'center' }}
                  className="hover:text-gray-600 transition-colors">
                  {showPwd ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 8, background: '#FEF3F2', border: '1px solid #FECDCA' }}>
                <AlertCircle style={{ width: 14, height: 14, color: '#D92D20', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#B42318' }}>{error}</span>
              </div>
            )}

            <button id="login-submit-btn" type="submit" className="submit-btn"
              disabled={loading || success}
              style={{
                height: 44, borderRadius: 8,
                background: success ? '#027A48' : blue,
                color: '#fff', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                opacity: loading || success ? 0.85 : 1,
                marginTop: 2,
              }}>
              {success ? (
                <><CheckCircle2 style={{ width: 15, height: 15 }} /> Authenticated — Loading platform...</>
              ) : loading ? (
                <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%' }} className="animate-spin" /> Verifying credentials...</>
              ) : (
                <><Lock style={{ width: 14, height: 14 }} /> Sign in <ArrowRight style={{ width: 14, height: 14 }} /></>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 10, background: '#fff', border: `1px solid ${border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#344054', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: blue, display: 'inline-block' }} />
              Demo credentials (auto-filled)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[{ k: 'Username', v: cfg.demoUser }, { k: 'Password', v: cfg.demoPass }].map(row => (
                <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#667085' }}>{row.k}</span>
                  <code style={{ fontSize: 12, color: '#101828', fontWeight: 600, background: '#F2F4F7', padding: '2px 9px', borderRadius: 5 }}>{row.v}</code>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 28, textAlign: 'center', fontSize: 11, color: '#98A2B3' }}>
            Civic Unified Platform · v2.0 · ZeroDivision
          </p>
        </div>
      </div>
    </div>
  );
};
