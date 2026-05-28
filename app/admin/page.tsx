"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, ArrowUp, ArrowDown, Plus, Save, Lock, AlertCircle, CheckCircle2, User, Key } from "lucide-react";

type Item = {
  slug: string;
  title: string;
  img?: string;
  videoPreview?: string;
  videoPreviewStart?: number;
  videoPreviewEnd?: number;
  videoFull?: string;
  link?: string;
  description?: string;
  client?: string;
  role?: string;
  date?: string;
  gear?: string[];
  photos?: string[];
};

type Profile = {
  aboutHeadline: string;
  aboutSubheading: string;
  aboutBio1: string;
  aboutBio2: string;
  contactHeadline: string;
  contactSubheading: string;
  contactEmail: string;
  contactLocation: string;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"work" | "profile">("work");
  const [items, setItems] = useState<Item[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLocalHost, setIsLocalHost] = useState(true);
  const [generatingPreviewIdx, setGeneratingPreviewIdx] = useState<number | null>(null);
  const [previewGenStatus, setPreviewGenStatus] = useState<{ [key: number]: { type: "success" | "error"; text: string } }>({});
  const [selectedResolution, setSelectedResolution] = useState<{ [key: number]: string }>({});

  // 1. Verify if running locally
  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      const local = host.includes("localhost") || host.includes("127.0.0.1");
      setIsLocalHost(local);

      // Restore session if exists
      const savedPass = localStorage.getItem("remy_admin_auth");
      if (savedPass) {
        setPassword(savedPass);
        // Load data automatically
        fetchData(savedPass);
      }
    }
  }, []);

  const fetchData = async (authPass: string) => {
    try {
      const [resWork, resProfile] = await Promise.all([
        fetch("/api/featured-work"),
        fetch("/api/profile")
      ]);

      const dataWork = await resWork.json();
      const dataProfile = await resProfile.json();

      setItems(dataWork.items || []);
      setProfile(dataProfile.profile || null);
      setIsAuthenticated(true);
      setLoginError(null);
    } catch (err) {
      setItems([]);
      setProfile(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Incorrect password. Please try again.");
      } else {
        localStorage.setItem("remy_admin_auth", password);
        await fetchData(password);
      }
    } catch (err: any) {
      setLoginError("Connection failed. Make sure Next.js dev server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("remy_admin_auth");
    setIsAuthenticated(false);
    setItems(null);
    setProfile(null);
    setPassword("");
  };

  const handleGeneratePreview = async (index: number, resolution: string) => {
    if (!items) return;
    const it = items[index];
    if (!it.videoFull || !it.videoPreview) {
      setPreviewGenStatus(prev => ({
        ...prev,
        [index]: { type: "error", text: "Please enter both the Full Quality Video Path and Loop Preview Video Path." }
      }));
      return;
    }

    const start = it.videoPreviewStart ?? 0;
    const end = it.videoPreviewEnd ?? 10;
    if (end <= start) {
      setPreviewGenStatus(prev => ({
        ...prev,
        [index]: { type: "error", text: "Loop End time must be greater than Loop Start time." }
      }));
      return;
    }

    setGeneratingPreviewIdx(index);
    setPreviewGenStatus(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });

    try {
      const res = await fetch("/api/admin/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          videoFull: it.videoFull,
          videoPreview: it.videoPreview,
          start,
          end,
          resolution
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPreviewGenStatus(prev => ({
          ...prev,
          [index]: { type: "error", text: data.error || "Failed to generate preview." }
        }));
      } else {
        setPreviewGenStatus(prev => ({
          ...prev,
          [index]: { type: "success", text: data.message || "Preview generated successfully!" }
        }));
      }
    } catch (err: any) {
      setPreviewGenStatus(prev => ({
        ...prev,
        [index]: { type: "error", text: "Network connection error while calling preview generator API." }
      }));
    } finally {
      setGeneratingPreviewIdx(null);
    }
  };

  // Modify individual project fields
  const updateField = (index: number, field: keyof Item, value: any) => {
    if (!items) return;
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    setItems(copy);
  };

  // Add new item
  const addNewItem = () => {
    if (!items) return;
    const newItem: Item = {
      slug: "new-project-" + (items.length + 1),
      title: "New Project Showcase",
      description: "",
      client: "",
      role: "",
      date: "",
      gear: ["BMPCC 6K", "18-35mm Sigma Art Lens", "Adobe Suite", "DaVinci Resolve"],
      photos: [],
      videoPreview: "",
      videoPreviewStart: 0,
      videoPreviewEnd: 10,
      videoFull: "",
    };
    setItems([...items, newItem]);
  };

  // Delete item
  const deleteItem = (index: number) => {
    if (!items) return;
    if (confirm("Are you sure you want to delete this project?")) {
      const copy = items.filter((_, i) => i !== index);
      setItems(copy);
    }
  };

  // Reorder items
  const moveItem = (index: number, direction: "up" | "down") => {
    if (!items) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[nextIndex];
    copy[nextIndex] = temp;
    setItems(copy);
  };

  // Save all items to disk
  const handleSave = async () => {
    if (!items || !profile) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const [resWork, resProfile] = await Promise.all([
        fetch("/api/featured-work/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, items }),
        }),
        fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, profile }),
        }),
      ]);

      const dataWork = await resWork.json();
      const dataProfile = await resProfile.json();

      if (dataWork.ok && dataProfile.ok) {
        setStatusMsg({ 
          type: "success", 
          text: "Portfolio, About, and Contact details saved successfully! Changes are updated in data/featured-work.ts and data/profile.ts." 
        });
        fetchData(password);
      } else {
        setStatusMsg({ 
          type: "error", 
          text: dataWork.error || dataProfile.error || "Failed to save changes." 
        });
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Connection error. Save failed." });
    } finally {
      setLoading(false);
    }
  };

  if (!isLocalHost) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-display mb-4">Local Access Only</h1>
        <p className="text-white/60 text-sm max-w-sm">
          For security reasons, the administrative portfolio editor can only be accessed while running locally on your device.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-8 lg:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative z-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-full bg-white/10 items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white/80" />
            </div>
            <h1 className="text-3xl font-display text-white mb-2">Secret Admin Panel</h1>
            <p className="text-xs font-mono text-white/40">AUTHORIZED LOCAL PORTFOLIO EDITOR</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-white/60 uppercase mb-2">
                Enter Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-12 px-4 font-mono text-sm"
                />
                <Key className="w-4 h-4 text-white/30 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? "Authenticating..." : "Unlock Editor"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Sticky Topbar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 py-4 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-white/15 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-white/60 hover:text-white" />
            </a>
            <div>
              <h1 className="text-xl font-display font-medium">Portfolio Administrative Editor</h1>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> local development server
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-white/10 text-white/60 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
            >
              Lock Panel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Editing Area */}
      <main className="max-w-5xl mx-auto px-6 mt-10 space-y-8">
        
        {/* Save/Error Status Message */}
        {statusMsg && (
          <div className={`p-5 rounded-xl border flex items-start gap-3 shadow-xl ${
            statusMsg.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}>
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-semibold">{statusMsg.type === "success" ? "Saved" : "Save Error"}</h4>
              <p className="text-xs text-white/70 mt-1">{statusMsg.text}</p>
            </div>
          </div>
        )}

        {/* Tab Selection Navigation Bar */}
        <div className="flex gap-4 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("work")}
            className={`px-4 py-2.5 text-sm font-mono cursor-pointer transition-all border-b-2 font-medium ${
              activeTab === "work" 
                ? "border-white text-white" 
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            Showcase Projects ({items?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 text-sm font-mono cursor-pointer transition-all border-b-2 font-medium ${
              activeTab === "profile" 
                ? "border-white text-white" 
                : "border-transparent text-white/40 hover:text-white/80"
            }`}
          >
            About & Contact Info
          </button>
        </div>

        {/* WORK TAB: Projects editor */}
        {activeTab === "work" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h2 className="text-2xl font-display">Manage Work Showcase</h2>
                <p className="text-xs text-white/50 mt-1">Reorder, delete, and add new dynamic project showcases below.</p>
              </div>
              <button
                onClick={addNewItem}
                className="px-4 py-2 border border-white/20 hover:bg-white/5 text-white/90 hover:text-white rounded-lg text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Showcase
              </button>
            </div>

            {items && items.length === 0 ? (
              <div className="p-16 text-center rounded-2xl bg-white/5 border border-white/10 text-white/40 font-mono text-sm">
                No projects found. Click &apos;Add Showcase&apos; to create one.
              </div>
            ) : (
              <div className="space-y-10">
                {items?.map((it, idx) => (
                  <div 
                    key={idx}
                    className="rounded-2xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-white/20"
                  >
                    {/* Card Actions Bar */}
                    <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-white/10 text-white/60 font-mono text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-semibold text-white/90">{it.title || "Untitled Project"}</h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => moveItem(idx, "up")}
                          disabled={idx === 0}
                          className="p-2 hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveItem(idx, "down")}
                          disabled={items ? idx === items.length - 1 : true}
                          className="p-2 hover:bg-white/10 disabled:opacity-20 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-white/10 mx-2" />
                        <button
                          onClick={() => deleteItem(idx)}
                          className="p-2 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Form Fields body */}
                    <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                      {/* Left Column */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">Showcase Title</label>
                          <input
                            type="text"
                            value={it.title}
                            onChange={(e) => updateField(idx, "title", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">URL Slug (e.g. porsche-718-spyder)</label>
                          <input
                            type="text"
                            value={it.slug}
                            onChange={(e) => updateField(idx, "slug", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Client</label>
                            <input
                              type="text"
                              value={it.client || ""}
                              onChange={(e) => updateField(idx, "client", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Role</label>
                            <input
                              type="text"
                              value={it.role || ""}
                              onChange={(e) => updateField(idx, "role", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Release Date</label>
                            <input
                              type="text"
                              value={it.date || ""}
                              onChange={(e) => updateField(idx, "date", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-white/40 uppercase mb-2">External Link (Optional)</label>
                            <input
                              type="text"
                              value={it.link || ""}
                              onChange={(e) => updateField(idx, "link", e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">Project Description</label>
                          <textarea
                            rows={4}
                            value={it.description || ""}
                            onChange={(e) => updateField(idx, "description", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 font-sans text-sm resize-none"
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">Full Quality Video Path</label>
                          <input
                            type="text"
                            value={it.videoFull || ""}
                            onChange={(e) => updateField(idx, "videoFull", e.target.value)}
                            placeholder="/videos/filename.mp4"
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">Loop Preview Video Path</label>
                          <input
                            type="text"
                            value={it.videoPreview || ""}
                            onChange={(e) => updateField(idx, "videoPreview", e.target.value)}
                            placeholder="/videos/preview-filename.mp4"
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Loop Start (Sec)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={it.videoPreviewStart ?? 0}
                              onChange={(e) => updateField(idx, "videoPreviewStart", parseFloat(e.target.value) || 0)}
                              className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-white/40 uppercase mb-2">Loop End (Sec)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={it.videoPreviewEnd ?? 0}
                              onChange={(e) => updateField(idx, "videoPreviewEnd", parseFloat(e.target.value) || 0)}
                              className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono text-white/40 uppercase mb-2">Export Quality</label>
                              <select
                                value={selectedResolution[idx] || "1080"}
                                onChange={(e) => setSelectedResolution(prev => ({ ...prev, [idx]: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm cursor-pointer"
                              >
                                <option value="720" className="bg-[#090909] text-white">720p (Fast)</option>
                                <option value="1080" className="bg-[#090909] text-white">1080p (Pristine - Rec.)</option>
                                <option value="2160" className="bg-[#090909] text-white">4K UHD (Very Heavy)</option>
                                <option value="original" className="bg-[#090909] text-white">Original Source</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                disabled={generatingPreviewIdx !== null || !it.videoFull || !it.videoPreview}
                                onClick={() => handleGeneratePreview(idx, selectedResolution[idx] || "1080")}
                                className="w-full flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 disabled:opacity-40 disabled:hover:border-white/20 h-11 px-4 rounded-lg text-xs font-mono tracking-widest uppercase transition-all bg-white/5 hover:bg-white/10 text-white cursor-pointer active:scale-95"
                              >
                                {generatingPreviewIdx === idx ? (
                                  <>
                                    <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full shrink-0" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Key className="w-3.5 h-3.5 rotate-90 shrink-0" />
                                    Generate Clip
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {previewGenStatus[idx] && (
                            <div className={`mt-3 flex items-start gap-2.5 text-xs font-mono p-3 rounded-lg border ${
                              previewGenStatus[idx].type === "success" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            }`}>
                              {previewGenStatus[idx].type === "success" ? (
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                              )}
                              <span>{previewGenStatus[idx].text}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                            Tools & Setup (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={it.gear ? it.gear.join(", ") : ""}
                            onChange={(e) => updateField(idx, "gear", e.target.value.split(",").map(t => t.trim()))}
                            placeholder="BMPCC 6K, 18-35mm Sigma Art Lens, Adobe Suite"
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                            Shoot Gallery Photos, Stills & Videos (Comma-separated paths)
                          </label>
                          <textarea
                            rows={3}
                            value={it.photos ? it.photos.join(", ") : ""}
                            onChange={(e) => updateField(idx, "photos", e.target.value.split(",").map(p => p.trim()).filter(Boolean))}
                            placeholder="/images/photo1.jpg, /videos/clip1.mp4, /images/photo2.jpg"
                            className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 font-mono text-xs resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB: About Me and Contact details editor */}
        {activeTab === "profile" && profile && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-2xl font-display">Edit Profile & Contact details</h2>
              <p className="text-xs text-white/50 mt-1">Changes here instantly update your main website bio and contact card sections.</p>
            </div>

            {/* About Me card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 space-y-6 shadow-2xl">
              <h3 className="text-lg font-display font-medium border-b border-white/10 pb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-white/40" /> About Me Section
              </h3>
              
              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">Headline</label>
                <input
                  type="text"
                  value={profile.aboutHeadline}
                  onChange={(e) => setProfile({ ...profile, aboutHeadline: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">Subheading / Description summary</label>
                <textarea
                  rows={3}
                  value={profile.aboutSubheading}
                  onChange={(e) => setProfile({ ...profile, aboutSubheading: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 font-sans text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">Biography Paragraph 1</label>
                <textarea
                  rows={4}
                  value={profile.aboutBio1}
                  onChange={(e) => setProfile({ ...profile, aboutBio1: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 font-sans text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">Biography Paragraph 2</label>
                <textarea
                  rows={4}
                  value={profile.aboutBio2}
                  onChange={(e) => setProfile({ ...profile, aboutBio2: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 font-sans text-sm resize-none"
                />
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 space-y-6 shadow-2xl">
              <h3 className="text-lg font-display font-medium border-b border-white/10 pb-4">
                Contact Form & Cards
              </h3>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">Form Headline</label>
                <input
                  type="text"
                  value={profile.contactHeadline}
                  onChange={(e) => setProfile({ ...profile, contactHeadline: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/40 uppercase mb-2">Form Paragraph Description</label>
                <textarea
                  rows={3}
                  value={profile.contactSubheading}
                  onChange={(e) => setProfile({ ...profile, contactSubheading: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg p-4 font-sans text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={profile.contactEmail}
                    onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/40 uppercase mb-2">Based In (Location)</label>
                  <input
                    type="text"
                    value={profile.contactLocation}
                    onChange={(e) => setProfile({ ...profile, contactLocation: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 focus:border-white/30 outline-none text-white rounded-lg h-11 px-4 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
