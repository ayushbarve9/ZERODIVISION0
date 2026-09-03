// Civic Editorial auth state: a replaceable client-side boundary starts every new visitor as a guest and preserves the signed-in profile for the session.
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CitizenProfile = { name: string; email: string; district: string };

type AuthContextValue = {
  profile: CitizenProfile | null;
  isGuest: boolean;
  signIn: (profile: Pick<CitizenProfile, "name" | "email">) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "common-ground-citizen-profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CitizenProfile | null>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as CitizenProfile : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (profile) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [profile]);

  const value = useMemo(() => ({
    profile,
    isGuest: !profile,
    signIn: (next: Pick<CitizenProfile, "name" | "email">) => setProfile({ ...next, district: "District 4" }),
    signOut: () => setProfile(null),
  }), [profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
