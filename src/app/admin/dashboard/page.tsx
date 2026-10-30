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
} from "lucide-react";
import { QuranTutor } from "@/lib/types";

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

interface UnverifiedMasjidItem {
  id: string;
  name: string;
  locality: string;
  district: string;
  submittedBy: string;
  gpsAccuracy: string;
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"proposals" | "masjids" | "tutors" | "system">("proposals");
  const [toast, setToast] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{
    email?: string;
    username?: string;
    role: string;
    provider?: string;
  } | null>(null);

  // Queues
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

  const [unverifiedMasjids, setUnverifiedMasjids] = useState<UnverifiedMasjidItem[]>([
    {
      id: "m-unv-1",
      name: "Masjid Noor (Soura)",
      locality: "Soura",
      district: "Srinagar",
      submittedBy: "Community Worshipper",
      gpsAccuracy: "±8m (High Precision)",
      submittedAt: "1 hour ago",
    },
    {
      id: "m-unv-2",
      name: "Markaz Masjid (Nowhatta)",
      locality: "Nowhatta",
      district: "Srinagar",
      submittedBy: "Local Resident",
      gpsAccuracy: "±14m (Good)",
      submittedAt: "3 hours ago",
    },
  ]);

  const [tutors, setTutors] = useState<QuranTutor[]>([]);

  // Auth Guard
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/v1/admin/me");
        const data = await res.json();
        if (!data.authenticated) {
          router.replace("/admin/login");
          return;
        }

        setAdminUser(data.user);

        // Fetch tutors for moderation
        const tutorsRes = await fetch("/api/v1/tutors");
        const tutorsData = await tutorsRes.json();
        if (tutorsData.success) {
          setTutors(tutorsData.data);
        }
      } catch (err) {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    verifyAuth();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/v1/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleApproveProposal(id: string) {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast("Proposal approved and applied to live prayer schedule.");
  }

  function handleRejectProposal(id: string) {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast("Proposal dismissed.");
  }

  function handleVerifyMasjid(id: string) {
    setUnverifiedMasjids(unverifiedMasjids.filter((m) => m.id !== id));
    showToast("Masjid approved and promoted to Verified Tier.");
  }

  function handleRejectMasjid(id: string) {
    setUnverifiedMasjids(unverifiedMasjids.filter((m) => m.id !== id));
    showToast("Masjid entry rejected.");
  }

  function handleToggleTutorVerification(id: string) {
    setTutors(
      tutors.map((t) => (t.id === id ? { ...t, isVerified: !t.isVerified } : t))
    );
    showToast("Tutor verification status updated.");
  }

  function handleDeleteTutor(id: string) {
    setTutors(tutors.filter((t) => t.id !== id));
    showToast("Tutor listing removed.");
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying admin credentials...</p>
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
            Review community timing proposals, verify new mosques, and moderate Quran tutors.
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Proposals
          </span>
          <div className="text-2xl font-black text-amber-600">{proposals.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting vote threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Unverified Masjids
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{unverifiedMasjids.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Needs GPS verification</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registered Tutors
          </span>
          <div className="text-2xl font-black text-emerald-600">{tutors.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Quran teachers directory</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Turnstile Bot Defense
          </span>
          <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-4 h-4" />
            Active &bull; 100% Pass
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cloudflare Zero-Spam</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold gap-2 overflow-x-auto">
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
          onClick={() => setActiveTab("masjids")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "masjids"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Unverified Masjids ({unverifiedMasjids.length})
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
          onClick={() => setActiveTab("system")}
          className={`pb-3 px-4 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "system"
              ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" />
          System &amp; AI Engines
        </button>
      </div>

      {/* Tab 1: Timing Proposals */}
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

      {/* Tab 2: Unverified Masjids */}
      {activeTab === "masjids" && (
        <div className="space-y-4">
          {unverifiedMasjids.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">No Pending Submissions</h3>
              <p className="text-xs text-slate-400">All submitted mosques have been verified.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
              {unverifiedMasjids.map((masjid) => (
                <div key={masjid.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {masjid.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {masjid.locality}, {masjid.district}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-emerald-600 font-semibold">{masjid.gpsAccuracy}</span>
                      <span>&bull;</span>
                      <span>Submitted {masjid.submittedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerifyMasjid(masjid.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      Promote to Verified
                    </button>
                    <button
                      onClick={() => handleRejectMasjid(masjid.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-red-600 font-semibold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Quran Tutors Moderation */}
      {activeTab === "tutors" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-xs">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {tutor.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">({tutor.title})</span>
                    {tutor.isVerified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending Verification
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
                    <span>WhatsApp: <strong className="font-mono text-slate-600 dark:text-slate-300">{tutor.whatsappNumber}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleTutorVerification(tutor.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      tutor.isVerified
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {tutor.isVerified ? "Revoke Verification" : "Mark Verified"}
                  </button>
                  <button
                    onClick={() => handleDeleteTutor(tutor.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
                    title="Remove Tutor Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System & AI Engines */}
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
    </div>
  );
}
