import { SourceTier } from "./types";

export interface ConfidenceResult {
  tier: SourceTier;
  label: string;
  badgeVariant: "official" | "confirmed" | "unconfirmed" | "stale";
  isStale: boolean;
}

export function evaluateConfidence(
  sourceTier: SourceTier,
  confirmedVotes: number,
  unconfirmedVotes: number,
  lastConfirmedDateStr: string
): ConfidenceResult {
  const lastConfirmed = new Date(lastConfirmedDateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastConfirmed.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = diffDays > 30;

  // Tier 4: Stale check
  if (isStale) {
    return {
      tier: 4,
      label: `Unverified recently (${diffDays} days ago)`,
      badgeVariant: "stale",
      isStale: true,
    };
  }

  // Tier 1: Official verified admin
  if (sourceTier === 1) {
    return {
      tier: 1,
      label: "Official (Verified Admin)",
      badgeVariant: "official",
      isStale: false,
    };
  }

  // Tier 2: Community confirmed (threshold >= 3 positive net votes)
  const netVotes = confirmedVotes - unconfirmedVotes;
  if (netVotes >= 3) {
    return {
      tier: 2,
      label: `Confirmed by ${confirmedVotes} worshippers`,
      badgeVariant: "confirmed",
      isStale: false,
    };
  }

  // Tier 3: Unconfirmed proposal
  return {
    tier: 3,
    label: `Unconfirmed (${confirmedVotes} confirmations)`,
    badgeVariant: "unconfirmed",
    isStale: false,
  };
}
