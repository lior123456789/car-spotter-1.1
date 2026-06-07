"use client";

import {
  collection,
  query,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage } from "firebase/storage";
import { db } from "@/lib/firebase";

export type FeedPost = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  photoUrl: string;
  make: string;
  model: string;
  year: string;
  category: string;
  rarity: number;
  valueRange: string;
  caption: string;
  location?: string;
  // Optional geocoded coordinates so the post lands on the map
  lng?: number;
  lat?: number;
  likedBy: string[];
  createdAt: Date;
};

/** Live-subscribe to global feed. Returns unsub. */
export function subscribeToFeed(
  cb: (posts: FeedPost[]) => void,
  max = 100,
): Unsubscribe | null {
  const f = db();
  if (!f) { cb([]); return null; }

  const q = query(
    collection(f, "posts"),
    orderBy("createdAt", "desc"),
    fbLimit(max),
  );

  // Feed resets daily — only show spots from today (local midnight onward).
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId ?? "",
        displayName: data.displayName ?? "Anonymous",
        avatarUrl: data.avatarUrl || undefined,
        photoUrl: data.photoUrl ?? "",
        make: data.make ?? "Unknown",
        model: data.model ?? "",
        year: data.year ?? "",
        category: data.category ?? "Daily",
        rarity: typeof data.rarity === "number" ? data.rarity : 5,
        valueRange: data.valueRange ?? "—",
        caption: data.caption ?? "",
        location: data.location || undefined,
        lng: typeof data.lng === "number" ? data.lng : undefined,
        lat: typeof data.lat === "number" ? data.lat : undefined,
        likedBy: (data.likedBy as string[]) ?? [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as FeedPost;
    }).filter((p) => p.createdAt >= startOfToday);
    cb(posts);
  });
}

/** Create a new post: upload image to Storage then write Firestore doc. */
export async function createFeedPost({
  userId,
  displayName,
  avatarUrl,
  imageFile,
  car,
  caption,
  location,
  coords,
}: {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  imageFile: File;
  car: {
    make: string; model: string; year: string;
    category: string; rarity: number; valueRange: string;
  };
  caption: string;
  location?: string;
  coords?: { lng: number; lat: number };
}): Promise<string> {
  const f = db();
  if (!f) throw new Error("Firebase not configured.");

  // 1. Upload image
  const postId = crypto.randomUUID();
  const storage = getStorage();
  const storageRef = ref(storage, `posts/${userId}/${postId}.jpg`);
  const uploadResult = await uploadBytes(storageRef, imageFile, {
    contentType: imageFile.type || "image/jpeg",
  });
  const photoUrl = await getDownloadURL(uploadResult.ref);

  // 2. Write post doc
  const docData: any = {
    userId,
    displayName,
    avatarUrl: avatarUrl ?? "",
    photoUrl,
    make: car.make, model: car.model, year: car.year,
    category: car.category, rarity: car.rarity, valueRange: car.valueRange,
    caption, location: location ?? "",
    likedBy: [],
    createdAt: serverTimestamp(),
  };
  if (coords) {
    docData.lng = coords.lng;
    docData.lat = coords.lat;
  }
  const ref2 = await addDoc(collection(f, "posts"), docData);
  return ref2.id;
}

export async function toggleLike(postId: string, userId: string, currentlyLiked: boolean) {
  const f = db();
  if (!f) return;
  await updateDoc(doc(f, "posts", postId), {
    likedBy: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function deleteFeedPost(postId: string) {
  const f = db();
  if (!f) return;
  await deleteDoc(doc(f, "posts", postId));
}
