// Civic Editorial authentication: a focused split-screen entry point turns sign-in into a clear invitation to participate in neighborhood life.
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { issueImages } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth({ mode = "login" }: { mode?: "login" | "register" }) {
  const [, navigate] = useLocation();
  const { signIn } = useAuth();
  const isRegister = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password || (isRegister && !name)) {
      toast.error("Please complete the required fields.");
      return;
    }
    const displayName = isRegister ? name : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    signIn({ name: displayName || "Citizen", email });
    toast.success(isRegister ? "Account created. Welcome to Common Ground." : "You’re signed in.");
    navigate("/");
  }

  return <div className="auth-page"><div className="auth-visual"><div className="auth-visual-image"><img src={issueImages.community} alt="Neighbors working together on a local street issue" /><div className="auth-visual-overlay" /></div><Link href="/" className="auth-brand"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-type"><strong>common</strong><em>ground</em></span></Link><div className="auth-visual-copy"><span className="section-kicker light">A clearer civic signal</span><h1>Make the block<br /><em>better together.</em></h1><p>Report what you notice, follow the work, and help your neighbors keep the record honest.</p><div className="auth-quote"><span className="quote-mark">“</span><span>Small reports become visible progress when the whole neighborhood can see the path.</span></div></div><div className="auth-visual-footer"><span><MapPin size={14} /> District 4, New York City</span><span>Private by default</span></div></div><main className="auth-panel"><div className="auth-panel-top"><span className="auth-utility">{isRegister ? "Already a resident?" : "New to Common Ground?"}</span><Link href={isRegister ? "/login" : "/register"} className="auth-switch">{isRegister ? "Sign in" : "Create an account"} <ArrowRight size={14} /></Link></div><div className="auth-form-wrap"><span className="section-kicker">{isRegister ? "Join your neighborhood" : "Citizen sign in"}</span><h2>{isRegister ? "Start where you live." : "Good to see you again."}</h2><p className="auth-subtitle">{isRegister ? "Create one place to report, follow, and verify the issues that shape your daily route." : "Pick up where you left off and keep your neighborhood reports moving."}</p><form className="auth-form" onSubmit={handleSubmit}>{isRegister && <label><span>Your name</span><div className="auth-input"><UserRound size={16} /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Maya Chen" autoComplete="name" /></div></label>}<label><span>Email address</span><div className="auth-input"><Mail size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></div></label><label><span>Password</span><div className="auth-input"><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} autoComplete={isRegister ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{!isRegister && <div className="auth-form-options"><label className="remember-option"><input type="checkbox" /> <span>Keep me signed in</span></label><button type="button" onClick={() => toast("Password reset link requested.")} className="auth-forgot">Forgot password?</button></div>}{isRegister && <label className="consent-option"><input type="checkbox" required /><span>I agree to keep reports respectful and useful for the people who act on them.</span></label>}<button className="button button-primary auth-submit" type="submit">{isRegister ? "Create my account" : "Sign in to my portal"}<ArrowRight size={16} /></button></form><div className="auth-trust"><ShieldCheck size={17} /><span><strong>Privacy is part of the service.</strong><br />Your personal details stay private; only issue locations are shared with service teams.</span></div></div><div className="auth-panel-footer"><span>Common Ground · Citizen portal</span><span><Check size={13} /> Service updates live</span></div></main></div>;
}
