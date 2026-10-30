-- ==============================================================================
-- ALL MASJID TIMING & QURAN TUTORS - INITIAL PRODUCTION SCHEMA
-- Migration: 20261030000001_initial_schema.sql
-- ==============================================================================

-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. MASJIDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.masjids (
    id TEXT PRIMARY KEY DEFAULT ('m-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('landmark', 'major', 'local')) DEFAULT 'local',
    status TEXT NOT NULL CHECK (status IN ('unverified', 'confirmed', 'verified', 'on_hold', 'deleted')) DEFAULT 'unverified',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    locality TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    calculation_method TEXT NOT NULL DEFAULT 'Karachi',
    official_source_url TEXT,
    tv_display_token TEXT UNIQUE,
    verification_photo_path TEXT, -- Stored in private Supabase bucket 'timetable-verifications'
    amenities JSONB NOT NULL DEFAULT '{
        "hasLadiesSection": false,
        "hasWheelchairAccess": false,
        "hasParking": false,
        "hasWarmWaterWudu": true,
        "hasJanazahService": false
    }'::jsonb,
    timings JSONB NOT NULL DEFAULT '{}'::jsonb,
    jumuah_shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast queries and proximity calculation
CREATE INDEX IF NOT EXISTS idx_masjids_slug ON public.masjids(slug);
CREATE INDEX IF NOT EXISTS idx_masjids_status ON public.masjids(status);
CREATE INDEX IF NOT EXISTS idx_masjids_locality ON public.masjids(locality);
CREATE INDEX IF NOT EXISTS idx_masjids_district ON public.masjids(district);
CREATE INDEX IF NOT EXISTS idx_masjids_coords ON public.masjids(latitude, longitude);

-- ------------------------------------------------------------------------------
-- 2. QURAN TUTORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quran_tutors (
    id TEXT PRIMARY KEY DEFAULT ('tutor-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    bio TEXT NOT NULL,
    photo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    has_ijazah BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('active', 'on_hold', 'deleted')) DEFAULT 'active',
    subjects TEXT[] NOT NULL DEFAULT ARRAY['noorani-qaida', 'nazra-quran'],
    teaching_mode TEXT NOT NULL CHECK (teaching_mode IN ('online', 'in-person', 'both')) DEFAULT 'both',
    target_audience TEXT[] NOT NULL DEFAULT ARRAY['kids-boys', 'kids-girls'],
    experience_years INTEGER NOT NULL DEFAULT 1,
    languages TEXT[] NOT NULL DEFAULT ARRAY['Urdu', 'English'],
    locality TEXT,
    district TEXT,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    fee_type TEXT NOT NULL CHECK (fee_type IN ('free', 'paid', 'flexible')) DEFAULT 'paid',
    monthly_fee_amount INTEGER,
    free_trial_available BOOLEAN NOT NULL DEFAULT true,
    weekly_availability_hours INTEGER DEFAULT 15,
    whatsapp_number TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for tutor directory filters
CREATE INDEX IF NOT EXISTS idx_tutors_slug ON public.quran_tutors(slug);
CREATE INDEX IF NOT EXISTS idx_tutors_status ON public.quran_tutors(status);
CREATE INDEX IF NOT EXISTS idx_tutors_gender ON public.quran_tutors(gender);
CREATE INDEX IF NOT EXISTS idx_tutors_teaching_mode ON public.quran_tutors(teaching_mode);
CREATE INDEX IF NOT EXISTS idx_tutors_fee_type ON public.quran_tutors(fee_type);
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON public.quran_tutors USING GIN(subjects);

-- ------------------------------------------------------------------------------
-- 3. TIMING PROPOSALS TABLE (Community Feedback & Vote Threshold)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timing_proposals (
    id TEXT PRIMARY KEY DEFAULT ('prop-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
    masjid_id TEXT NOT NULL REFERENCES public.masjids(id) ON DELETE CASCADE,
    prayer TEXT NOT NULL CHECK (prayer IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jumuah')),
    proposed_iqamah_time TEXT NOT NULL,
    proposer_name TEXT NOT NULL DEFAULT 'Anonymous Worshipper',
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    upvotes INTEGER NOT NULL DEFAULT 1,
    downvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_proposals_masjid ON public.timing_proposals(masjid_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.timing_proposals(status);

-- ------------------------------------------------------------------------------
-- 4. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_masjids_updated_at ON public.masjids;
CREATE TRIGGER trigger_masjids_updated_at
    BEFORE UPDATE ON public.masjids
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_tutors_updated_at ON public.quran_tutors;
CREATE TRIGGER trigger_tutors_updated_at
    BEFORE UPDATE ON public.quran_tutors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
