-- ==============================================================================
-- ALL MASJID TIMING & QURAN TUTORS - ROW LEVEL SECURITY & PRIVATE STORAGE
-- Migration: 20261030000002_storage_and_rls.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ROW LEVEL SECURITY (RLS) ENFORCEMENT
-- ------------------------------------------------------------------------------
ALTER TABLE public.masjids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timing_proposals ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PUBLIC & COMMUNITY POLICIES
-- ------------------------------------------------------------------------------

-- Masjids: Public can view verified & community mosques that are NOT on-hold or deleted
DROP POLICY IF EXISTS "Public can view active masjids" ON public.masjids;
CREATE POLICY "Public can view active masjids"
ON public.masjids FOR SELECT
TO anon, authenticated
USING (status NOT IN ('on_hold', 'deleted'));

-- Masjids: Public community can submit new masjids (initially created as 'unverified')
DROP POLICY IF EXISTS "Public community can submit new masjid" ON public.masjids;
CREATE POLICY "Public community can submit new masjid"
ON public.masjids FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Quran Tutors: Public can view active tutors that are NOT on-hold or deleted
DROP POLICY IF EXISTS "Public can view active quran tutors" ON public.quran_tutors;
CREATE POLICY "Public can view active quran tutors"
ON public.quran_tutors FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- Quran Tutors: Anyone can submit a tutor profile
DROP POLICY IF EXISTS "Tutors can register profile" ON public.quran_tutors;
CREATE POLICY "Tutors can register profile"
ON public.quran_tutors FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Timing Proposals: Anyone can view pending/approved proposals
DROP POLICY IF EXISTS "Public can view proposals" ON public.timing_proposals;
CREATE POLICY "Public can view proposals"
ON public.timing_proposals FOR SELECT
TO anon, authenticated
USING (true);

-- Timing Proposals: Community can submit timing proposals
DROP POLICY IF EXISTS "Community can propose timing" ON public.timing_proposals;
CREATE POLICY "Community can propose timing"
ON public.timing_proposals FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. ADMINISTRATOR FULL PRIVILEGES (RBAC via app_metadata)
-- ------------------------------------------------------------------------------

-- Helper function to check if the current user has the admin role in app_metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.jwt() IS NOT NULL
        AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin full control on Masjids (Edit, On-Hold, Delete, View all)
DROP POLICY IF EXISTS "Admins have full access to masjids" ON public.masjids;
CREATE POLICY "Admins have full access to masjids"
ON public.masjids FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin full control on Quran Tutors (Edit, On-Hold, Delete, Verify)
DROP POLICY IF EXISTS "Admins have full access to quran tutors" ON public.quran_tutors;
CREATE POLICY "Admins have full access to quran tutors"
ON public.quran_tutors FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admin full control on Timing Proposals (Approve, Reject)
DROP POLICY IF EXISTS "Admins have full access to proposals" ON public.timing_proposals;
CREATE POLICY "Admins have full access to proposals"
ON public.timing_proposals FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. PRIVATE SUPABASE STORAGE (Timetable Board Photos)
-- ------------------------------------------------------------------------------

-- Ensure the private bucket exists (public = false prevents direct URL scraping)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'timetable-verifications',
    'timetable-verifications',
    false,
    15728640, -- 15MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Policy: Authenticated Admins can read, download, or generate signed URLs
DROP POLICY IF EXISTS "Admins can view private timetable photos" ON storage.objects;
CREATE POLICY "Admins can view private timetable photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'timetable-verifications'
    AND public.is_admin()
);

-- Storage Policy: Server & Admins can upload photos to the bucket
DROP POLICY IF EXISTS "Server and authenticated users can upload timetable photos" ON storage.objects;
CREATE POLICY "Server and authenticated users can upload timetable photos"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'timetable-verifications');

-- Storage Policy: Admins can delete obsolete proof photos
DROP POLICY IF EXISTS "Admins can delete timetable photos" ON storage.objects;
CREATE POLICY "Admins can delete timetable photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'timetable-verifications'
    AND public.is_admin()
);
