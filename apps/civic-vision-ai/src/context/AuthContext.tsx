import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

export interface CloudSqlUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  cloudSqlUser: CloudSqlUser | null;
  idToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  cloudSqlUser: null,
  idToken: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cloudSqlUser, setCloudSqlUser] = useState<CloudSqlUser | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          setIdToken(token);

          // Synchronize user to Cloud SQL database via backend
          const resp = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              displayName: currentUser.displayName || currentUser.email?.split('@')[0],
            }),
          });

          if (resp.ok) {
            const data = await resp.json();
            if (data.user) {
              setCloudSqlUser(data.user);
            }
          }
        } catch (err) {
          console.error('[Auth] Failed to sync user to Cloud SQL:', err);
        }
      } else {
        setIdToken(null);
        setCloudSqlUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error('[Auth] Google sign-in failed:', err);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIdToken(null);
      setCloudSqlUser(null);
    } catch (err) {
      console.error('[Auth] Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, cloudSqlUser, idToken, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
