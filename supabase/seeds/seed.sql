-- ==============================================================================
-- ALL MASJID TIMING - SEED DATA FOR NEW INSTANCES
-- Seed: seed.sql
-- ==============================================================================

-- 1. SEED MASJIDS
INSERT INTO public.masjids (
    id, name, slug, category, status, latitude, longitude, address, locality, district, state, country, timezone, calculation_method, official_source_url, tv_display_token, amenities, timings, jumuah_shifts
) VALUES
(
    'm-haram-makkah',
    'Masjid al-Haram',
    'masjid-al-haram-makkah',
    'landmark',
    'verified',
    21.4225,
    39.8262,
    'Al Haram, Makkah 24231',
    'Al Haram',
    'Makkah',
    'Makkah Province',
    'Saudi Arabia',
    'Asia/Riyadh',
    'UmmAlQura',
    'https://gph.gov.sa',
    'tv-makkah-live',
    '{"hasLadiesSection": true, "hasWheelchairAccess": true, "hasParking": true, "hasWarmWaterWudu": true, "hasJanazahService": true}'::jsonb,
    '{
        "fajr": {"prayer": "fajr", "azaanTime": "05:08", "iqamahTime": "05:28", "isFixed": false, "sourceTier": 1},
        "dhuhr": {"prayer": "dhuhr", "azaanTime": "12:15", "iqamahTime": "12:35", "isFixed": false, "sourceTier": 1},
        "asr": {"prayer": "asr", "azaanTime": "15:35", "iqamahTime": "15:55", "isFixed": false, "sourceTier": 1},
        "maghrib": {"prayer": "maghrib", "azaanTime": "17:52", "iqamahTime": "18:02", "isFixed": false, "sourceTier": 1},
        "isha": {"prayer": "isha", "azaanTime": "19:22", "iqamahTime": "19:42", "isFixed": false, "sourceTier": 1},
        "jumuah": {"prayer": "jumuah", "azaanTime": "12:15", "iqamahTime": "12:45", "isFixed": true, "sourceTier": 1}
    }'::jsonb,
    '[{"batchNumber": 1, "khutbahTime": "12:15", "iqamahTime": "12:45", "language": "Arabic"}]'::jsonb
),
(
    'm-hazratbal-srinagar',
    'Dargah Hazratbal Shrine & Masjid',
    'dargah-hazratbal-srinagar',
    'major',
    'verified',
    34.1256,
    74.8427,
    'Hazratbal, Srinagar, Jammu & Kashmir 190006',
    'Hazratbal',
    'Srinagar',
    'Jammu & Kashmir',
    'India',
    'Asia/Kolkata',
    'Karachi',
    'https://jkwaqfboard.in',
    'tv-hazratbal-display',
    '{"hasLadiesSection": true, "hasWheelchairAccess": true, "hasParking": true, "hasWarmWaterWudu": true, "hasJanazahService": true}'::jsonb,
    '{
        "fajr": {"prayer": "fajr", "azaanTime": "05:15", "iqamahTime": "05:40", "isFixed": true, "sourceTier": 1},
        "dhuhr": {"prayer": "dhuhr", "azaanTime": "12:20", "iqamahTime": "12:45", "isFixed": true, "sourceTier": 1},
        "asr": {"prayer": "asr", "azaanTime": "15:40", "iqamahTime": "16:05", "isFixed": true, "sourceTier": 1},
        "maghrib": {"prayer": "maghrib", "azaanTime": "17:42", "iqamahTime": "17:48", "isFixed": false, "sourceTier": 1},
        "isha": {"prayer": "isha", "azaanTime": "19:05", "iqamahTime": "19:30", "isFixed": true, "sourceTier": 1},
        "jumuah": {"prayer": "jumuah", "azaanTime": "12:30", "iqamahTime": "13:15", "isFixed": true, "sourceTier": 1}
    }'::jsonb,
    '[{"batchNumber": 1, "khutbahTime": "12:45", "iqamahTime": "13:15", "language": "Kashmiri & Urdu"}]'::jsonb
),
(
    'm-jamia-srinagar',
    'Historic Jamia Masjid',
    'historic-jamia-masjid-srinagar',
    'major',
    'verified',
    34.0999,
    74.8115,
    'Nowhatta, Srinagar, Jammu & Kashmir 190002',
    'Nowhatta',
    'Srinagar',
    'Jammu & Kashmir',
    'India',
    'Asia/Kolkata',
    'Karachi',
    'https://anjumanauqafjamiamasjid.org',
    'tv-jamia-srinagar',
    '{"hasLadiesSection": true, "hasWheelchairAccess": false, "hasParking": false, "hasWarmWaterWudu": true, "hasJanazahService": true}'::jsonb,
    '{
        "fajr": {"prayer": "fajr", "azaanTime": "05:15", "iqamahTime": "05:45", "isFixed": true, "sourceTier": 1},
        "dhuhr": {"prayer": "dhuhr", "azaanTime": "12:20", "iqamahTime": "12:45", "isFixed": true, "sourceTier": 1},
        "asr": {"prayer": "asr", "azaanTime": "15:40", "iqamahTime": "16:10", "isFixed": true, "sourceTier": 1},
        "maghrib": {"prayer": "maghrib", "azaanTime": "17:42", "iqamahTime": "17:47", "isFixed": false, "sourceTier": 1},
        "isha": {"prayer": "isha", "azaanTime": "19:05", "iqamahTime": "19:35", "isFixed": true, "sourceTier": 1},
        "jumuah": {"prayer": "jumuah", "azaanTime": "12:30", "iqamahTime": "13:30", "isFixed": true, "sourceTier": 1}
    }'::jsonb,
    '[{"batchNumber": 1, "khutbahTime": "12:45", "iqamahTime": "13:30", "language": "Kashmiri"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED QURAN TUTORS
