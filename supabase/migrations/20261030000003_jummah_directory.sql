-- ====================================================================================
-- Migration: 20261030000003_jummah_directory.sql
-- Description: Jummah Khutbah & Bayan Directory Schema, RLS, Triggers, and Seeds
-- ====================================================================================

-- 1. Create Jummah Language Enum if not exists
DO $$ BEGIN
  CREATE TYPE public.jummah_language AS ENUM (
    'urdu',
    'english',
    'arabic',
    'pashto',
    'punjabi',
    'sindhi',
    'kashmiri',
    'bengali',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create Jummah Sermons Table
CREATE TABLE IF NOT EXISTS public.jummah_sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  masjid_id UUID REFERENCES public.masjids(id) ON DELETE SET NULL,
  masjid_name TEXT NOT NULL,
  locality TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'Pakistan',
  address TEXT,
  khateeb_name TEXT NOT NULL,
  khateeb_title TEXT NOT NULL DEFAULT 'Maulana',
  khateeb_bio TEXT,
  topic TEXT NOT NULL,
  description TEXT,
  language public.jummah_language NOT NULL DEFAULT 'urdu',
  secondary_language TEXT,
  bayan_time TEXT NOT NULL, -- HH:mm (e.g. 12:45)
  khutbah_time TEXT NOT NULL, -- HH:mm (e.g. 13:30)
  jamat_time TEXT NOT NULL, -- HH:mm (e.g. 13:45)
  livestream_url TEXT,
  recording_url TEXT,
  audio_only_url TEXT,
  is_weekly_recurring BOOLEAN NOT NULL DEFAULT true,
  special_date DATE,
  is_live_now BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'deleted')),
  contact_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Indexes for fast search & filtering
CREATE INDEX IF NOT EXISTS idx_jummah_city ON public.jummah_sermons (lower(city));
CREATE INDEX IF NOT EXISTS idx_jummah_language ON public.jummah_sermons (language);
CREATE INDEX IF NOT EXISTS idx_jummah_status ON public.jummah_sermons (status);
CREATE INDEX IF NOT EXISTS idx_jummah_livestream ON public.jummah_sermons (livestream_url) WHERE livestream_url IS NOT NULL;

-- 4. Automatic updated_at trigger
CREATE OR REPLACE TRIGGER trigger_jummah_updated_at
  BEFORE UPDATE ON public.jummah_sermons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.jummah_sermons ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active sermons
CREATE POLICY "Public can view active jummah sermons"
  ON public.jummah_sermons
  FOR SELECT
  USING (status = 'active');

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to jummah sermons"
  ON public.jummah_sermons
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy: Anonymous or authenticated users can submit new sermons
CREATE POLICY "Anyone can submit a jummah sermon"
  ON public.jummah_sermons
  FOR INSERT
  WITH CHECK (true);

-- ====================================================================================
-- Initial Starter Seeds for Jummah Sermons
-- ====================================================================================
INSERT INTO public.jummah_sermons (
  slug,
  masjid_name,
  locality,
  city,
  state,
  country,
  khateeb_name,
  khateeb_title,
  khateeb_bio,
  topic,
  description,
  language,
  secondary_language,
  bayan_time,
  khutbah_time,
  jamat_time,
  livestream_url,
  status
) VALUES
(
  'mufti-taqi-usmani-darul-uloom-karachi',
  'Jamia Darul Uloom Mosque',
  'Korangi Industrial Area',
  'Karachi',
  'Sindh',
  'Pakistan',
  'Justice (R) Mufti Muhammad Taqi Usmani',
  'Mufti',
  'Leading global Islamic jurist, former Supreme Court Shariat Appellate Bench Judge.',
  'Islamic Ethics in Modern Commerce & Family Harmony',
  'Detailed pre-Khutbah Urdu lecture addressing practical contemporary financial ethics followed by Arabic Khutbah.',
  'urdu',
  'Arabic',
  '12:45',
  '13:30',
  '13:45',
  'https://www.youtube.com/@DarulUloomKarachiOfficial/live',
  'active'
),
(
  'maulana-tariq-jamil-jamia-masjid-lahore',
  'Jamia Masjid Al-Noor',
  'Model Town',
  'Lahore',
  'Punjab',
  'Pakistan',
  'Maulana Tariq Jamil',
  'Maulana',
  'Renowned Islamic orator and peace promoter.',
  'Character Building, Akhlaq & Sincere Repentance (Tawbah)',
  'Heartfelt pre-Jummah Bayan in Urdu focused on reviving Sunnah ethics and youth guidance.',
  'urdu',
  NULL,
  '12:30',
  '13:15',
  '13:30',
  'https://www.youtube.com/@TariqJamilOfficial/live',
  'active'
),
(
  'sheikh-abdur-rahman-as-sudais-masjid-al-haram',
  'Masjid al-Haram',
  'Al Haram',
  'Makkah',
  'Makkah Province',
  'Saudi Arabia',
  'Sheikh Dr. Abdur-Rahman As-Sudais',
  'Sheikh Dr.',
  'Chief of the General Presidency for the Affairs of the Two Holy Mosques.',
  'Unity of the Ummah, Global Peace, and Gratitude to Allah',
  'Official Friday Khutbah delivered from the Holy Kaaba with live simultaneous audio translation into English and Urdu.',
  'arabic',
  'English & Urdu Translation',
  '12:15',
  '12:20',
  '12:40',
  'https://www.youtube.com/@Haramaininfo/live',
  'active'
)
ON CONFLICT (slug) DO NOTHING;
