import { cookies } from "next/headers";

const COOKIE = "cs_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

function uuid() {
  // simple uuid v4 (good enough for an anon user ID)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateUserId(): string {
  const store = cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing) return existing;
  const id = uuid();
  store.set(COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}

export function setUserCookie(id: string) {
  cookies().set(COOKIE, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
}