INSERT INTO public.quran_tutors (
    id, slug, name, title, gender, bio, is_verified, has_ijazah, status, subjects, teaching_mode, target_audience, experience_years, languages, locality, district, country, fee_type, monthly_fee_amount, free_trial_available, whatsapp_number
) VALUES
(
    'tutor-qari-bilal',
    'qari-muhammad-bilal-srinagar',
    'Qari Muhammad Bilal',
    'Hafiz & Qari (Ijazah in Hafs ''an Asim)',
    'male',
    'Over 8 years experience teaching Noorani Qaida, Makhaarij, and Nazra Quran with authentic Tajweed rules. Trained at Darul Uloom with Sanad in Qira''at.',
    true,
    true,
    'active',
    ARRAY['noorani-qaida', 'nazra-quran', 'tajweed', 'hifz'],
    'both',
    ARRAY['kids-boys', 'kids-girls', 'adult-brothers'],
    8,
    ARRAY['Urdu', 'Kashmiri', 'English'],
    'Rajbagh',
    'Srinagar',
    'India',
    'paid',
    800,
    true,
    '+917006123456'
),
(
    'tutor-alimah-fatima',
    'alimah-fatima-zahra',
    'Alimah Fatima Zahra',
    'Alimah (Fazilat / Dars-e-Nizami)',
    'female',
    'Certified Alimah offering dedicated 1-on-1 Quran and Tajweed classes strictly for sisters and young children. Patient and friendly environment.',
    true,
    true,
    'active',
    ARRAY['noorani-qaida', 'nazra-quran', 'tajweed', 'tafseer-translation', 'islamic-studies-duas'],
    'online',
    ARRAY['kids-girls', 'adult-sisters'],
    6,
    ARRAY['Urdu', 'English', 'Kashmiri'],
    'Online Worldwide',
    'Srinagar',
    'India',
    'paid',
    1000,
    true,
    '+919419001122'
),
(
    'tutor-hafiz-tariq',
    'hafiz-tariq-ahmad',
    'Hafiz Tariq Ahmad',
    'Hafiz-e-Quran (Community Volunteer)',
    'male',
    'Teaching Quran Nazra and Hifz revision for local neighborhood youth. Teaches completely free (Fi Sabilillah) for orphans and underprivileged kids.',
    true,
    false,
    'active',
    ARRAY['nazra-quran', 'hifz', 'islamic-studies-duas'],
    'in-person',
    ARRAY['kids-boys', 'adult-brothers'],
    5,
    ARRAY['Kashmiri', 'Urdu'],
    'Khanyar',
    'Srinagar',
    'India',
    'free',
    NULL,
    true,
    '+919906554433'
)
ON CONFLICT (id) DO NOTHING;
