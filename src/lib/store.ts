import { Masjid, TimingProposal, VotePayload } from "./types";
import { calculateDistanceMeters, isWithinProximityRadius } from "./geo";

// Initial Seed Database: Landmark Masjids + Srinagar Pilot Region Masjids
let masjidsStore: Masjid[] = [
  {
    id: "m-haram-makkah",
    name: "Masjid al-Haram",
    slug: "masjid-al-haram-makkah",
    category: "landmark",
    status: "verified",
    latitude: 21.4225,
    longitude: 39.8262,
    address: "Al Haram, Makkah 24231",
    locality: "Al Haram",
    district: "Makkah",
    state: "Makkah Province",
    country: "Saudi Arabia",
    timezone: "Asia/Riyadh",
    calculationMethod: "UmmAlQura",
    officialSourceUrl: "https://gph.gov.sa",
    tvDisplayToken: "tv-makkah-live",
    amenities: {
      hasLadiesSection: true,
      hasWheelchairAccess: true,
      hasParking: true,
      hasWarmWaterWudu: true,
      hasJanazahService: true,
    },
    timings: {
      fajr: { prayer: "fajr", azaanTime: "05:08", iqamahTime: "05:28", isFixed: false, offsetMinutes: 20, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 450, unconfirmedCount: 0 },
      dhuhr: { prayer: "dhuhr", azaanTime: "12:15", iqamahTime: "12:35", isFixed: false, offsetMinutes: 20, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 520, unconfirmedCount: 0 },
      asr: { prayer: "asr", azaanTime: "15:35", iqamahTime: "15:55", isFixed: false, offsetMinutes: 20, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 480, unconfirmedCount: 0 },
      maghrib: { prayer: "maghrib", azaanTime: "17:52", iqamahTime: "18:02", isFixed: false, offsetMinutes: 10, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 610, unconfirmedCount: 0 },
      isha: { prayer: "isha", azaanTime: "19:22", iqamahTime: "19:42", isFixed: false, offsetMinutes: 20, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 540, unconfirmedCount: 0 },
      jumuah: { prayer: "jumuah", azaanTime: "12:15", iqamahTime: "12:45", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 890, unconfirmedCount: 0 },
    },
    jumuahShifts: [
      { batchNumber: 1, khutbahTime: "12:15", iqamahTime: "12:45", language: "Arabic" },
    ],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-hazratbal-srinagar",
    name: "Dargah Hazratbal Shrine & Masjid",
    slug: "dargah-hazratbal-srinagar",
    category: "major",
    status: "verified",
    latitude: 34.1256,
    longitude: 74.8427,
    address: "Hazratbal, Srinagar, Jammu & Kashmir 190006",
    locality: "Hazratbal",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    timezone: "Asia/Kolkata",
    calculationMethod: "Karachi",
    officialSourceUrl: "https://jkwaqfboard.in",
    tvDisplayToken: "tv-hazratbal-display",
    amenities: {
      hasLadiesSection: true,
      hasWheelchairAccess: true,
      hasParking: true,
      hasWarmWaterWudu: true,
      hasJanazahService: true,
    },
    timings: {
      fajr: { prayer: "fajr", azaanTime: "05:15", iqamahTime: "05:40", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 42, unconfirmedCount: 1 },
      dhuhr: { prayer: "dhuhr", azaanTime: "12:20", iqamahTime: "12:45", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 55, unconfirmedCount: 0 },
      asr: { prayer: "asr", azaanTime: "15:40", iqamahTime: "16:00", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 38, unconfirmedCount: 0 },
      maghrib: { prayer: "maghrib", azaanTime: "17:42", iqamahTime: "17:47", isFixed: false, offsetMinutes: 5, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 70, unconfirmedCount: 0 },
      isha: { prayer: "isha", azaanTime: "19:05", iqamahTime: "19:30", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 64, unconfirmedCount: 1 },
      jumuah: { prayer: "jumuah", azaanTime: "12:30", iqamahTime: "13:30", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 120, unconfirmedCount: 0 },
    },
    jumuahShifts: [
      { batchNumber: 1, khutbahTime: "12:45", iqamahTime: "13:30", language: "Kashmiri, Urdu & Arabic" },
    ],
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-jamia-srinagar",
    name: "Historic Jamia Masjid",
    slug: "historic-jamia-masjid-srinagar",
    category: "landmark",
    status: "verified",
    latitude: 34.0931,
    longitude: 74.8118,
    address: "Nowhatta, Old City, Srinagar, Jammu & Kashmir 190002",
    locality: "Nowhatta",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    timezone: "Asia/Kolkata",
    calculationMethod: "Karachi",
    officialSourceUrl: "https://anjumanauqafjamiamasjid.org",
    amenities: {
      hasLadiesSection: true,
      hasWheelchairAccess: false,
      hasParking: true,
      hasWarmWaterWudu: true,
      hasJanazahService: true,
    },
    timings: {
      fajr: { prayer: "fajr", azaanTime: "05:15", iqamahTime: "05:45", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 88, unconfirmedCount: 0 },
      dhuhr: { prayer: "dhuhr", azaanTime: "12:20", iqamahTime: "13:00", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 92, unconfirmedCount: 1 },
      asr: { prayer: "asr", azaanTime: "15:40", iqamahTime: "16:15", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 81, unconfirmedCount: 0 },
      maghrib: { prayer: "maghrib", azaanTime: "17:42", iqamahTime: "17:47", isFixed: false, offsetMinutes: 5, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 110, unconfirmedCount: 0 },
      isha: { prayer: "isha", azaanTime: "19:05", iqamahTime: "19:45", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 95, unconfirmedCount: 0 },
      jumuah: { prayer: "jumuah", azaanTime: "12:45", iqamahTime: "13:45", isFixed: true, sourceTier: 1, lastConfirmedAt: new Date().toISOString(), confirmedCount: 350, unconfirmedCount: 0 },
    },
    jumuahShifts: [
      { batchNumber: 1, khutbahTime: "13:00", iqamahTime: "13:45", language: "Kashmiri, Urdu & Arabic" },
    ],
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-khanqah-srinagar",
    name: "Khanqah-e-Moula (Shah-e-Hamdan)",
    slug: "khanqah-e-moula-srinagar",
    category: "major",
    status: "confirmed",
    latitude: 34.0886,
    longitude: 74.8087,
    address: "Zaina Kadal, Srinagar 190002",
    locality: "Zaina Kadal",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    timezone: "Asia/Kolkata",
    calculationMethod: "Karachi",
    amenities: {
      hasLadiesSection: true,
      hasWheelchairAccess: false,
      hasParking: false,
      hasWarmWaterWudu: true,
      hasJanazahService: true,
    },
    timings: {
      fajr: { prayer: "fajr", azaanTime: "05:15", iqamahTime: "05:40", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 22, unconfirmedCount: 1 },
      dhuhr: { prayer: "dhuhr", azaanTime: "12:20", iqamahTime: "12:45", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 25, unconfirmedCount: 0 },
      asr: { prayer: "asr", azaanTime: "15:40", iqamahTime: "16:05", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 19, unconfirmedCount: 1 },
      maghrib: { prayer: "maghrib", azaanTime: "17:42", iqamahTime: "17:47", isFixed: false, offsetMinutes: 5, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 30, unconfirmedCount: 0 },
      isha: { prayer: "isha", azaanTime: "19:05", iqamahTime: "19:30", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 28, unconfirmedCount: 0 },
      jumuah: { prayer: "jumuah", azaanTime: "12:30", iqamahTime: "13:15", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 45, unconfirmedCount: 0 },
    },
    jumuahShifts: [
      { batchNumber: 1, khutbahTime: "12:45", iqamahTime: "13:15", language: "Kashmiri & Arabic" },
    ],
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "m-bilal-lalchowk",
    name: "Masjid Bilal (Lal Chowk Central)",
    slug: "masjid-bilal-lal-chowk",
    category: "local",
    status: "confirmed",
    latitude: 34.0722,
    longitude: 74.8115,
    address: "Residency Road, Lal Chowk, Srinagar 190001",
    locality: "Lal Chowk",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    timezone: "Asia/Kolkata",
    calculationMethod: "Karachi",
    amenities: {
      hasLadiesSection: false,
      hasWheelchairAccess: true,
      hasParking: false,
      hasWarmWaterWudu: true,
      hasJanazahService: false,
    },
    timings: {
      fajr: { prayer: "fajr", azaanTime: "05:15", iqamahTime: "05:35", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 16, unconfirmedCount: 0 },
      dhuhr: { prayer: "dhuhr", azaanTime: "12:20", iqamahTime: "12:40", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 32, unconfirmedCount: 1 },
      asr: { prayer: "asr", azaanTime: "15:40", iqamahTime: "16:00", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 20, unconfirmedCount: 0 },
      maghrib: { prayer: "maghrib", azaanTime: "17:42", iqamahTime: "17:47", isFixed: false, offsetMinutes: 5, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 27, unconfirmedCount: 0 },
      isha: { prayer: "isha", azaanTime: "19:05", iqamahTime: "19:25", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 18, unconfirmedCount: 0 },
      jumuah: { prayer: "jumuah", azaanTime: "12:30", iqamahTime: "13:00", isFixed: true, sourceTier: 2, lastConfirmedAt: new Date().toISOString(), confirmedCount: 40, unconfirmedCount: 0 },
    },
    jumuahShifts: [
      { batchNumber: 1, khutbahTime: "12:40", iqamahTime: "13:00", language: "Urdu & Arabic" },
    ],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
];

let proposalsStore: TimingProposal[] = [];

export function getAllMasjids(): Masjid[] {
  return masjidsStore;
}

export function getMasjidBySlug(slug: string): Masjid | undefined {
  return masjidsStore.find((m) => m.slug === slug || m.id === slug);
}

export function findNearbyMasjids(
  lat: number,
  lng: number,
  radiusMeters: number = 10000
): Array<Masjid & { distanceMeters: number }> {
  return masjidsStore
    .map((masjid) => {
      const distance = calculateDistanceMeters(lat, lng, masjid.latitude, masjid.longitude);
      return {
        ...masjid,
        distanceMeters: distance,
      };
    })
    .filter((m) => m.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function checkForDuplicateMasjid(
  lat: number,
  lng: number,
  name: string
): { isDuplicate: boolean; duplicateCandidate?: Masjid; distanceMeters?: number } {
  for (const masjid of masjidsStore) {
    const dist = calculateDistanceMeters(lat, lng, masjid.latitude, masjid.longitude);
    const nameMatch = masjid.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(masjid.name.toLowerCase());

    if (dist <= 50 || (dist <= 200 && nameMatch)) {
      return {
        isDuplicate: true,
        duplicateCandidate: masjid,
        distanceMeters: dist,
      };
    }
  }
  return { isDuplicate: false };
}

export function createMasjid(newMasjid: Omit<Masjid, "id" | "createdAt" | "updatedAt">): Masjid {
  const id = `m-${Date.now()}`;
  const masjid: Masjid = {
    ...newMasjid,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  masjidsStore.push(masjid);
  return masjid;
}

export function recordVote(payload: VotePayload): {
  success: boolean;
  message: string;
  newConfirmedCount: number;
  weighted: boolean;
  distanceMeters: number;
} {
  const masjid = masjidsStore.find((m) => m.id === payload.masjidId);
  if (!masjid) {
    return { success: false, message: "Masjid not found", newConfirmedCount: 0, weighted: false, distanceMeters: 0 };
  }

  const timingRecord = masjid.timings[payload.prayer];
  if (!timingRecord) {
    return { success: false, message: "Invalid prayer", newConfirmedCount: 0, weighted: false, distanceMeters: 0 };
  }

  let isWeighted = true;
  let distance = 0;

  if (payload.userLatitude && payload.userLongitude) {
    const prox = isWithinProximityRadius(
      payload.userLatitude,
      payload.userLongitude,
      masjid.latitude,
      masjid.longitude,
      500
    );
    isWeighted = prox.inRadius;
    distance = prox.distanceMeters;
  }

  if (payload.value === "correct") {
    timingRecord.confirmedCount += isWeighted ? 1 : 0.2;
    timingRecord.lastConfirmedAt = new Date().toISOString();

    // Check if threshold reached to promote to Tier 2 (Community-confirmed)
    if (timingRecord.sourceTier === 3 && timingRecord.confirmedCount >= 3) {
      timingRecord.sourceTier = 2;
    }
  } else {
    timingRecord.unconfirmedCount += isWeighted ? 1 : 0.2;
    if (payload.suggestedTime) {
      proposalsStore.push({
        id: `prop-${Date.now()}`,
        masjidId: masjid.id,
        prayer: payload.prayer,
        proposedIqamahTime: payload.suggestedTime,
        proposerName: "Community Worshipper",
        status: "pending",
        upvotes: 1,
        downvotes: 0,
        createdAt: new Date().toISOString(),
      });
    }
  }

  masjid.updatedAt = new Date().toISOString();

  return {
    success: true,
    message: isWeighted
      ? "Thank you! Your verified proximity vote has been recorded."
      : "Vote recorded. (Cast outside 500m radius, applied at reduced weight)",
    newConfirmedCount: Math.round(timingRecord.confirmedCount),
    weighted: isWeighted,
    distanceMeters: distance,
  };
}

export function submitProposal(
  masjidId: string,
  prayer: string,
  proposedIqamahTime: string,
  proposerName: string
): TimingProposal {
  const proposal: TimingProposal = {
    id: `prop-${Date.now()}`,
    masjidId,
    prayer: prayer as any,
    proposedIqamahTime,
    proposerName: proposerName || "Anonymous Contributor",
    status: "pending",
    upvotes: 1,
    downvotes: 0,
    createdAt: new Date().toISOString(),
  };
  proposalsStore.push(proposal);
  return proposal;
}
