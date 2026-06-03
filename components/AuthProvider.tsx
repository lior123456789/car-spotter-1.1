"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import {
  onUserChange,
  signInAnon,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  FIREBASE_CONFIGURED,
  upsertUserProfile,
  getUserProfile,
} from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInAnonymous: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onUserChange(async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Sync the server-side cookie so /api/identify, /api/checkout etc.
        // resolve the same user as Firebase Auth.
        try {
          await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: u.uid, email: u.email ?? "" }),
          });
        } catch {}

        // Ensure a /users/{uid} profile doc exists in Firestore. First
        // sign-in creates it with plan="free". Subsequent sign-ins are
        // no-ops thanks to setDoc(..., { merge: true }) in lib/firebase.
        try {
          const existing = await getUserProfile(u.uid);
          if (!existing) {
            await upsertUserProfile(u.uid, {
              email: u.email ?? "",
              displayName: u.displayName ?? undefined,
              plan: "free",
              freeScansUsed: 0,
              createdAt: new Date().toISOString() as any,
            });
          }
        } catch (err) {
          console.warn("[AuthProvider] profile upsert failed:", err);
        }
      }
    });
    return unsubscribe;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    configured: FIREBASE_CONFIGURED,
    signInGoogle: async () => { await signInWithGoogle(); },
    signInEmail: async (email, password) => { await signInWithEmail(email, password); },
    signUpEmail: async (email, password) => { await signUpWithEmail(email, password); },
    signInAnonymous: async () => { await signInAnon(); },
    logout: async () => { await signOut(); },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
