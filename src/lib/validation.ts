import { z } from "zod";

export const CreateMasjidSchema = z.object({
  name: z.string().min(3, "Masjid name must be at least 3 characters").max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locality: z.string().min(2, "Locality required"),
  district: z.string().min(2, "District required"),
  state: z.string().min(2, "State required"),
  country: z.string().min(2, "Country required"),
  address: z.string().optional().default(""),
  category: z.enum(["landmark", "major", "local"]).default("local"),
  verificationPhotoPath: z.string().optional(),
  amenities: z.object({
    hasLadiesSection: z.boolean().default(false),
    hasWheelchairAccess: z.boolean().default(false),
    hasParking: z.boolean().default(false),
    hasWarmWaterWudu: z.boolean().default(false),
    hasJanazahService: z.boolean().default(false),
  }),
  timings: z.record(
    z.object({
      azaanTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM format required"),
      iqamahTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM format required"),
      isFixed: z.boolean().default(true),
    })
  ),
});

export const VoteSchema = z.object({
  masjidId: z.string().min(1),
  prayer: z.enum(["fajr", "dhuhr", "asr", "maghrib", "isha", "jumuah"]),
  value: z.enum(["correct", "wrong"]),
  suggestedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional(),
  turnstileToken: z.string().optional(),
});
