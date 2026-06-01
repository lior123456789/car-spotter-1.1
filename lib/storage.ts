/**
 * Storage abstraction. Uses Vercel KV (Redis) when KV_REST_API_URL is set;
 * otherwise falls back to an in-memory Map (fine for local dev, lost on
 * serverless cold start — that's OK because the user identity also resets).
 */

import type { Scan } from "./data";

const KV_ENABLED = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

let kvClient: { get: <T>(k: string) => Promise<T | null>; set: (k: string, v: unknown, opts?: { ex?: number }) => Promise<unknown>; incr: (k: string) => Promise<number>; expire: (k: string, s: number) => Promise<unknown>; lpush: (k: string, v: unknown) => Promise<unknown>; lrange: <T>(k: string, s: number, e: number) => Promise<T[]>; } | null = null;

async function kv() {
  if (!KV_ENABLED) return null;
  if (kvClient) return kvClient;
  const mod = await import("@vercel/kv");
  kvClient = mod.kv as typeof kvClient;
  return kvClient;
}

const memStore = new Map<string, unknown>();
const memLists = new Map<string, unknown[]>();

export type UserRecord = {
  id: string;
  email?: string;
  plan: "free" | "spotter" | "collector" | "concours";
  freeScansUsed: number;
  createdAt: string;
  stripeCustomerId?: string;
};

export const FREE_LIMIT = 3;

export async function getUser(userId: string): Promise<UserRecord> {
  const key = `user:${userId}`;
  const client = await kv();
  if (client) {
    const existing = await client.get<UserRecord>(key);
    if (existing) return existing;
    const fresh: UserRecord = {
      id: userId,
      plan: "free",
      freeScansUsed: 0,
      createdAt: new Date().toISOString(),
    };
    await client.set(key, fresh);
    return fresh;
  }
  // mem fallback
  const existing = memStore.get(key) as UserRecord | undefined;
  if (existing) return existing;
  const fresh: UserRecord = {
    id: userId,
    plan: "free",
    freeScansUsed: 0,
    createdAt: new Date().toISOString(),
  };
  memStore.set(key, fresh);
  return fresh;
}

export async function updateUser(user: UserRecord): Promise<void> {
  const key = `user:${user.id}`;
  const client = await kv();
  if (client) {
    await client.set(key, user);
    return;
  }
  memStore.set(key, user);
}

export async function recordScan(userId: string, scan: Omit<Scan, "user">): Promise<void> {
  const key = `scans:${userId}`;
  const stored = { ...scan, user: userId };
  const client = await kv();
  if (client) {
    await client.lpush(key, JSON.stringify(stored));
    return;
  }
  const list = (memLists.get(key) ?? []) as unknown[];
  list.unshift(stored);
  memLists.set(key, list);
}

export async function listScans(userId: string, limit = 50): Promise<Scan[]> {
  const key = `scans:${userId}`;
  const client = await kv();
  if (client) {
    const raw = await client.lrange<string>(key, 0, limit - 1);
    return raw.map((s) => (typeof s === "string" ? JSON.parse(s) : s)) as Scan[];
  }
  return ((memLists.get(key) ?? []) as Scan[]).slice(0, limit);
}

export async function bumpFreeScans(userId: string): Promise<UserRecord> {
  const user = await getUser(userId);
  user.freeScansUsed += 1;
  await updateUser(user);
  return user;
}

export function isPaid(user: UserRecord): boolean {
  return user.plan !== "free";
}
