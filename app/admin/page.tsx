"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Trash2, ArrowUp, ArrowDown, Plus, Save, Lock,
  AlertCircle, CheckCircle2, Upload, Loader2, Type, Film,
  Image as ImageIcon, Star, Wrench, Clapperboard, Sparkles, Gauge, RefreshCw, Quote,
} from "lucide-react";
import { videoEmbedUrl, isDriveVideoUrl, defaultSectionText, type SiteContent, type FeaturedItem, type SectionTextKey } from "@/lib/content";

// Friendly labels for every editable headline/label on the site.
const SECTION_TEXT_FIELDS: { key: SectionTextKey; label: string }[] = [
  { key: "heroTitleLine1", label: "Hero headline — first line" },
  { key: "heroTitleLine2", label: "Hero headline — second line (the rotating word follows it)" },
  { key: "workLabel", label: "Work section — small label" },
  { key: "workHeading", label: "Work section — big heading" },
  { key: "stillsLabel", label: "Gallery — small label" },
  { key: "stillsHeading", label: "Gallery — big heading" },
  { key: "stillsBlurb", label: "Gallery teaser — paragraph" },
  { key: "stillsButton", label: "Gallery teaser — button text" },
  { key: "reelLabel", label: "Color & VFX section — small label" },
  { key: "reelHeading", label: "Color & VFX section — big heading" },
  { key: "brandsLabel", label: "Trusted By section — small label" },
  { key: "skillsLabel", label: "Capabilities section — small label" },
  { key: "skillsHeading", label: "Capabilities section — big heading" },
  { key: "aboutLabel", label: "About section — small label" },
  { key: "contactLabel", label: "Contact section — small label" },
  { key: "reviewsLabel", label: "Reviews page — small label" },
  { key: "reviewsHeading", label: "Reviews page — big heading" },
  { key: "aboutStoryLabel", label: "About page — story label" },
  { key: "aboutSkillsHeading", label: "About page — skills heading" },
  { key: "aboutCtaHeading", label: "About page — closing heading" },
];

