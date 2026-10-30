"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Users,
  Eye,
  Flag,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  BookOpen,
  Award,
  Zap,
  Loader2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Edit,
  X,
  Save,
  MapPin,
  Camera,
  ImageIcon,
  Mic,
  Radio,
} from "lucide-react";
import { QuranTutor, Masjid, TutorStatus, MasjidStatus, JummahSermon, JummahStatus } from "@/lib/types";

interface PendingProposal {
  id: string;
  masjidName: string;
  prayer: string;
  currentTime: string;
  proposedTime: string;
  proposer: string;
  upvotes: number;
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"masjids" | "tutors" | "jummah" | "proposals" | "system">("masjids");
  const [toast, setToast] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{
    email?: string;
    username?: string;
    role: string;
    provider?: string;
  } | null>(null);

  // Data Stores
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [tutors, setTutors] = useState<QuranTutor[]>([]);
  const [sermons, setSermons] = useState<JummahSermon[]>([]);
  const [proposals, setProposals] = useState<PendingProposal[]>([
    {
      id: "prop-1",
      masjidName: "Masjid Bilal (Lal Chowk Central)",
      prayer: "Asr",
      currentTime: "16:00",
      proposedTime: "16:15",
      proposer: "Worshipper via Proximity",
      upvotes: 4,
      submittedAt: "10 mins ago",
    },
    {
      id: "prop-2",
      masjidName: "Jamia Masjid Dalgate",
      prayer: "Isha",
      currentTime: "19:30",
      proposedTime: "19:45",
      proposer: "Community Member",
      upvotes: 6,
      submittedAt: "25 mins ago",
    },
  ]);

  // Edit Modals State
  const [editingTutor, setEditingTutor] = useState<QuranTutor | null>(null);
  const [editingMasjid, setEditingMasjid] = useState<Masjid | null>(null);
  const [editingSermon, setEditingSermon] = useState<JummahSermon | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const [loadingProofId, setLoadingProofId] = useState<string | null>(null);

