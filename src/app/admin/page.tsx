"use client";

import React, { useState } from "react";
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
} from "lucide-react";

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

interface ClaimRequest {
  id: string;
  masjidName: string;
  claimantName: string;
  role: string;
  phone: string;
  proofType: string;
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"proposals" | "masjids" | "claims" | "reports">("proposals");
  const [toast, setToast] = useState<string | null>(null);

  // Mock moderation queues
  const [proposals, setProposals] = useState<PendingProposal[]>([
    {
      id: "prop-1",
      masjidName: "Masjid Bilal (Lal Chowk Central)",
      prayer: "Asr",
      currentTime: "16:00",
      proposedTime: "16:15",
      proposer: "Worshipper #419",
      upvotes: 4,
      submittedAt: "2 hours ago",
    },
    {
      id: "prop-2",
      masjidName: "Khanqah-e-Moula (Shah-e-Hamdan)",
      prayer: "Isha",
      currentTime: "19:30",
      proposedTime: "19:45",
      proposer: "Local Volunteer",
      upvotes: 2,
      submittedAt: "5 hours ago",
    },
  ]);

  const [unverifiedMasjids, setUnverifiedMasjids] = useState<UnverifiedMasjidItem[]>([
    {
      id: "unv-1",
      name: "Masjid Al-Noor (Hyderpora)",
      locality: "Hyderpora Bypass",
      district: "Srinagar",
      submittedBy: "Guest User (Turnstile Verified)",
      gpsAccuracy: "±8m",
      submittedAt: "Yesterday",
    },
  ]);

  const [claims, setClaims] = useState<ClaimRequest[]>([
    {
      id: "clm-1",
      masjidName: "Historic Jamia Masjid",
      claimantName: "Mohammad Altaf (Committee Secretary)",
      role: "Mutawalli",
      phone: "+91 94190XXXXX",
      proofType: "Auqaf Committee Letterhead",
      submittedAt: "1 day ago",
    },
  ]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handleApproveProposal(id: string) {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast("Proposal approved and promoted to Live Congregation Timing (Tier 2).");
  }

  function handleRejectProposal(id: string) {
    setProposals(proposals.filter((p) => p.id !== id));
    showToast("Proposal rejected and removed from community queue.");
  }

  function handleConfirmMasjid(id: string) {
    setUnverifiedMasjids(unverifiedMasjids.filter((m) => m.id !== id));
    showToast("Masjid confirmed and published publicly in regional directory.");
  }

  function handleApproveClaim(id: string) {
    setClaims(claims.filter((c) => c.id !== id));
    showToast("Admin claim verified. Mosque upgraded to Tier 1 Official status.");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Module 8 &bull; Moderation &amp; Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Moderator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage timing disputes, verify community submissions, and approve official masjid claims.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Directory
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Action Needed
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{proposals.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Pending Proposals</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              GPS Queue
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{unverifiedMasjids.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Unverified Masjids</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Tier 1
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">{claims.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">Committee Claims</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <Flag className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Clean
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900">0</div>
          <div className="text-xs text-slate-500 mt-0.5">Active Spam Reports</div>
        </div>
      </div>

      {/* Moderation Queue Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("proposals")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "proposals"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Timing Proposals ({proposals.length})
        </button>
        <button
          onClick={() => setActiveTab("masjids")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "masjids"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Unverified Masjids ({unverifiedMasjids.length})
        </button>
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "claims"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Masjid Admin Claims ({claims.length})
        </button>
      </div>

      {/* Tab 1: Proposals Queue */}
      {activeTab === "proposals" && (
        <div className="space-y-3">
          {proposals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No pending timing proposals in the review queue.
            </div>
          ) : (
            proposals.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{prop.masjidName}</h3>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                      {prop.prayer}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Proposed by <strong>{prop.proposer}</strong> &bull; {prop.submittedAt} &bull;{" "}
                    <strong className="text-emerald-700">{prop.upvotes} community upvotes</strong>
                  </div>
                  <div className="text-sm pt-1">
                    Current Live Time: <span className="font-mono font-bold line-through text-slate-400">{prop.currentTime}</span>{" "}
                    &rarr; Proposed: <span className="font-mono font-black text-emerald-800 text-base">{prop.proposedTime}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRejectProposal(prop.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveProposal(prop.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve (Publish Live)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Unverified Masjids */}
      {activeTab === "masjids" && (
        <div className="space-y-3">
          {unverifiedMasjids.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No new masjids waiting for verification.
            </div>
          ) : (
            unverifiedMasjids.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
                  <div className="text-xs text-slate-500">
                    Location: {m.locality}, {m.district} &bull; GPS Accuracy: {m.gpsAccuracy}
                  </div>
                  <div className="text-xs text-slate-400">
                    Added by: {m.submittedBy} &bull; {m.submittedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConfirmMasjid(m.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm &amp; Publish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Claims Queue */}
      {activeTab === "claims" && (
        <div className="space-y-3">
          {claims.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No pending official claims from mosque committees.
            </div>
          ) : (
            claims.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{c.masjidName}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Tier 1 Claim
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Claimant: <strong>{c.claimantName}</strong> ({c.role}) &bull; Phone: {c.phone}
                  </div>
                  <div className="text-xs text-emerald-800">
                    Verification Evidence: <strong>{c.proofType}</strong> &bull; Submitted {c.submittedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveClaim(c.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Official Admin
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
