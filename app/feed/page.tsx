"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, ArrowLeft, Heart, MapPin, MessageCircle, Send, Loader2, X,
  ImagePlus, Globe, Sparkles, Crown,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { subscribeToFeed, createFeedPost, toggleLike, deleteFeedPost, type FeedPost } from "@/lib/feedClient";
import { geocode } from "@/lib/geocode";

const Map               = dynamic(() => import("@/components/ui/mapcn-layer-markers").then(m => m.Map), { ssr: false });
const MapPopup          = dynamic(() => import("@/components/ui/mapcn-layer-markers").then(m => m.MapPopup), { ssr: false });
const MapControls       = dynamic(() => import("@/components/ui/mapcn-layer-markers").then(m => m.MapControls), { ssr: false });
const MapClusterLayer   = dynamic(() => import("@/components/ui/mapcn-layer-markers").then(m => m.MapClusterLayer), { ssr: false });

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    const unsub = subscribeToFeed(setPosts);
    return () => { unsub?.(); };
  }, []);

  // Posts plotted on the map (those that have coordinates OR a geocodable location)
  const mappedPosts = useMemo(() => {
    return posts
      .map((p) => {
        let coords: [number, number] | null = null;
        if (typeof p.lng === "number" && typeof p.lat === "number") coords = [p.lng, p.lat];
        else if (p.location) coords = geocode(p.location);
        return coords ? { ...p, lng: coords[0], lat: coords[1] } : null;
      })
      .filter(Boolean) as (FeedPost & { lng: number; lat: number })[];
  }, [posts]);

  const featureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point, FeedPost>>(() => ({
    type: "FeatureCollection",
    features: mappedPosts.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: p,
    })),
  }), [mappedPosts]);

  const [selectedPost, setSelectedPost] = useState<(FeedPost & { lng: number; lat: number }) | null>(null);

  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-spotter-ink/80 border-b border-spotter-line">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-spotter-mute hover:text-white flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <div className="h-5 w-px bg-spotter-line" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-spotter-cyan to-spotter-violet grid place-items-center">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold tracking-tight">CarSpotter</span>
              <span className="text-xs text-spotter-mute">/ Feed</span>
            </div>
          </div>
          {user ? (
            <button
              onClick={() => setShowCompose(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:brightness-110 transition"
            >
              <ImagePlus className="w-4 h-4" /> Post a spot
            </button>
          ) : (
            <Link
              href="/signin?next=/feed"
              className="text-sm bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-4 py-2 rounded-lg"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-10 grid lg:grid-cols-[1fr_420px] gap-8">
        {/* MAP — left/main column */}
        <div className="rounded-2xl border border-spotter-line bg-spotter-panel/40 overflow-hidden shadow-[0_-13px_180px_rgba(34,211,238,0.18)]">
          <div className="px-5 py-4 border-b border-spotter-line flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-spotter-cyan flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Worldwide spots
              </div>
              <div className="text-lg font-semibold">Where the community is spotting cars</div>
            </div>
            <div className="text-xs text-spotter-mute">
              {mappedPosts.length} / {posts.length} on map
            </div>
          </div>

          <div className="h-[560px] w-full relative">
            <Map theme="dark" center={[10, 30]} zoom={1.6} attributionControl={false}>
              {mappedPosts.length > 0 && (
                <MapClusterLayer
                  data={featureCollection}
                  clusterRadius={40}
                  clusterColors={["#22D3EE", "#A855F7", "#06B6D4"]}
                  clusterThresholds={[3, 10]}
                  pointColor="#22D3EE"
                  onPointClick={(feature) => setSelectedPost(feature.properties as any)}
                />
              )}

              {selectedPost && (
                <MapPopup
                  longitude={selectedPost.lng}
                  latitude={selectedPost.lat}
                  onClose={() => setSelectedPost(null)}
                  closeButton
                  closeOnClick={false}
                  focusAfterOpen={false}
                  offset={14}
                  className="!bg-spotter-panel !text-white !border-spotter-line !rounded-xl !p-0 !max-w-72 !overflow-hidden"
                >
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedPost.photoUrl} alt="" className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <div className="text-[10px] uppercase tracking-widest text-spotter-cyan mb-1">
                        {selectedPost.category}
                      </div>
                      <div className="font-semibold text-white">
                        {selectedPost.year} {selectedPost.make} {selectedPost.model}
                      </div>
                      <div className="text-xs text-spotter-mute flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {selectedPost.location}
                      </div>
                      {selectedPost.caption && (
                        <p className="text-xs text-zinc-300 mt-2">"{selectedPost.caption}"</p>
                      )}
                      <div className="mt-2 pt-2 border-t border-spotter-line/60 text-[11px] text-spotter-mute">
                        by {selectedPost.displayName}
                      </div>
                    </div>
                  </div>
                </MapPopup>
              )}

              <MapControls position="bottom-right" showZoom showCompass showLocate />
            </Map>
          </div>
        </div>

        {/* FEED — right column */}
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-spotter-cyan mb-3">Live feed</div>
          <h1 className="text-2xl font-semibold mb-5">Today's spots</h1>

          {posts.length === 0 ? (
            <EmptyFeed onPost={() => user ? setShowCompose(true) : null} />
          ) : (
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} currentUserId={user?.uid ?? ""} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCompose && user && (
          <ComposePost
            user={{ uid: user.uid, displayName: user.displayName ?? user.email?.split("@")[0] ?? "Anonymous" }}
            onClose={() => setShowCompose(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function EmptyFeed({ onPost }: { onPost: () => void }) {
  return (
    <div className="bg-spotter-panel/40 border border-spotter-line rounded-2xl p-10 text-center">
      <MessageCircle className="w-10 h-10 text-spotter-cyan mx-auto mb-4" />
      <h2 className="text-lg font-semibold mb-2">No spots yet</h2>
      <p className="text-sm text-spotter-mute mb-5">Be the first to share a car you spotted today.</p>
      <button
        onClick={onPost}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 text-sm"
      >
        <Sparkles className="w-4 h-4" /> Post the first one
      </button>
    </div>
  );
}

function PostCard({ post, currentUserId }: { post: FeedPost; currentUserId: string }) {
  const [likedByMe, setLikedByMe] = useState(post.likedBy.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likedBy.length);
  const [busy, setBusy] = useState(false);

  async function onLike() {
    if (!currentUserId || busy) return;
    setBusy(true);
    const newLiked = !likedByMe;
    setLikedByMe(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    try {
      await toggleLike(post.id, currentUserId, likedByMe);
    } catch {
      setLikedByMe(!newLiked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    }
    setBusy(false);
  }

  const timeAgo = useMemo(() => {
    const s = Math.floor((Date.now() - post.createdAt.getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }, [post.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-spotter-panel/50 border border-spotter-line rounded-2xl overflow-hidden"
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spotter-cyan to-spotter-violet grid place-items-center text-xs font-bold text-white">
          {post.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{post.displayName}</div>
          <div className="flex items-center gap-2 text-[11px] text-spotter-mute">
            <span>{timeAgo}</span>
            {post.location && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="w-3 h-3" /> {post.location}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.photoUrl} alt="" className="w-full aspect-[4/3] object-cover" loading="lazy" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent p-3">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] uppercase tracking-widest bg-spotter-cyan/15 text-spotter-cyan px-1.5 py-0.5 rounded">
              {post.category}
            </span>
            {post.rarity >= 8 && (
              <span className="text-[10px] uppercase tracking-widest bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded">
                Rare {post.rarity}/10
              </span>
            )}
          </div>
          <div className="text-white font-bold text-lg leading-tight">
            <span className="text-white/70 text-sm font-medium">{post.year}</span>{" "}
            {post.make} {post.model}
          </div>
          <div className="text-xs gradient-text font-semibold">{post.valueRange}</div>
        </div>
      </div>

      <div className="px-4 py-3">
        {post.caption && <p className="text-sm text-zinc-200 mb-3 leading-relaxed">{post.caption}</p>}
        <div className="flex items-center gap-3">
          <button
            onClick={onLike}
            disabled={!currentUserId || busy}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-50 transition"
          >
            <Heart className={`w-4 h-4 ${likedByMe ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likeCount}</span>
          </button>
          <button className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-white">
            <MessageCircle className="w-4 h-4" />
            <span className="text-spotter-mute">comment</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ComposePost({
  user,
  onClose,
}: {
  user: { uid: string; displayName: string };
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identified, setIdentified] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setIdentifying(true);
    setErr(null);
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const resp = await fetch("/api/car-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, mimeType: f.type }),
      });
      const data = await resp.json();
      setIdentified(data.result);
    } catch (e: any) {
      setErr(e.message ?? "Couldn't identify");
    } finally {
      setIdentifying(false);
    }
  }

  async function submit() {
    if (!file || !identified) return;
    setPosting(true);
    setErr(null);
    try {
      const coords = location ? geocode(location) : null;
      await createFeedPost({
        userId: user.uid,
        displayName: user.displayName,
        imageFile: file,
        car: {
          make: identified.make,
          model: identified.model,
          year: identified.year,
          category: identified.category,
          rarity: identified.rarity ?? 5,
          valueRange: identified.valueRange,
        },
        caption,
        location: location || undefined,
        coords: coords ? { lng: coords[0], lat: coords[1] } : undefined,
      });
      onClose();
    } catch (e: any) {
      setErr(e.message ?? "Couldn't post");
    } finally {
      setPosting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-spotter-panel border border-spotter-line rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-spotter-panel border-b border-spotter-line px-5 py-3 flex items-center justify-between z-10">
          <div className="text-lg font-semibold">Share a spot</div>
          <button onClick={onClose} className="text-spotter-mute hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!preview ? (
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-spotter-line bg-spotter-ink/50 p-8 text-center hover:border-spotter-cyan/60 transition">
              <ImagePlus className="w-10 h-10 text-spotter-cyan mx-auto mb-3" />
              <div className="font-semibold mb-1">Upload a photo</div>
              <div className="text-xs text-spotter-mute">We'll auto-identify the car</div>
              <input type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            </label>
          ) : (
            <>
              <div className="relative rounded-xl overflow-hidden bg-spotter-ink aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="w-full h-full object-cover" />
                {identifying && (
                  <div className="absolute inset-0 bg-black/60 grid place-items-center">
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-spotter-cyan mx-auto mb-2" />
                      <div className="text-xs uppercase tracking-widest text-spotter-cyan">Identifying…</div>
                    </div>
                  </div>
                )}
              </div>

              {identified && (
                <div className="bg-spotter-ink/50 border border-spotter-line rounded-xl p-3">
                  <div className="text-[10px] uppercase tracking-widest text-spotter-cyan">Identified</div>
                  <div className="font-semibold">
                    {identified.year} {identified.make} {identified.model}
                  </div>
                  <div className="text-xs gradient-text font-semibold">{identified.valueRange}</div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-spotter-mute mb-1">
                  Caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Spotted on a sunday drive…"
                  rows={2}
                  className="w-full bg-spotter-ink border border-spotter-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-spotter-cyan resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-spotter-mute mb-1">
                  Location (pins it on the map)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-spotter-mute" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Rodeo Drive, Monaco, Dubai Marina…"
                    className="w-full bg-spotter-ink border border-spotter-line rounded-xl pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-spotter-cyan"
                  />
                </div>
                {location && !geocode(location) && (
                  <div className="text-[11px] text-amber-300 mt-1">
                    We don't recognize that place — post will go live but won't be on the map.
                  </div>
                )}
                {location && geocode(location) && (
                  <div className="text-[11px] text-emerald-300 mt-1">
                    ✓ Will appear on the worldwide map
                  </div>
                )}
              </div>

              {err && <div className="text-sm text-rose-300">{err}</div>}

              <button
                onClick={submit}
                disabled={!identified || posting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-spotter-cyan to-spotter-violet text-white font-semibold py-3 rounded-xl hover:brightness-110 transition disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post to feed
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