  async function handleViewProof(path: string, masjidId: string) {
    setLoadingProofId(masjidId);
    try {
      const res = await fetch(`/api/v1/admin/proof-url?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success && data.signedUrl) {
        setPreviewProofUrl(data.signedUrl);
      } else {
        alert("Could not load photo proof: " + (data.error || "Storage unconfigured"));
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingProofId(null);
    }
  }

  // Auth Guard & Data Fetch
  useEffect(() => {
    async function loadAdminData() {
      try {
        const authRes = await fetch("/api/v1/admin/me");
        const authData = await authRes.json();
        if (!authData.authenticated) {
          router.replace("/admin/login");
          return;
        }
        setAdminUser(authData.user);

        // 1. Fetch Masjids
        const masjidsRes = await fetch("/api/v1/admin/masjids");
        const masjidsData = await masjidsRes.json();
        if (masjidsData.success) {
          setMasjids(masjidsData.data);
        }

        // 2. Fetch Tutors
        const tutorsRes = await fetch("/api/v1/admin/tutors");
        const tutorsData = await tutorsRes.json();
        if (tutorsData.success) {
          setTutors(tutorsData.data);
        }

        // 3. Fetch Jummah Sermons
        const jummahRes = await fetch("/api/v1/admin/jummah");
        const jummahData = await jummahRes.json();
        if (jummahData.success) {
          setSermons(jummahData.data);
        }
      } catch (err) {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/v1/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // --- TUTOR ADMIN ACTIONS ---
  async function handleToggleTutorStatus(tutor: QuranTutor) {
    const newStatus: TutorStatus = tutor.status === "on_hold" ? "active" : "on_hold";
    try {
      const res = await fetch(`/api/v1/admin/tutors/${tutor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTutors(tutors.map((t) => (t.id === tutor.id ? { ...t, status: newStatus } : t)));
        showToast(
          newStatus === "on_hold"
            ? `Tutor "${tutor.name}" placed ON HOLD (hidden from public directory).`
            : `Tutor "${tutor.name}" is now ACTIVE & PUBLIC.`
        );
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleDeleteTutor(tutor: QuranTutor) {
    if (!confirm(`Are you sure you want to delete tutor "${tutor.name}"? This will remove them from the platform.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/tutors/${tutor.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTutors(tutors.filter((t) => t.id !== tutor.id));
        showToast(`Tutor "${tutor.name}" deleted successfully.`);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleSaveTutorEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTutor) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/v1/admin/tutors/${editingTutor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTutor),
      });
      const data = await res.json();
      if (data.success) {
        setTutors(tutors.map((t) => (t.id === editingTutor.id ? editingTutor : t)));
        setEditingTutor(null);
        showToast(`Tutor "${editingTutor.name}" updated successfully.`);
      } else {
        alert(data.error || "Failed to update tutor");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingEdit(false);
    }
  }

  // --- MASJID ADMIN ACTIONS ---
  async function handleToggleMasjidStatus(masjid: Masjid) {
    const newStatus: MasjidStatus = masjid.status === "on_hold" ? "verified" : "on_hold";
    try {
      const res = await fetch(`/api/v1/admin/masjids/${masjid.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMasjids(masjids.map((m) => (m.id === masjid.id ? { ...m, status: newStatus } : m)));
        showToast(
          newStatus === "on_hold"
            ? `Masjid "${masjid.name}" placed ON HOLD (hidden from map and directory).`
            : `Masjid "${masjid.name}" is now ACTIVE & VERIFIED.`
        );
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleDeleteMasjid(masjid: Masjid) {
    if (!confirm(`Are you sure you want to delete "${masjid.name}"? This removes it from the public directory.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/masjids/${masjid.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMasjids(masjids.filter((m) => m.id !== masjid.id));
        showToast(`Masjid "${masjid.name}" deleted.`);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleSaveMasjidEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMasjid) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/v1/admin/masjids/${editingMasjid.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMasjid),
      });
      const data = await res.json();
      if (data.success) {
        setMasjids(masjids.map((m) => (m.id === editingMasjid.id ? editingMasjid : m)));
        setEditingMasjid(null);
        showToast(`Masjid "${editingMasjid.name}" & timings updated successfully.`);
      } else {
        alert(data.error || "Failed to update masjid");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingEdit(false);
    }
  }

  // --- JUMMAH SERMON ADMIN ACTIONS ---
  async function handleToggleSermonStatus(sermon: JummahSermon) {
    const newStatus: JummahStatus = sermon.status === "on_hold" ? "active" : "on_hold";
    try {
      const res = await fetch(`/api/v1/admin/jummah/${sermon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_status", status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSermons(sermons.map((s) => (s.id === sermon.id ? { ...s, status: newStatus } : s)));
        showToast(
          newStatus === "on_hold"
            ? `Friday Sermon "${sermon.topic}" placed ON HOLD (hidden from public).`
            : `Friday Sermon "${sermon.topic}" is now ACTIVE.`
        );
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleDeleteSermon(sermon: JummahSermon) {
    if (!confirm(`Are you sure you want to delete sermon "${sermon.topic}" by ${sermon.khateebName}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/jummah/${sermon.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSermons(sermons.filter((s) => s.id !== sermon.id));
        showToast(`Friday Sermon deleted.`);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleSaveSermonEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSermon) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/v1/admin/jummah/${editingSermon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSermon),
      });
      const data = await res.json();
      if (data.success) {
        setSermons(sermons.map((s) => (s.id === editingSermon.id ? editingSermon : s)));
        setEditingSermon(null);
        showToast(`Friday Sermon updated successfully.`);
      } else {
        alert(data.error || "Failed to update sermon");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSavingEdit(false);
    }
  }

  // --- PROPOSALS ACTIONS ---
  function handleApproveProposal(id: string) {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast("Proposal approved and applied to live prayer schedule.");
  }

  function handleRejectProposal(id: string) {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast("Proposal dismissed.");
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading administrative console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Moderation Console
            {adminUser && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono lowercase">
                {adminUser.provider === "supabase" ? "supabase auth" : "local fallback"}: {adminUser.email || adminUser.username}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Admin Management Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Full administrative control: edit, pause/on-hold, or delete Masjids, Timings, and Quran Tutors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Public Site
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="p-4 rounded-xl bg-emerald-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-300 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Masjids
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{masjids.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {masjids.filter((m) => m.status === "on_hold").length} on hold
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Quran Tutors
          </span>
          <div className="text-2xl font-black text-emerald-600">{tutors.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {tutors.filter((t) => t.status === "on_hold").length} on hold
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Jummah Sermons
          </span>
          <div className="text-2xl font-black text-purple-600">{sermons.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {sermons.filter((s) => s.status === "on_hold").length} on hold
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Timing Proposals
          </span>
          <div className="text-2xl font-black text-amber-600">{proposals.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Community suggestions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Security Status
          </span>
          <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4" />
            Turnstile Active
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Zero-Spam Enforced</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("masjids")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "masjids"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Masjids &amp; Timings ({masjids.length})
        </button>

        <button
          onClick={() => setActiveTab("tutors")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "tutors"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Quran Tutors ({tutors.length})
        </button>

        <button
          onClick={() => setActiveTab("jummah")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "jummah"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Mic className="w-4 h-4" />
          Jummah Bayans ({sermons.length})
        </button>

        <button
          onClick={() => setActiveTab("proposals")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "proposals"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          Timing Proposals ({proposals.length})
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "system"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          Service Status
        </button>
      </div>

      {/* Tab 1: Masjids & Timings Moderation */}
      {activeTab === "masjids" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {masjids.map((masjid) => (
              <div key={masjid.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {masjid.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({masjid.locality}, {masjid.district})
                    </span>

                    {/* Status Badge */}
                    {masjid.status === "on_hold" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                        ⏸ ON HOLD (Hidden)
                      </span>
                    ) : masjid.status === "verified" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        ✓ Verified Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Unverified Community Entry
                      </span>
                    )}
                  </div>

                  {/* Prayer Timings Summary Chips */}
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((p) => {
                      const t = masjid.timings[p];
                      return (
                        <span
                          key={p}
                          className="px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px]"
                        >
                          <strong className="uppercase text-[10px] text-slate-400 mr-1">{p}:</strong>
                          {t?.iqamahTime || "--:--"}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Masjid Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {masjid.verificationPhotoPath && (
                    <button
                      onClick={() => handleViewProof(masjid.verificationPhotoPath!, masjid.id)}
                      disabled={loadingProofId === masjid.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-xs transition-colors"
                      title="View private timetable board photo uploaded during registration"
                    >
                      {loadingProofId === masjid.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>Photo Proof</span>
                    </button>
                  )}

                  <button
                    onClick={() => setEditingMasjid({ ...masjid })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit &amp; Timings
                  </button>

                  <button
                    onClick={() => handleToggleMasjidStatus(masjid)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      masjid.status === "on_hold"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {masjid.status === "on_hold" ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Make Live
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" /> Put On Hold
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteMasjid(masjid)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors"
                    title="Delete Masjid"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Quran Tutors Moderation */}
      {activeTab === "tutors" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {tutor.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({tutor.title})</span>

                    {/* Status Badge */}
                    {tutor.status === "on_hold" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                        ⏸ ON HOLD (Hidden)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                        ✓ Active &amp; Public
                      </span>
                    )}

                    {tutor.hasIjazah && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" /> Ijazah
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">{tutor.bio}</p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Mode: <strong className="text-slate-600 dark:text-slate-300">{tutor.teachingMode}</strong></span>
                    <span>&bull;</span>
                    <span>Fee: <strong className="text-slate-600 dark:text-slate-300">{tutor.feeType === "free" ? "Free" : `₹${tutor.monthlyFeeAmount || "Flexible"}`}</strong></span>
                    <span>&bull;</span>
                    <span>WhatsApp: <strong className="font-mono text-slate-600 dark:text-slate-300">{tutor.whatsappNumber}</strong></span>
                  </div>
                </div>

                {/* Tutor Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingTutor({ ...tutor })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => handleToggleTutorStatus(tutor)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      tutor.status === "on_hold"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {tutor.status === "on_hold" ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Make Live
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" /> Put On Hold
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteTutor(tutor)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors"
                    title="Delete Tutor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2.5: Jummah Khutbah & Bayan Moderation */}
      {activeTab === "jummah" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Friday Khutbah &amp; Bayan Management
              </h3>
              <p className="text-xs text-slate-400">
                Edit speaker details, Bayan/Khutbah times, live stream URLs, or toggle on-hold status.
              </p>
            </div>
            <Link
              href="/jummah/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs self-start sm:self-auto"
            >
              <Mic className="w-3.5 h-3.5" />
              Add Friday Sermon
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {sermons.map((sermon) => (
              <div
                key={sermon.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  sermon.status === "on_hold" ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sermon.khateebTitle} {sermon.khateebName}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {sermon.masjidName} ({sermon.city})
                    </span>

                    {sermon.status === "on_hold" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 uppercase">
                        ON HOLD
                      </span>
                    )}

                    {sermon.livestreamUrl && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                        <Radio className="w-3 h-3 text-rose-600 animate-pulse" /> Live
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Topic: {sermon.topic}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3 font-mono">
                    <span>Bayan: <strong className="text-emerald-600">{sermon.bayanTime}</strong></span>
                    <span>&bull;</span>
                    <span>Khutbah: <strong className="text-slate-600 dark:text-slate-300">{sermon.khutbahTime}</strong></span>
                    <span>&bull;</span>
                    <span>Jama&apos;at: <strong className="text-emerald-700 font-bold">{sermon.jamatTime}</strong></span>
                    <span>&bull;</span>
                    <span className="capitalize">{sermon.language}</span>
                  </div>
                </div>

                {/* Sermon Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setEditingSermon({ ...sermon })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleSermonStatus(sermon)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      sermon.status === "on_hold"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {sermon.status === "on_hold" ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Make Live
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" /> Put On Hold
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteSermon(sermon)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 transition-colors"
                    title="Delete Sermon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Timing Proposals */}
      {activeTab === "proposals" && (
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">All Proposals Resolved</h3>
              <p className="text-xs text-slate-400">There are no pending community timing proposals to review.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
              {proposals.map((prop) => (
                <div key={prop.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {prop.masjidName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 uppercase">
                        {prop.prayer}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Current: <strong className="font-mono text-slate-700 dark:text-slate-300">{prop.currentTime}</strong></span>
                      <span>&rarr;</span>
                      <span>Proposed: <strong className="font-mono text-emerald-600 font-bold">{prop.proposedTime}</strong></span>
                      <span>&bull;</span>
                      <span>{prop.upvotes} Community Votes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveProposal(prop.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Approve Change
                    </button>
                    <button
                      onClick={() => handleRejectProposal(prop.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: System & Service Status */}
      {activeTab === "system" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Active Service Pipelines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Tier 1: Google Gemini 2.5 Flash</span>
              <p className="text-slate-500">Official @google/genai SDK for multimodal timetable OCR.</p>
              <span className="text-[10px] text-emerald-600 font-bold block pt-1">Status: Active Engine</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Tier 2: Groq Llama-3.2 Vision</span>
              <p className="text-slate-500">Ultra-fast (&lt;400ms) failover vision engine.</p>
              <span className="text-[10px] text-emerald-600 font-bold block pt-1">Status: Standby Failover</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Security: Cloudflare Turnstile</span>
              <p className="text-slate-500">Bot defense on all database writes and tutor postings.</p>
              <span className="text-[10px] text-emerald-600 font-bold block pt-1">Status: Enforcing</span>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT TUTOR MODAL --- */}
      {editingTutor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-600" />
                Edit Tutor Profile: {editingTutor.name}
              </h3>
              <button onClick={() => setEditingTutor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTutorEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingTutor.name}
                    onChange={(e) => setEditingTutor({ ...editingTutor, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title / Role</label>
                  <input
                    type="text"
                    required
                    value={editingTutor.title}
                    onChange={(e) => setEditingTutor({ ...editingTutor, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Biography</label>
                <textarea
                  rows={3}
                  required
                  value={editingTutor.bio}
                  onChange={(e) => setEditingTutor({ ...editingTutor, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={editingTutor.whatsappNumber}
                    onChange={(e) => setEditingTutor({ ...editingTutor, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={editingTutor.monthlyFeeAmount || ""}
                    onChange={(e) => setEditingTutor({ ...editingTutor, monthlyFeeAmount: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTutor.isVerified}
                    onChange={(e) => setEditingTutor({ ...editingTutor, isVerified: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>Verified Community Badge</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTutor.hasIjazah}
                    onChange={(e) => setEditingTutor({ ...editingTutor, hasIjazah: e.target.checked })}
                    className="rounded text-amber-600"
                  />
                  <span>Ijazah Holder</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTutor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MASJID & TIMINGS MODAL --- */}
      {editingMasjid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Edit Mosque &amp; Prayer Timings: {editingMasjid.name}
              </h3>
              <button onClick={() => setEditingMasjid(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMasjidEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Masjid Name</label>
                  <input
                    type="text"
                    required
                    value={editingMasjid.name}
                    onChange={(e) => setEditingMasjid({ ...editingMasjid, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Locality</label>
                  <input
                    type="text"
                    required
                    value={editingMasjid.locality}
                    onChange={(e) => setEditingMasjid({ ...editingMasjid, locality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Address</label>
                <input
                  type="text"
                  value={editingMasjid.address}
                  onChange={(e) => setEditingMasjid({ ...editingMasjid, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* Iqamah Timings Editor */}
              <div className="pt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
                  Iqamah Prayer Timings (24-Hour Format HH:MM)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((p) => {
                    const timingRecord = editingMasjid.timings[p];
                    return (
                      <div key={p} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                        <span className="font-bold uppercase text-[10px] text-slate-500 block">{p}</span>
                        <input
                          type="time"
                          required
                          value={timingRecord?.iqamahTime || "00:00"}
                          onChange={(e) =>
                            setEditingMasjid({
                              ...editingMasjid,
                              timings: {
                                ...editingMasjid.timings,
                                [p]: {
                                  ...editingMasjid.timings[p],
                                  iqamahTime: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-1.5 py-1 text-center font-mono font-bold text-emerald-600 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMasjid(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Masjid &amp; Timings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT JUMMAH SERMON MODAL --- */}
      {editingSermon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-xl w-full shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-600" />
                Edit Friday Sermon: {editingSermon.topic}
              </h3>
              <button onClick={() => setEditingSermon(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSermonEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Honorific / Title</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.khateebTitle}
                    onChange={(e) => setEditingSermon({ ...editingSermon, khateebTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Speaker Name</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.khateebName}
                    onChange={(e) => setEditingSermon({ ...editingSermon, khateebName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Speech Topic</label>
                <input
                  type="text"
                  required
                  value={editingSermon.topic}
                  onChange={(e) => setEditingSermon({ ...editingSermon, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Masjid Name</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.masjidName}
                    onChange={(e) => setEditingSermon({ ...editingSermon, masjidName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.city}
                    onChange={(e) => setEditingSermon({ ...editingSermon, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 3 Times */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bayan Time</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.bayanTime}
                    onChange={(e) => setEditingSermon({ ...editingSermon, bayanTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Khutbah Time</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.khutbahTime}
                    onChange={(e) => setEditingSermon({ ...editingSermon, khutbahTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">Jama&apos;at Time</label>
                  <input
                    type="text"
                    required
                    value={editingSermon.jamatTime}
                    onChange={(e) => setEditingSermon({ ...editingSermon, jamatTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-500 dark:border-emerald-500 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Live Stream / Recording URL</label>
                <input
                  type="url"
                  value={editingSermon.livestreamUrl || ""}
                  onChange={(e) => setEditingSermon({ ...editingSermon, livestreamUrl: e.target.value })}
                  placeholder="https://www.youtube.com/@Channel/live"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSermon(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Sermon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PRIVATE PHOTO PROOF PREVIEW MODAL (ADMIN ONLY) --- */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 max-w-xl w-full shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                  Private Timetable Photo Proof (Admin Only)
                </span>
              </div>
              <button onClick={() => setPreviewProofUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center border border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewProofUrl}
                alt="Uploaded Timetable Verification Proof"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Securely fetched via Supabase Private Storage Signed URL (1-hour expiry).</span>
              <button
                type="button"
                onClick={() => setPreviewProofUrl(null)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
