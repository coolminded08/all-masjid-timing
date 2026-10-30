import {
  Masjid,
  MasjidStatus,
  TimingProposal,
  VotePayload,
  QuranTutor,
  TutorStatus,
  TutorGender,
  TutorTeachingMode,
  QuranSubject,
} from "./types";
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

export function getAllMasjids(includeHidden: boolean = false): Masjid[] {
  if (includeHidden) return masjidsStore.filter((m) => m.status !== "deleted");
  return masjidsStore.filter((m) => m.status !== "deleted" && m.status !== "on_hold");
}

export function updateMasjid(id: string, updates: Partial<Masjid>): Masjid | null {
  const index = masjidsStore.findIndex((m) => m.id === id || m.slug === id);
  if (index === -1) return null;
  masjidsStore[index] = {
    ...masjidsStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return masjidsStore[index];
}

export function setMasjidStatus(id: string, status: MasjidStatus): Masjid | null {
  return updateMasjid(id, { status });
}

export function deleteMasjid(id: string): boolean {
  const index = masjidsStore.findIndex((m) => m.id === id || m.slug === id);
  if (index === -1) return false;
  masjidsStore[index].status = "deleted";
  return true;
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


// Quran Tutors In-Memory Seed Store
let tutorsStore: QuranTutor[] = [
  {
    id: "tutor-qari-bilal",
    slug: "qari-muhammad-bilal-srinagar",
    name: "Qari Muhammad Bilal",
    title: "Hafiz & Qari (Ijazah in Hafs 'an Asim)",
    gender: "male",
    bio: "Over 8 years experience teaching Noorani Qaida, Makhaarij, and Nazra Quran with authentic Tajweed rules. Trained at Darul Uloom with Sanad in Qira'at. Special focus on children's foundational pronunciation.",
    isVerified: true,
    hasIjazah: true,
    subjects: ["noorani-qaida", "nazra-quran", "tajweed", "hifz"],
    teachingMode: "both",
    targetAudience: ["kids-boys", "kids-girls", "adult-brothers"],
    experienceYears: 8,
    languages: ["Urdu", "Kashmiri", "English"],
    locality: "Rajbagh",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    feeType: "paid",
    monthlyFeeAmount: 800,
    freeTrialAvailable: true,
    weeklyAvailabilityHours: 20,
    whatsappNumber: "+917006123456",
    phoneNumber: "+917006123456",
    email: "qari.bilal@example.com",
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tutor-alimah-fatima",
    slug: "alimah-fatima-zahra",
    name: "Alimah Fatima Zahra",
    title: "Alimah (Fazilat / Dars-e-Nizami)",
    gender: "female",
    bio: "Certified Alimah offering dedicated 1-on-1 Quran and Tajweed classes strictly for sisters and young children. Patient and friendly environment with daily revision and basic Sunnah duas.",
    isVerified: true,
    hasIjazah: true,
    subjects: ["noorani-qaida", "nazra-quran", "tajweed", "tafseer-translation", "islamic-studies-duas"],
    teachingMode: "online",
    targetAudience: ["kids-girls", "adult-sisters"],
    experienceYears: 6,
    languages: ["Urdu", "English", "Kashmiri"],
    locality: "Online Worldwide",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    feeType: "paid",
    monthlyFeeAmount: 1000,
    freeTrialAvailable: true,
    weeklyAvailabilityHours: 15,
    whatsappNumber: "+919419001122",
    phoneNumber: "+919419001122",
    email: "alimah.fatima@example.com",
    createdAt: "2026-01-20T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tutor-hafiz-tariq",
    slug: "hafiz-tariq-ahmad",
    name: "Hafiz Tariq Ahmad",
    title: "Hafiz-e-Quran (Community Volunteer)",
    gender: "male",
    bio: "Teaching Quran Nazra and Hifz revision for local neighborhood youth. Teaches completely free (Fi Sabilillah) for orphans, underprivileged kids, and anyone with sincere intent to learn.",
    isVerified: true,
    hasIjazah: false,
    subjects: ["nazra-quran", "hifz", "islamic-studies-duas"],
    teachingMode: "in-person",
    targetAudience: ["kids-boys", "adult-brothers"],
    experienceYears: 5,
    languages: ["Kashmiri", "Urdu"],
    locality: "Khanyar",
    district: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    feeType: "free",
    freeTrialAvailable: true,
    weeklyAvailabilityHours: 10,
    whatsappNumber: "+919906554433",
    phoneNumber: "+919906554433",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tutor-ustadh-zayd",
    slug: "ustadh-zayd-al-hasani",
    name: "Ustadh Zayd Al-Hasani",
    title: "Qur'anic Arabic & Tajweed Specialist",
    gender: "male",
    bio: "Graduate in Qur'anic Sciences from Islamic University of Madinah. Teaches Quranic Arabic comprehension, word-by-word grammatical breakdown, and advanced Tajweed rules.",
    isVerified: true,
    hasIjazah: true,
    subjects: ["tajweed", "tafseer-translation", "arabic-language"],
    teachingMode: "online",
    targetAudience: ["kids-boys", "adult-brothers"],
    experienceYears: 10,
    languages: ["English", "Arabic", "Urdu"],
    locality: "Global Online",
    country: "Saudi Arabia",
    feeType: "flexible",
    monthlyFeeAmount: 1500,
    freeTrialAvailable: true,
    weeklyAvailabilityHours: 25,
    whatsappNumber: "+966501234567",
    email: "ustadh.zayd@example.com",
    createdAt: "2026-02-05T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
];

export interface TutorFilters {
  gender?: TutorGender;
  mode?: TutorTeachingMode;
  subject?: QuranSubject;
  feeType?: "free" | "paid" | "flexible";
  query?: string;
  hasIjazah?: boolean;
}

export function getQuranTutors(filters?: TutorFilters, includeHidden: boolean = false): QuranTutor[] {
  let list = [...tutorsStore];

  if (!includeHidden) {
    list = list.filter((t) => t.status !== "on_hold" && t.status !== "deleted");
  } else {
    list = list.filter((t) => t.status !== "deleted");
  }

  if (!filters) return list;

  if (filters.gender) {
    list = list.filter((t) => t.gender === filters.gender);
  }

  if (filters.mode && filters.mode !== "both") {
    list = list.filter(
      (t) => t.teachingMode === filters.mode || t.teachingMode === "both"
    );
  }

  if (filters.subject) {
    list = list.filter((t) => t.subjects.includes(filters.subject!));
  }

  if (filters.feeType) {
    list = list.filter((t) => t.feeType === filters.feeType);
  }

  if (filters.hasIjazah !== undefined) {
    list = list.filter((t) => t.hasIjazah === filters.hasIjazah);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        (t.locality && t.locality.toLowerCase().includes(q)) ||
        (t.district && t.district.toLowerCase().includes(q)) ||
        t.languages.some((l) => l.toLowerCase().includes(q))
    );
  }

  return list;
}

export function getQuranTutorBySlugOrId(idOrSlug: string): QuranTutor | null {
  return (
    tutorsStore.find(
      (t) => t.id === idOrSlug || t.slug.toLowerCase() === idOrSlug.toLowerCase()
    ) || null
  );
}

export function addQuranTutor(data: Omit<QuranTutor, "id" | "slug" | "createdAt" | "updatedAt">): QuranTutor {
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  const newTutor: QuranTutor = {
    ...data,
    id: `tutor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tutorsStore.unshift(newTutor);
  return newTutor;
}


export function getAllQuranTutorsForAdmin(): QuranTutor[] {
  return tutorsStore.filter((t) => t.status !== "deleted");
}

export function updateQuranTutor(id: string, updates: Partial<QuranTutor>): QuranTutor | null {
  const index = tutorsStore.findIndex((t) => t.id === id || t.slug === id);
  if (index === -1) return null;
  tutorsStore[index] = {
    ...tutorsStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return tutorsStore[index];
}

export function setQuranTutorStatus(id: string, status: TutorStatus): QuranTutor | null {
  return updateQuranTutor(id, { status });
}

export function deleteQuranTutor(id: string): boolean {
  const index = tutorsStore.findIndex((t) => t.id === id || t.slug === id);
  if (index === -1) return false;
  tutorsStore[index].status = "deleted";
  return true;
}
