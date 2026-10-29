import React from "react";
import { CheckCircle2, ShieldCheck, AlertCircle, Clock } from "lucide-react";
import { SourceTier } from "@/lib/types";

interface Props {
  tier: SourceTier;
  label?: string;
  confirmedCount?: number;
  className?: string;
}

export default function ConfidenceBadge({ tier, label, confirmedCount = 0, className = "" }: Props) {
  if (tier === 1) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}
        title="Verified by official Masjid Administration or Curators"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        {label || "Official"}
      </span>
    );
  }

  if (tier === 2) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 ${className}`}
        title={`Confirmed by ${confirmedCount} community worshippers`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
        {label || `Community Confirmed (${confirmedCount})`}
      </span>
    );
  }

  if (tier === 4) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Not confirmed in over 30 days"
      >
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        {label || "Unverified recently"}
      </span>
    );
  }

  // Tier 3: Unconfirmed
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
      title="Proposed timing awaiting verification"
    >
      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
      {label || "Unconfirmed"}
    </span>
  );
}
