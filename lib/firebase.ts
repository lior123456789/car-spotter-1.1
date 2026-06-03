/**
 * Firebase setup. Lazy-initialized so it works in Next.js serverless + edge.
 *
 * Required env vars (all client-safe, NEXT_PUBLIC_ prefix exposes them to browser):
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 *
 * Server-side (for Admin SDK if needed later):
 *   FIREBASE_SERVICE_ACCOUNT_JSON  (base64-encoded JSON)
 *
 * If any client var is missing, helpers return null gracefully and the app
 * falls back to cookie-based anonymous auth.
 */

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Firebase Web API keys are designed to be public — security is enforced
// via Firestore + Storage rules in the console, not by hiding the key.
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDU0D-rBlKgvvPmyjuZBhMc-4cMntOHuBc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "carspotter-c0863.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "carspotter-c0863",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "carspotter-c0863.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "647314746037",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:647314746037:web:8413de7471a8f0541cecfc",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-GRK3D0S8V7",
};
const FIREBASE_CONFIGURED = !!FIREBASE_CONFIG.apiKey && !!FIREBASE_CONFIG.projectId;

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp | null {
  if (!FIREBASE_CONFIGURED) return null;
  if (app) return app;
  if (getApps().length > 0) { app = getApps()[0]; return app; }
  app = initializeApp(FIREBASE_CONFIG);
  return app;
}

export function auth() {
  const a = getApp();
  return a ? getAuth(a) : null;
}

export function db() {
  const a = getApp();
  return a ? getFirestore(a) : null;
}

// ── Public helpers ──────────────────────────────────────────────────────────

export async function signInAnon(): Promise<User | null> {
  const a = auth();
  if (!a) return null;
  const result = await signInAnonymously(a);
  return result.user;
}

export async function signInWithGoogle(): Promise<User | null> {
  const a = auth();
  if (!a) return null;
  const result = await signInWithPopup(a, new GoogleAuthProvider());
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const a = auth();
  if (!a) return null;
  const result = await signInWithEmailAndPassword(a, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string): Promise<User | null> {
  const a = auth();
  if (!a) return null;
  const result = await createUserWithEmailAndPassword(a, email, password);
  return result.user;
}

export async function signOut() {
  const a = auth();
  if (a) await fbSignOut(a);
}

export function onUserChange(cb: (user: User | null) => void): () => void {
  const a = auth();
  if (!a) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(a, cb);
}

// ── Firestore: scans ────────────────────────────────────────────────────────

export type FirestoreScan = {
  userId: string;
  make: string;
  model: string;
  year: string;
  category: string;
  msrp: string;
  valueRange: string;
  engine: string;
  horsepower: string;
  zeroToSixty: string;
  rarity: number;
  celebrity?: string;
  funFact: string;
  thumb?: string;
  spottedAt: any; // serverTimestamp
};

export async function saveScan(userId: string, scan: Omit<FirestoreScan, "userId" | "spottedAt">) {
  const f = db();
  if (!f) return null;
  const ref = await addDoc(collection(f, "scans"), {
    ...scan,
    userId,
    spottedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listUserScans(userId: string, max = 100) {
  const f = db();
  if (!f) return [];
  const q = query(
    collection(f, "scans"),
    where("userId", "==", userId),
    orderBy("spottedAt", "desc"),
    fbLimit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreScan) }));
}

// ── Firestore: user profile + plan ──────────────────────────────────────────

export type UserProfile = {
  email: string;
  displayName?: string;
  plan: "free" | "spotter" | "collector" | "concours";
  stripeCustomerId?: string;
  freeScansUsed: number;
  createdAt: any;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const f = db();
  if (!f) return null;
  const snap = await getDoc(doc(f, "users", userId));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function upsertUserProfile(userId: string, profile: Partial<UserProfile>) {
  const f = db();
  if (!f) return;
  await setDoc(
    doc(f, "users", userId),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export { FIREBASE_CONFIGURED };
