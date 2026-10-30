export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "jumuah";

export type MasjidCategory = "landmark" | "major" | "local";

export type MasjidStatus = "unverified" | "confirmed" | "verified" | "on_hold" | "deleted";

export type SourceTier = 1 | 2 | 3 | 4;

export interface RegionHierarchy {
  id: string;
  country: string;
  countryCode: string;
  state: string;
  district: string;
  city: string;
  slug: string;
}

export interface AmenityList {
  hasLadiesSection: boolean;
  hasWheelchairAccess: boolean;
  hasParking: boolean;
  hasWarmWaterWudu: boolean;
  hasJanazahService: boolean;
}

export interface PrayerTimingRecord {
  prayer: PrayerName;
  azaanTime: string; // "05:15"
  iqamahTime: string; // "05:35"
  isFixed: boolean; // if false, relative offset to azaan
  offsetMinutes?: number;
  sourceTier: SourceTier; // 1: Official, 2: Community-confirmed, 3: Unconfirmed, 4: Stale (>30 days)
  lastConfirmedAt: string; // ISO date
  confirmedCount: number;
  unconfirmedCount: number;
}

export interface JumuahShift {
  batchNumber: number;
  khutbahTime: string; // "12:45"
  iqamahTime: string; // "13:15"
  language: string; // "Arabic & Urdu"
}

export interface Masjid {
  id: string;
  name: string;
  slug: string;
  category: MasjidCategory;
  status: MasjidStatus;
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  district: string;
  state: string;
  country: string;
  timezone: string; // "Asia/Kolkata", "Asia/Riyadh"
  calculationMethod: string; // "Karachi", "MWL", "UmmAlQura"
  officialSourceUrl?: string;
  tvDisplayToken?: string;
  verificationPhotoPath?: string;
  amenities: AmenityList;
  timings: Record<PrayerName, PrayerTimingRecord>;
  jumuahShifts: JumuahShift[];
  createdAt: string;
  updatedAt: string;
}

export interface TimingProposal {
  id: string;
  masjidId: string;
  prayer: PrayerName;
  proposedIqamahTime: string;
  proposerName: string;
  status: "pending" | "approved" | "rejected";
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface VotePayload {
  masjidId: string;
  prayer: PrayerName;
  value: "correct" | "wrong";
  suggestedTime?: string;
  userLatitude?: number;
  userLongitude?: number;
  turnstileToken?: string;
}

// Jummah Khutbah & Bayan Directory Types
export type JummahLanguage =
  | "urdu"
  | "english"
  | "arabic"
  | "pashto"
  | "punjabi"
  | "sindhi"
  | "kashmiri"
  | "bengali"
  | "other";

export type JummahStatus = "active" | "on_hold" | "deleted";

export interface JummahSermon {
  id: string;
  slug: string;
  masjidId?: string;
  masjidName: string;
  locality: string;
  city: string;
  state?: string;
  country: string;
  address?: string;
  khateebName: string;
  khateebTitle: string; // e.g., "Mufti", "Maulana", "Dr.", "Sheikh", "Qari"
  khateebBio?: string;
  topic: string;
  description?: string;
  language: JummahLanguage;
  secondaryLanguage?: string;
  bayanTime: string; // "12:45"
  khutbahTime: string; // "13:30"
  jamatTime: string; // "13:45"
  livestreamUrl?: string; // YouTube Live, Facebook Live, Mixlr
  recordingUrl?: string;
  audioOnlyUrl?: string;
  isWeeklyRecurring: boolean;
  specialDate?: string;
  isLiveNow?: boolean;
  status: JummahStatus;
  contactNumber?: string;
  turnstileToken?: string;
  createdAt: string;
  updatedAt: string;
}

// Quran Tutor Directory Types
export type TutorGender = "male" | "female";
export type TutorTeachingMode = "online" | "in-person" | "both";
export type QuranSubject =
  | "noorani-qaida"
  | "nazra-quran"
  | "tajweed"
  | "hifz"
  | "tafseer-translation"
  | "arabic-language"
  | "islamic-studies-duas";

export type TutorAudience =
  | "kids-boys"
  | "kids-girls"
  | "adult-brothers"
  | "adult-sisters";

export type TutorStatus = "active" | "on_hold" | "deleted";

export interface QuranTutor {
  id: string;
  slug: string;
  name: string;
  title: string;
  gender: TutorGender;
  bio: string;
  photoUrl?: string;
  isVerified: boolean;
  hasIjazah: boolean;
  status?: TutorStatus;
  subjects: QuranSubject[];
  teachingMode: TutorTeachingMode;
  targetAudience: TutorAudience[];
  experienceYears: number;
  languages: string[];
  locality?: string;
  district?: string;
  state?: string;
  country: string;
  feeType: "free" | "paid" | "flexible";
  monthlyFeeAmount?: number;
  freeTrialAvailable: boolean;
  weeklyAvailabilityHours?: number;
  whatsappNumber: string;
  phoneNumber?: string;
  email?: string;
  turnstileToken?: string;
  createdAt: string;
  updatedAt: string;
}