/* ---------- small building blocks ---------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-1.5">{label}</label>
      {hint && <p className="text-xs text-white/40 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 text-sm";
const textareaCls =
  "w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 text-sm resize-y";

function TextInput({
  value, onChange, placeholder, onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onBlur?: () => void;
}) {
  return <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onBlur={onBlur} />;
}

function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea className={textareaCls} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />;
}

/** File picker that uploads to /public and fills in the path automatically. */
function MediaField({
  label, hint, value, onChange, password, accept, downscale, onPreview,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  password: string;
  accept: string;
  /** Also create a downscaled web version of large images on upload. */
  downscale?: boolean;
  /** Receives the downscaled version's path when one is created. */
  onPreview?: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = /\.(mp4|webm|mov)$/i.test(value);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("file", file);
      if (downscale) fd.append("downscale", "1");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) {
        onChange(data.path);
        if (data.preview && onPreview) onPreview(data.preview);
      } else setError(data.error || "Upload failed");
    } catch {
      setError("Upload failed — is the site running locally?");
    }
    setUploading(false);
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
          {value ? (
            isVideo ? (
              <video src={value} muted playsInline preload="metadata" className="w-full h-full object-cover" />
            ) : (
              <img src={value} alt="" className="w-full h-full object-cover" />
            )
          ) : (
            <ImageIcon className="w-5 h-5 text-white/20" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? "Uploading..." : "Choose file"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-white/40 hover:text-red-400 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
          <input
            className={`${inputCls} h-9 text-xs font-mono`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste a path like /images/photo.jpg"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>
    </Field>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="p-5 lg:p-6 rounded-xl bg-white/[0.04] border border-white/10 space-y-5">{children}</div>;
}

function RowControls({
  onUp, onDown, onDelete, canUp, canDown,
}: {
  onUp: () => void; onDown: () => void; onDelete: () => void; canUp: boolean; canDown: boolean;
}) {
  const btn = "p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center gap-1">
      <button type="button" className={btn} onClick={onUp} disabled={!canUp} title="Move up"><ArrowUp className="w-4 h-4" /></button>
      <button type="button" className={btn} onClick={onDown} disabled={!canDown} title="Move down"><ArrowDown className="w-4 h-4" /></button>
      <button type="button" className={`${btn} hover:text-red-400`} onClick={onDelete} title="Delete"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

/** Editable list of short text chips (software, gear). */
function ChipListEditor({ items, onChange, addLabel }: { items: string[]; onChange: (v: string[]) => void; addLabel: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v) onChange([...items, v]);
    setDraft("");
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={item + i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/80">
            {item}
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-white/30 hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className={`${inputCls} h-9 max-w-xs`}
          value={draft}
          placeholder={addLabel}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

/* ---------- helpers for list moves ---------- */

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const copy = [...arr];
  const [it] = copy.splice(from, 1);
  copy.splice(to, 0, it);
  return copy;
}

/* ---------- main page ---------- */

type TabId = "text" | "work" | "photos" | "reel" | "brands" | "skills" | "reviews" | "optimize";

const TABS: { id: TabId; name: string; icon: React.ElementType; blurb: string }[] = [
  { id: "text", name: "Site Text", icon: Type, blurb: "Headlines, bio, contact info" },
  { id: "work", name: "Featured Work", icon: Clapperboard, blurb: "Your video projects" },
  { id: "photos", name: "Photos", icon: ImageIcon, blurb: "The stills gallery" },
  { id: "reel", name: "Color & VFX Clips", icon: Sparkles, blurb: "Short clips in the strip" },
  { id: "brands", name: "Brands", icon: Star, blurb: "Who you've worked with" },
  { id: "skills", name: "Skills", icon: Wrench, blurb: "Capabilities, software, gear" },
  { id: "reviews", name: "Reviews", icon: Quote, blurb: "Approve or decline submissions" },
  { id: "optimize", name: "Optimize Files", icon: Gauge, blurb: "Shrink big photos & videos" },
];

type AdminReview = {
  id: string;
  name: string;
  stars: number;
  text: string;
  date: string;
  status: "pending" | "approved";
};

type MediaItem = { path: string; size: number; isVideo: boolean; inUse: boolean };

const fmtMB = (bytes: number) => `${(bytes / 1048576).toFixed(1)} MB`;

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("text");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLocalHost, setIsLocalHost] = useState(true);
  const [genStatus, setGenStatus] = useState<Record<number, { type: "success" | "error" | "busy"; text: string }>>({});
  const [genResolution, setGenResolution] = useState<Record<number, string>>({});
  const [orientationChecking, setOrientationChecking] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const host = window.location.host;
    setIsLocalHost(host.includes("localhost") || host.includes("127.0.0.1"));
    const savedPass = localStorage.getItem("remy_admin_auth");
    if (savedPass) {
      setPassword(savedPass);
      loginWith(savedPass);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWith = async (pass: string) => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Incorrect password.");
        localStorage.removeItem("remy_admin_auth");
      } else {
        localStorage.setItem("remy_admin_auth", pass);
        const contentRes = await fetch("/api/content");
        const contentData = await contentRes.json();
        if (contentData.ok) {
          setContent(contentData.content);
          setIsAuthenticated(true);
        } else {
          setLoginError(contentData.error || "Could not load site content.");
        }
      }
    } catch {
      setLoginError("Could not reach the server.");
    }
    setLoading(false);
  };

  const update = (fn: (c: SiteContent) => SiteContent) => {
    setContent((prev) => (prev ? fn(structuredClone(prev)) : prev));
    setDirty(true);
  };

  const save = async () => {
    if (!content) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/content/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, content }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg({ type: "success", text: "Saved! Refresh the site to see your changes." });
        setDirty(false);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Save failed." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Save failed — could not reach the server." });
    }
    setSaving(false);
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const [cropBusy, setCropBusy] = useState<string | null>(null);

  /* ----- review moderation ----- */
  const [reviewsList, setReviewsList] = useState<AdminReview[] | null>(null);
  const [reviewBusy, setReviewBusy] = useState<string | null>(null);
  const [reviewsBackend, setReviewsBackend] = useState<"redis" | "file" | null>(null);

  const moderateReview = async (action: "list" | "approve" | "decline" | "delete", id?: string) => {
    if (id) setReviewBusy(id);
    try {
      const res = await fetch("/api/reviews/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action, id }),
      });
      const data = await res.json();
      if (data.ok) {
        setReviewsList(data.reviews);
        if (data.backend) setReviewsBackend(data.backend);
      } else setStatusMsg({ type: "error", text: data.error || "Review action failed." });
    } catch {
      setStatusMsg({ type: "error", text: "Review action failed." });
    }
    setReviewBusy(null);
  };

  useEffect(() => {
    if (tab === "reviews" && isAuthenticated && reviewsList === null) moderateReview("list");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isAuthenticated]);

  /* ----- media optimizer state ----- */
  const [mediaItems, setMediaItems] = useState<MediaItem[] | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [optimizing, setOptimizing] = useState<string | null>(null); // file path or "batch"
  const [optResults, setOptResults] = useState<Record<string, string>>({});
  const [optResolution, setOptResolution] = useState("720");

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) setMediaItems(data.items);
      else setStatusMsg({ type: "error", text: data.error || "Could not list files." });
    } catch {
      setStatusMsg({ type: "error", text: "Could not list files." });
    }
    setMediaLoading(false);
  };

  useEffect(() => {
    if (tab === "optimize" && isAuthenticated && mediaItems === null) loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isAuthenticated]);

  const optimizeOne = async (item: MediaItem): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, file: item.path, resolution: optResolution, dropAudio: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setOptResults((r) => ({
          ...r,
          [item.path]: data.skipped
            ? "Already small — unchanged"
            : `${fmtMB(data.before)} → ${fmtMB(data.after)}`,
        }));
        if (!data.skipped) {
          setMediaItems((items) =>
            items ? items.map((m) => (m.path === item.path ? { ...m, size: data.after } : m)) : items
          );
        }
        return true;
      }
      setOptResults((r) => ({ ...r, [item.path]: `Failed: ${data.error}` }));
      return false;
    } catch {
      setOptResults((r) => ({ ...r, [item.path]: "Failed: server unreachable" }));
      return false;
    }
  };

  const optimizeBatch = async (kind: "video" | "image") => {
    if (!mediaItems) return;
    const minSize = kind === "video" ? 3_000_000 : 1_500_000;
    const targets = mediaItems.filter(
      (m) => (kind === "video" ? m.isVideo : !m.isVideo) && m.inUse && m.size > minSize
    );
    setOptimizing("batch");
    for (const item of targets) {
      setOptResults((r) => ({ ...r, [item.path]: "Working…" }));
      await optimizeOne(item);
    }
    setOptimizing(null);
  };

  /** Cut a centred (or focal-point) detail crop out of an image via ffmpeg. */
  const autoCrop = async (
    image: string,
    apply: (path: string) => void,
    busyKey: string,
    focusX = 50,
    focusY = 50
  ) => {
    if (!image) {
      setStatusMsg({ type: "error", text: "Add the photo first." });
      return;
    }
    setCropBusy(busyKey);
    try {
      const res = await fetch("/api/admin/zoom-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, image, focusX, focusY, zoom: 5 }),
      });
      const data = await res.json();
      if (data.ok) apply(data.path);
      else setStatusMsg({ type: "error", text: data.error || "Crop failed." });
    } catch {
      setStatusMsg({ type: "error", text: "Crop failed — server unreachable." });
    }
    setCropBusy(null);
  };

  // Google Drive links carry no orientation hint in the URL, so measure the
  // real file's dimensions the moment one is pasted. YouTube is left alone —
  // its Shorts-URL heuristic already frames correctly.
  const probeOrientation = async (idx: number) => {
    const url = content?.featuredWork[idx]?.videoUrl;
    if (!url || !isDriveVideoUrl(url)) return;
    setOrientationChecking((s) => ({ ...s, [idx]: true }));
    try {
      const res = await fetch("/api/admin/probe-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, videoUrl: url }),
      });
      const data = await res.json();
      if (data.ok) {
        update((c) => ((c.featuredWork[idx].videoVertical = data.vertical), c));
      }
    } catch {
      // Best-effort — the existing URL-based guess still applies as a fallback.
    }
    setOrientationChecking((s) => ({ ...s, [idx]: false }));
  };

  const generatePreview = async (idx: number) => {
    if (!content) return;
    const item = content.featuredWork[idx];
    if (!item.videoFull && !item.videoUrl) {
      setGenStatus((s) => ({ ...s, [idx]: { type: "error", text: "Add a full video file or a YouTube/Google Drive link first." } }));
      return;
    }
    // No preview path yet? Pick a sensible one automatically.
    let previewPath = item.videoPreview;
    if (!previewPath) {
      previewPath = `/videos/uploads/${item.slug || `project-${idx + 1}`}-preview.mp4`;
      update((c) => ((c.featuredWork[idx].videoPreview = previewPath), c));
    }
    setGenStatus((s) => ({ ...s, [idx]: { type: "busy", text: item.videoFull ? "Generating preview… this can take a minute." : "Pulling from the link and generating… this can take a few minutes." } }));
    try {
      const res = await fetch("/api/admin/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          videoFull: item.videoFull,
          videoUrl: item.videoUrl,
          videoPreview: previewPath,
          start: item.videoPreviewStart ?? 0,
          end: item.videoPreviewEnd ?? (item.videoPreviewStart ?? 0) + 7,
          resolution: genResolution[idx] || "1080",
        }),
      });
      const data = await res.json();
      if (data.ok && data.poster) {
        // Use the extracted frame as the card's instant-loading thumbnail.
        update((c) => ((c.featuredWork[idx].img = data.poster), c));
      }
      setGenStatus((s) => ({
        ...s,
        [idx]: data.ok
          ? { type: "success", text: data.poster ? "Preview + thumbnail generated!" : "Preview generated!" }
          : { type: "error", text: data.error || "Generation failed." },
      }));
    } catch {
      setGenStatus((s) => ({ ...s, [idx]: { type: "error", text: "Generation failed — server unreachable." } }));
    }
  };

  /* ---------- login screen ---------- */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </a>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-display mb-2">Site Editor</h1>
            <p className="text-sm text-white/50 mb-6">Edit your text, videos, photos, and skills — no code needed.</p>
            {!isLocalHost && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                The editor only works when the site is running on your own computer (localhost).
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginWith(password);
              }}
              className="space-y-4"
            >
              <input
                type="password"
                className={inputCls}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {loginError && <p className="text-xs text-red-400">{loginError}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Unlock editor
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;
  const { profile, featuredWork, photos, brands, skills } = content;
  const reelClips = content.reelClips || [];
  const showcase = content.showcasePhoto || { image: "", preview: "", caption: "", focusX: 50, focusY: 50, zoom: 2.5 };
  const ensureShowcase = (c: SiteContent) => {
    if (!c.showcasePhoto) c.showcasePhoto = { image: "", preview: "", caption: "", focusX: 50, focusY: 50, zoom: 2.5 };
    return c.showcasePhoto;
  };

  /* ---------- editor ---------- */

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <a href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">View site</span>
            </a>
            <span className="text-white/20 hidden sm:inline">/</span>
            <h1 className="font-display text-lg truncate">Site Editor</h1>
          </div>
          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className={`hidden md:inline-flex items-center gap-1.5 text-xs ${statusMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {statusMsg.text}
              </span>
            )}
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Tabs */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left shrink-0 transition-colors ${
                tab === t.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <t.icon className="w-4 h-4 shrink-0" />
              <span>
                <span className="block text-sm font-medium">{t.name}</span>
                <span className="hidden lg:block text-[11px] text-white/35">{t.blurb}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Panels */}
        <div className="space-y-6 pb-32">
          {/* ---------- SITE TEXT ---------- */}
          {tab === "text" && (
            <>
              <Card>
                <h2 className="font-display text-xl">Browser tab & search</h2>
                <Field label="Browser tab title" hint="Shown in the browser tab and as the headline in Google results. Changes apply after the site restarts/redeploys.">
                  <TextInput
                    value={profile.siteTitle || ""}
                    placeholder="Remy Wilkins — Videographer & Web Designer"
                    onChange={(v) => update((c) => ((c.profile.siteTitle = v), c))}
                  />
                </Field>
                <Field label="Search description" hint="The sentence under your name in Google results and link previews.">
                  <TextArea
                    rows={2}
                    value={profile.siteDescription || ""}
                    onChange={(v) => update((c) => ((c.profile.siteDescription = v), c))}
                  />
                </Field>
              </Card>

              <Card>
                <h2 className="font-display text-xl">Home page hero</h2>
                <Field label="Intro line" hint="The small line above the big headline.">
                  <TextInput value={profile.heroEyebrow} onChange={(v) => update((c) => ((c.profile.heroEyebrow = v), c))} />
                </Field>
                <Field label="Rotating words" hint='The words that cycle in "Bringing ideas to life with …"'>
                  <ChipListEditor
                    items={profile.heroWords}
                    onChange={(v) => update((c) => ((c.profile.heroWords = v), c))}
                    addLabel="Add a word…"
                  />
                </Field>
                <Field label="Stats" hint="The three numbers at the bottom of the hero.">
                  <div className="space-y-2">
                    {profile.heroStats.map((stat, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className={`${inputCls} h-9 w-28`} value={stat.value} placeholder="50+"
                          onChange={(e) => update((c) => ((c.profile.heroStats[i].value = e.target.value), c))} />
                        <input className={`${inputCls} h-9 flex-1`} value={stat.label} placeholder="videos delivered"
                          onChange={(e) => update((c) => ((c.profile.heroStats[i].label = e.target.value), c))} />
                        <button type="button" className="p-2 text-white/40 hover:text-red-400"
                          onClick={() => update((c) => ((c.profile.heroStats = c.profile.heroStats.filter((_, j) => j !== i)), c))}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button"
                      className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium"
                      onClick={() => update((c) => ((c.profile.heroStats = [...c.profile.heroStats, { value: "", label: "" }]), c))}>
                      <Plus className="w-3.5 h-3.5" /> Add stat
                    </button>
                  </div>
                </Field>
              </Card>

              <Card>
                <h2 className="font-display text-xl">About</h2>
                <Field label="Headline">
                  <TextInput value={profile.aboutHeadline} onChange={(v) => update((c) => ((c.profile.aboutHeadline = v), c))} />
                </Field>
                <Field label="Subheading">
                  <TextArea rows={2} value={profile.aboutSubheading} onChange={(v) => update((c) => ((c.profile.aboutSubheading = v), c))} />
                </Field>
                <Field label="Bio — paragraph 1">
                  <TextArea value={profile.aboutBio1} onChange={(v) => update((c) => ((c.profile.aboutBio1 = v), c))} />
                </Field>
                <Field label="Bio — paragraph 2">
                  <TextArea value={profile.aboutBio2} onChange={(v) => update((c) => ((c.profile.aboutBio2 = v), c))} />
                </Field>
                <MediaField
                  label="Portrait photo (optional)"
                  hint="Shown on the About page. Leave empty to show a quote instead."
                  value={profile.aboutPortrait || ""}
                  onChange={(v) => update((c) => ((c.profile.aboutPortrait = v), c))}
                  password={password}
                  accept="image/*"
                />
              </Card>

              <Card>
                <h2 className="font-display text-xl">Contact</h2>
                <Field label="Headline">
                  <TextInput value={profile.contactHeadline} onChange={(v) => update((c) => ((c.profile.contactHeadline = v), c))} />
                </Field>
                <Field label="Subheading">
                  <TextArea rows={2} value={profile.contactSubheading} onChange={(v) => update((c) => ((c.profile.contactSubheading = v), c))} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email">
                    <TextInput value={profile.contactEmail} onChange={(v) => update((c) => ((c.profile.contactEmail = v), c))} />
                  </Field>
                  <Field label="Location">
                    <TextInput value={profile.contactLocation} onChange={(v) => update((c) => ((c.profile.contactLocation = v), c))} />
                  </Field>
                </div>
                <Field label="Availability note" hint='Shown in the footer, e.g. "Available for work".'>
                  <TextInput value={profile.availability} onChange={(v) => update((c) => ((c.profile.availability = v), c))} />
                </Field>
                <Field
                  label="Booking calendar link (optional)"
                  hint="Paste a Calendly event link (e.g. https://calendly.com/yourname/30min) and a booking calendar appears on the Contact page. Connect Zoom inside Calendly so booked calls get a Zoom link automatically."
                >
                  <TextInput
                    value={profile.bookingUrl || ""}
                    placeholder="https://calendly.com/yourname/30min"
                    onChange={(v) => update((c) => ((c.profile.bookingUrl = v), c))}
                  />
                </Field>
                <MediaField
                  label="Footer banner image"
                  hint="The wide photo above the footer. Remove it to hide the banner entirely."
                  value={profile.footerBanner || ""}
                  onChange={(v) => update((c) => ((c.profile.footerBanner = v), c))}
                  password={password}
                  accept="image/*"
                />
                <Field label="Social links" hint="Leave the link empty to hide one.">
                  <div className="space-y-2">
                    {profile.socials.map((s, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className={`${inputCls} h-9 w-36`} value={s.name} placeholder="Instagram"
                          onChange={(e) => update((c) => ((c.profile.socials[i].name = e.target.value), c))} />
                        <input className={`${inputCls} h-9 flex-1`} value={s.url} placeholder="https://instagram.com/yourhandle"
                          onChange={(e) => update((c) => ((c.profile.socials[i].url = e.target.value), c))} />
                        <button type="button" className="p-2 text-white/40 hover:text-red-400"
                          onClick={() => update((c) => ((c.profile.socials = c.profile.socials.filter((_, j) => j !== i)), c))}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button"
                      className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium"
                      onClick={() => update((c) => ((c.profile.socials = [...c.profile.socials, { name: "", url: "" }]), c))}>
                      <Plus className="w-3.5 h-3.5" /> Add social
                    </button>
                  </div>
                </Field>
              </Card>

              <Card>
                <h2 className="font-display text-xl">Section titles</h2>
                <p className="text-sm text-white/40 -mt-3">
                  Every small label and big heading across the site. The numbers (01, 02, …) are added automatically.
                </p>
                {SECTION_TEXT_FIELDS.map((f) => (
                  <Field key={f.key} label={f.label}>
                    <TextInput
                      value={content.sectionText?.[f.key] ?? defaultSectionText[f.key]}
                      onChange={(v) =>
                        update((c) => ((c.sectionText = { ...defaultSectionText, ...(c.sectionText || {}), [f.key]: v }), c))
                      }
                    />
                  </Field>
                ))}
              </Card>
            </>
          )}

          {/* ---------- FEATURED WORK ---------- */}
          {tab === "work" && (
            <>
              {featuredWork.map((item, i) => (
                <Card key={i}>
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-display text-xl truncate">
                      <span className="text-white/30 font-mono text-sm mr-3">{String(i + 1).padStart(2, "0")}</span>
                      {item.title || "Untitled project"}
                    </h2>
                    <RowControls
                      canUp={i > 0}
                      canDown={i < featuredWork.length - 1}
                      onUp={() => update((c) => ((c.featuredWork = moveItem(c.featuredWork, i, i - 1)), c))}
                      onDown={() => update((c) => ((c.featuredWork = moveItem(c.featuredWork, i, i + 1)), c))}
                      onDelete={() => {
                        if (confirm(`Delete "${item.title}"? You can't undo this after saving.`)) {
                          update((c) => ((c.featuredWork = c.featuredWork.filter((_, j) => j !== i)), c));
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Title">
                      <TextInput value={item.title} onChange={(v) => update((c) => ((c.featuredWork[i].title = v), c))} />
                    </Field>
                    <Field label="Web address name" hint="Lowercase letters, numbers, and dashes only, e.g. my-cool-video">
                      <TextInput
                        value={item.slug}
                        onChange={(v) =>
                          update((c) => ((c.featuredWork[i].slug = v.toLowerCase().replace(/[^a-z0-9-]+/g, "-")), c))
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Description">
                    <TextArea value={item.description || ""} onChange={(v) => update((c) => ((c.featuredWork[i].description = v), c))} />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Client">
                      <TextInput value={item.client || ""} onChange={(v) => update((c) => ((c.featuredWork[i].client = v), c))} />
                    </Field>
                    <Field label="Your role">
                      <TextInput value={item.role || ""} onChange={(v) => update((c) => ((c.featuredWork[i].role = v), c))} />
                    </Field>
                    <Field label="Date">
                      <TextInput value={item.date || ""} onChange={(v) => update((c) => ((c.featuredWork[i].date = v), c))} />
                    </Field>
                  </div>

                  <Field
                    label="YouTube or Google Drive link (recommended)"
                    hint="Upload the full film to YouTube (unlisted is fine) and paste the link here, or paste a Google Drive share link (set sharing to “Anyone with the link”). The project page will show a player — no big file upload needed. Vimeo links work too."
                  >
                    <TextInput
                      value={item.videoUrl || ""}
                      placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../view"
                      onChange={(v) => update((c) => ((c.featuredWork[i].videoUrl = v), c))}
                      onBlur={() => probeOrientation(i)}
                    />
                    {item.videoUrl && item.videoUrl.trim() !== "" && (
                      videoEmbedUrl(item.videoUrl) ? (
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {!isDriveVideoUrl(item.videoUrl)
                            ? "Link recognized — this will play on the project page."
                            : orientationChecking[i]
                              ? "Drive link recognized — checking orientation…"
                              : `Drive link recognized — will play in a ${item.videoVertical ? "vertical (9:16)" : "widescreen (16:9)"} frame.`}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-400 mt-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> That doesn't look like a YouTube, Vimeo, or Google Drive link.
                        </p>
                      )
                    )}
                  </Field>

                  <MediaField
                    label="Full video file (only if not using YouTube/Drive)"
                    hint="A video file on this computer. Skipped when a YouTube or Google Drive link is set above."
                    value={item.videoFull || ""}
                    onChange={(v) => update((c) => ((c.featuredWork[i].videoFull = v), c))}
                    password={password}
                    accept="video/*"
                  />
                  <MediaField
                    label="Loop preview"
                    hint="A short, silent clip that plays on the home page card. Generate one below, or upload your own."
                    value={item.videoPreview || ""}
                    onChange={(v) => update((c) => ((c.featuredWork[i].videoPreview = v), c))}
                    password={password}
                    accept="video/*"
                  />

                  {/* Preview generator */}
                  <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Film className="w-4 h-4" /> Auto-make a loop preview
                    </div>
                    <p className="text-xs text-white/40">
                      Uses the full video file if there is one, otherwise pulls straight from the YouTube or Google Drive link above.
                      Leave the loop preview path empty and it picks one for you.
                    </p>
                    <div className="flex flex-wrap items-end gap-3">
                      <Field label="Start at (seconds)">
                        <input type="number" min={0} step={0.1} className={`${inputCls} h-9 w-28`}
                          value={item.videoPreviewStart ?? 0}
                          onChange={(e) => update((c) => ((c.featuredWork[i].videoPreviewStart = parseFloat(e.target.value) || 0), c))} />
                      </Field>
                      <Field label="End at (seconds)">
                        <input type="number" min={0} step={0.1} className={`${inputCls} h-9 w-28`}
                          value={item.videoPreviewEnd ?? ""}
                          onChange={(e) => update((c) => ((c.featuredWork[i].videoPreviewEnd = e.target.value === "" ? undefined : parseFloat(e.target.value)), c))} />
                      </Field>
                      <Field label="Quality">
                        <select
                          className={`${inputCls} h-9 w-32`}
                          value={genResolution[i] || "1080"}
                          onChange={(e) => setGenResolution((s) => ({ ...s, [i]: e.target.value }))}
                        >
                          <option value="720">720p (small)</option>
                          <option value="1080">1080p</option>
                          <option value="2160">4K</option>
                          <option value="original">Original</option>
                        </select>
                      </Field>
                      <button
                        type="button"
                        onClick={() => generatePreview(i)}
                        disabled={genStatus[i]?.type === "busy"}
                        className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {genStatus[i]?.type === "busy" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
                        Generate preview
                      </button>
                    </div>
                    {genStatus[i] && genStatus[i].type !== "busy" && (
                      <p className={`text-xs ${genStatus[i].type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                        {genStatus[i].text}
                      </p>
                    )}
                    {genStatus[i]?.type === "busy" && <p className="text-xs text-white/50">{genStatus[i].text}</p>}
                  </div>

                  {/* Gallery photos for this project */}
                  <Field label="Project gallery" hint="Photos or short clips shown on the project page.">
                    <div className="space-y-3">
                      {(item.photos || []).map((photo, pi) => (
                        <div key={pi} className="flex items-center gap-3">
                          <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            {/\.(mp4|webm|mov)$/i.test(photo) ? (
                              <video src={photo} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                            ) : (
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                            )}
                          </div>
                          <input className={`${inputCls} h-9 flex-1 text-xs font-mono`} value={photo}
                            onChange={(e) => update((c) => ((c.featuredWork[i].photos![pi] = e.target.value), c))} />
                          <button type="button" className="p-2 text-white/40 hover:text-red-400"
                            onClick={() => update((c) => ((c.featuredWork[i].photos = (c.featuredWork[i].photos || []).filter((_, j) => j !== pi)), c))}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <GalleryUploader
                        password={password}
                        onUploaded={(path) => update((c) => ((c.featuredWork[i].photos = [...(c.featuredWork[i].photos || []), path]), c))}
                      />
                    </div>
                  </Field>
                </Card>
              ))}

              <button
                type="button"
                onClick={() =>
                  update((c) => {
                    const blank: FeaturedItem = {
                      slug: `new-project-${c.featuredWork.length + 1}`,
                      title: "New Project",
                      description: "",
                      client: "",
                      role: "",
                      date: String(new Date().getFullYear()),
                      gear: [],
                      photos: [],
                    };
                    c.featuredWork = [...c.featuredWork, blank];
                    return c;
                  })
                }
                className="w-full py-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-colors text-sm inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add a project
              </button>
            </>
          )}

          {/* ---------- PHOTOS ---------- */}
          {tab === "photos" && (
            <>
            <Card>
              <h2 className="font-display text-xl">Gallery photos</h2>
              <p className="text-sm text-white/40 -mt-3">
                These fill the Gallery page (the home page shows the first few behind the "view gallery" button).
                Upload as many as you like — they load lazily.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="aspect-video rounded-md overflow-hidden bg-white/5">
                      <img src={photo.src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <input className={`${inputCls} h-9`} value={photo.caption || ""} placeholder="Caption (optional)"
                      onChange={(e) => update((c) => ((c.photos[i].caption = e.target.value), c))} />

                    {/* Detail crop — shown in the lightbox when a visitor clicks the photo */}
                    {photo.zoomSrc ? (
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 shrink-0 rounded overflow-hidden bg-white/5 border border-white/10">
                          <img src={photo.zoomSrc} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-white/40 flex-1">Detail crop attached</span>
                        <button type="button" className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                          title="Remove detail crop"
                          onClick={() => update((c) => ((c.photos[i].zoomSrc = undefined), c))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={cropBusy === `photo-${i}`}
                        onClick={() => autoCrop(photo.src, (path) => update((c) => ((c.photos[i].zoomSrc = path), c)), `photo-${i}`)}
                        className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-dashed border-white/15 text-[11px] text-white/50 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
                      >
                        {cropBusy === `photo-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add zoom detail (auto-crop)
                      </button>
                    )}

                    <div className="flex items-center justify-between">
                      <RowControls
                        canUp={i > 0}
                        canDown={i < photos.length - 1}
                        onUp={() => update((c) => ((c.photos = moveItem(c.photos, i, i - 1)), c))}
                        onDown={() => update((c) => ((c.photos = moveItem(c.photos, i, i + 1)), c))}
                        onDelete={() => update((c) => ((c.photos = c.photos.filter((_, j) => j !== i)), c))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <GalleryUploader
                password={password}
                accept="image/*"
                label="Upload photos — select as many as you like"
                onUploaded={(path) => update((c) => ((c.photos = [...c.photos, { src: path, caption: "" }]), c))}
              />
            </Card>

            <Card>
              <h2 className="font-display text-xl">Featured still (zoom showcase)</h2>
              <p className="text-sm text-white/40 -mt-3">
                A compact photo block shown just before the stills gallery. As visitors scroll past,
                a detail window grows over the spot you choose, showing a zoomed-in crop. Two small
                files — export both around 1MB. Remove the photo to hide the section.
              </p>
              <MediaField
                label="Base photo"
                hint="The flat, full-frame version. If you upload a big file, a lighter version is created and used automatically."
                value={showcase.image}
                onChange={(v) =>
                  update((c) => {
                    const s = ensureShowcase(c);
                    s.image = v;
                    if (!v) s.zoomImage = "";
                    return c;
                  })
                }
                onPreview={(p) => update((c) => ((ensureShowcase(c).image = p), c))}
                password={password}
                accept="image/*"
                downscale
              />
              <MediaField
                label="Detail crop"
                hint="A tightly zoomed export of the interesting area — this is what appears in the window. Upload your own for best quality, or auto-generate one below."
                value={showcase.zoomImage || ""}
                onChange={(v) => update((c) => ((ensureShowcase(c).zoomImage = v), c))}
                password={password}
                accept="image/*"
              />
              <button
                type="button"
                disabled={cropBusy === "showcase"}
                onClick={() =>
                  autoCrop(
                    showcase.image,
                    (path) => update((c) => ((ensureShowcase(c).zoomImage = path), c)),
                    "showcase",
                    showcase.focusX,
                    showcase.focusY
                  )
                }
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {cropBusy === "showcase" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                Auto-generate crop from the base photo
              </button>
              <Field label="Caption (optional)">
                <TextInput
                  value={showcase.caption || ""}
                  placeholder='e.g. "Straight out of camera — DSC04769"'
                  onChange={(v) => update((c) => ((ensureShowcase(c).caption = v), c))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Crop spot — across" hint="Where the auto-crop aims: 0 = left edge, 100 = right edge. Re-generate after changing.">
                  <input type="number" min={0} max={100} className={`${inputCls} h-10`}
                    value={showcase.focusX}
                    onChange={(e) => update((c) => ((ensureShowcase(c).focusX = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))), c))} />
                </Field>
                <Field label="Crop spot — down" hint="0 = top edge, 100 = bottom edge. Re-generate after changing.">
                  <input type="number" min={0} max={100} className={`${inputCls} h-10`}
                    value={showcase.focusY}
                    onChange={(e) => update((c) => ((ensureShowcase(c).focusY = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))), c))} />
                </Field>
              </div>
            </Card>
            </>
          )}

          {/* ---------- COLOR & VFX CLIPS ---------- */}
          {tab === "reel" && (
            <Card>
              <h2 className="font-display text-xl">Color grading & VFX clips</h2>
              <p className="text-sm text-white/40 -mt-3">
                Short 3–6 second clips shown in the auto-playing showreel on the home page.
                They play one after another, so the order below is the play order. 1080p exports keep them fast.
              </p>
              <div className="space-y-3">
                {reelClips.map((clip, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 h-12 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                      <video src={clip.src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                    </div>
                    <input
                      className={`${inputCls} h-10 flex-1`}
                      value={clip.label || ""}
                      placeholder='Label shown on screen, e.g. "Teal & orange grade" or "Sky replacement"'
                      onChange={(e) => update((c) => ((c.reelClips![i].label = e.target.value), c))}
                    />
                    <RowControls
                      canUp={i > 0}
                      canDown={i < reelClips.length - 1}
                      onUp={() => update((c) => ((c.reelClips = moveItem(c.reelClips!, i, i - 1)), c))}
                      onDown={() => update((c) => ((c.reelClips = moveItem(c.reelClips!, i, i + 1)), c))}
                      onDelete={() => update((c) => ((c.reelClips = c.reelClips!.filter((_, j) => j !== i)), c))}
                    />
                  </div>
                ))}
              </div>
              <GalleryUploader
                password={password}
                accept="video/*"
                label="Upload clips — select as many as you like"
                onUploaded={(path) => update((c) => ((c.reelClips = [...(c.reelClips || []), { src: path, label: "" }]), c))}
              />
            </Card>
          )}

          {/* ---------- BRANDS ---------- */}
          {tab === "brands" && (
            <Card>
              <h2 className="font-display text-xl">Brands & people you've worked with</h2>
              <p className="text-sm text-white/40 -mt-3">Shown in the scrolling "Trusted by" banner. A logo is optional — without one the name is shown in nice type.</p>
              <div className="space-y-3">
                {brands.map((brand, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                      {brand.logo ? <img src={brand.logo} alt="" className="w-full h-full object-contain" /> : <Star className="w-4 h-4 text-white/20" />}
                    </div>
                    <input className={`${inputCls} h-10 flex-1`} value={brand.name} placeholder="Brand or client name"
                      onChange={(e) => update((c) => ((c.brands[i].name = e.target.value), c))} />
                    <LogoUploadButton password={password} onUploaded={(p) => update((c) => ((c.brands[i].logo = p), c))} />
                    <RowControls
                      canUp={i > 0}
                      canDown={i < brands.length - 1}
                      onUp={() => update((c) => ((c.brands = moveItem(c.brands, i, i - 1)), c))}
                      onDown={() => update((c) => ((c.brands = moveItem(c.brands, i, i + 1)), c))}
                      onDelete={() => update((c) => ((c.brands = c.brands.filter((_, j) => j !== i)), c))}
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => update((c) => ((c.brands = [...c.brands, { name: "", logo: "" }]), c))}
                className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add brand
              </button>
            </Card>
          )}

          {/* ---------- SKILLS ---------- */}
          {tab === "skills" && (
            <>
              <Card>
                <h2 className="font-display text-xl">Capabilities</h2>
                <p className="text-sm text-white/40 -mt-3">The big list of what you do.</p>
                <div className="space-y-3">
                  {skills.capabilities.map((cap, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white/[0.03] border border-white/10 space-y-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input className={`${inputCls} h-10`} value={cap.name} placeholder="Videography & Editing"
                            onChange={(e) => update((c) => ((c.skills.capabilities[i].name = e.target.value), c))} />
                          <input className={`${inputCls} h-9 text-xs`} value={cap.desc} placeholder="One-line description"
                            onChange={(e) => update((c) => ((c.skills.capabilities[i].desc = e.target.value), c))} />
                        </div>
                        <RowControls
                          canUp={i > 0}
                          canDown={i < skills.capabilities.length - 1}
                          onUp={() => update((c) => ((c.skills.capabilities = moveItem(c.skills.capabilities, i, i - 1)), c))}
                          onDown={() => update((c) => ((c.skills.capabilities = moveItem(c.skills.capabilities, i, i + 1)), c))}
                          onDelete={() => update((c) => ((c.skills.capabilities = c.skills.capabilities.filter((_, j) => j !== i)), c))}
                        />
                      </div>
                      <Field label="Expanded paragraph (optional)" hint="Shown when a visitor clicks the row open. Leave empty for a plain row.">
                        <TextArea rows={3} value={cap.details || ""} onChange={(v) => update((c) => ((c.skills.capabilities[i].details = v), c))} />
                      </Field>
                      <MediaField
                        label="Screenshot / still (optional)"
                        hint="Shown next to the paragraph when the row is open."
                        value={cap.image || ""}
                        onChange={(v) => update((c) => ((c.skills.capabilities[i].image = v), c))}
                        password={password}
                        accept="image/*"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => update((c) => ((c.skills.capabilities = [...c.skills.capabilities, { name: "", desc: "" }]), c))}
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Add capability
                </button>
              </Card>

              <Card>
                <h2 className="font-display text-xl">Software</h2>
                <ChipListEditor
                  items={skills.software}
                  onChange={(v) => update((c) => ((c.skills.software = v), c))}
                  addLabel="e.g. DaVinci Resolve"
                />
              </Card>

              <Card>
                <h2 className="font-display text-xl">Camera & gear</h2>
                <ChipListEditor
                  items={skills.gear}
                  onChange={(v) => update((c) => ((c.skills.gear = v), c))}
                  addLabel="e.g. BMPCC 6K"
                />
              </Card>
            </>
          )}

          {/* ---------- REVIEWS ---------- */}
          {tab === "reviews" && (
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl">Visitor reviews</h2>
                  <p className="text-sm text-white/40 mt-1">
                    Submissions from the Reviews page wait here — nothing shows on the site until you approve it.
                  </p>
                  {reviewsBackend && (
                    <p className={`text-xs mt-2 font-mono ${reviewsBackend === "redis" ? "text-emerald-400" : "text-amber-300"}`}>
                      {reviewsBackend === "redis"
                        ? "● Connected to the cloud database — you're moderating the live site's reviews."
                        : "● Using the local file — fine for now, but the live site needs the database connected (see .env.example)."}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => moderateReview("list")}
                  className="inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {reviewsList === null ? (
                <p className="text-sm text-white/40 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </p>
              ) : reviewsList.length === 0 ? (
                <p className="text-sm text-white/40">No reviews yet.</p>
              ) : (
                <div className="space-y-6">
                  {(["pending", "approved"] as const).map((group) => {
                    const items = reviewsList.filter((r) => r.status === group);
                    if (items.length === 0) return null;
                    return (
                      <div key={group}>
                        <h3 className={`text-xs font-mono uppercase tracking-[0.25em] mb-3 ${group === "pending" ? "text-amber-300" : "text-emerald-400"}`}>
                          {group === "pending" ? `Waiting for approval (${items.length})` : `Live on the site (${items.length})`}
                        </h3>
                        <div className="space-y-3">
                          {items.map((review) => (
                            <div key={review.id} className={`p-4 rounded-lg border space-y-2 ${group === "pending" ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.03] border-white/10"}`}>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm text-white font-medium">{review.name}</span>
                                <span className="inline-flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <Star key={n} className={`w-3.5 h-3.5 ${n <= review.stars ? "text-amber-300 fill-amber-300" : "text-white/20"}`} />
                                  ))}
                                </span>
                                <span className="text-[11px] font-mono text-white/35 ml-auto">
                                  {new Date(review.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-white/70 leading-relaxed">{review.text}</p>
                              <div className="flex gap-2 pt-1">
                                {group === "pending" ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={reviewBusy === review.id}
                                      onClick={() => moderateReview("approve", review.id)}
                                      className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                                    >
                                      {reviewBusy === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      disabled={reviewBusy === review.id}
                                      onClick={() => moderateReview("decline", review.id)}
                                      className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:text-red-400 hover:border-red-400/30 transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Decline
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={reviewBusy === review.id}
                                    onClick={() => {
                                      if (confirm(`Remove the review from ${review.name}?`)) moderateReview("delete", review.id);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:text-red-400 hover:border-red-400/30 transition-colors disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove from site
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* ---------- OPTIMIZE FILES ---------- */}
          {tab === "optimize" && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl">Shrink big files</h2>
                  <p className="text-sm text-white/40 mt-1 max-w-lg">
                    Re-encodes photos and videos to web size, keeping the same file name — nothing
                    on the site needs re-linking. Originals are replaced, so keep your master copies
                    in your own library.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadMedia}
                  disabled={mediaLoading}
                  className="inline-flex items-center gap-2 px-3.5 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${mediaLoading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10">
                <span className="text-xs text-white/50">Video quality:</span>
                <select
                  className={`${inputCls} h-9 w-40`}
                  value={optResolution}
                  onChange={(e) => setOptResolution(e.target.value)}
                >
                  <option value="720">720p (recommended)</option>
                  <option value="1080">1080p</option>
                </select>
                <button
                  type="button"
                  onClick={() => optimizeBatch("video")}
                  disabled={optimizing !== null || !mediaItems}
                  className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {optimizing === "batch" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gauge className="w-3.5 h-3.5" />}
                  Shrink all used videos over 3 MB
                </button>
                <button
                  type="button"
                  onClick={() => optimizeBatch("image")}
                  disabled={optimizing !== null || !mediaItems}
                  className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {optimizing === "batch" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  Shrink all used photos over 1.5 MB
                </button>
                {mediaItems && (
                  <span className="text-xs text-white/40 ml-auto">
                    {mediaItems.length} files · {fmtMB(mediaItems.reduce((s, m) => s + m.size, 0))} total
                  </span>
                )}
              </div>

              {mediaLoading && !mediaItems ? (
                <p className="text-sm text-white/40 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning files…
                </p>
              ) : (
                <div className="space-y-1.5">
                  {(mediaItems || []).map((item) => (
                    <div
                      key={item.path}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
                    >
                      <div className="w-10 h-10 shrink-0 rounded overflow-hidden bg-white/5 border border-white/10">
                        {item.isVideo ? (
                          <video src={item.path} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.path} alt="" loading="lazy" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-mono text-white/70 truncate">{item.path}</span>
                        <span className="text-[11px] text-white/35">
                          {fmtMB(item.size)}
                          {item.inUse ? " · on the site" : " · not used anywhere"}
                          {optResults[item.path] && (
                            <span className={optResults[item.path].startsWith("Failed") ? " text-red-400" : " text-emerald-400"}>
                              {" "}· {optResults[item.path]}
                            </span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={optimizing !== null}
                        onClick={async () => {
                          setOptimizing(item.path);
                          setOptResults((r) => ({ ...r, [item.path]: "Working…" }));
                          await optimizeOne(item);
                          setOptimizing(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-medium transition-colors disabled:opacity-40 shrink-0"
                      >
                        {optimizing === item.path ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gauge className="w-3 h-3" />}
                        Shrink
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Mobile status toast */}
      {statusMsg && (
        <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs flex items-center gap-2 ${
          statusMsg.type === "success" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"
        }`}>
          {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}

/* ---------- upload helpers used above ---------- */

function GalleryUploader({
  password, onUploaded, accept = "image/*,video/*", label = "Upload photos or clips",
}: {
  password: string;
  onUploaded: (path: string) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Select as many files as you like — they upload one after another.
  const uploadAll = async (files: FileList) => {
    const list = Array.from(files);
    setUploading(true);
    setError(null);
    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      if (list.length > 1) setProgress(`${i + 1} of ${list.length}`);
      try {
        const fd = new FormData();
        fd.append("password", password);
        fd.append("file", list[i]);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.ok) onUploaded(data.path);
        else {
          failed++;
          setError(data.error || "Upload failed");
        }
      } catch {
        failed++;
        setError("Upload failed");
      }
    }
    setUploading(false);
    setProgress(null);
    if (failed > 0 && list.length > 1) {
      setError(`${failed} of ${list.length} files failed to upload`);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 px-4 h-10 rounded-lg border border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? `Uploading${progress ? ` ${progress}` : ""}…` : label}
      </button>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadAll(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function LogoUploadButton({ password, onUploaded }: { password: string; onUploaded: (path: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) onUploaded(data.path);
    } catch {
      // error surfaces as the logo simply not changing
    }
    setUploading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Upload logo"
        className="inline-flex items-center gap-1.5 px-3 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium shrink-0 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Logo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </>
  );
}
