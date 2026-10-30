# Supabase Database & Architecture Reference

This directory contains the complete database migrations, security rules (RLS), seed data, and operational SQL scripts for **All Masjid Timing & Quran Tutors**.

---

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20261030000001_initial_schema.sql  # Tables (masjids, quran_tutors, timing_proposals), triggers, indexes
│   └── 20261030000002_storage_and_rls.sql # RLS policies, RBAC admin check, and private storage bucket
├── seeds/
│   └── seed.sql                           # Initial landmark mosques & verified Quran tutors
└── README.md                              # This developer guide & SQL snippet reference
```

---

## 1. Quick Setup in Supabase Dashboard (No CLI Required)

If you are setting up a new Supabase project without installing the Supabase CLI:

1. Open your **Supabase Dashboard $\to$ SQL Editor**.
2. Run [`20261030000001_initial_schema.sql`](./migrations/20261030000001_initial_schema.sql).
3. Run [`20261030000002_storage_and_rls.sql`](./migrations/20261030000002_storage_and_rls.sql).
4. Run [`seed.sql`](./seeds/seed.sql) (optional, populates landmark mosques).
5. Grant yourself the `admin` role using the snippet below.

---

## 2. Essential SQL Snippets

### Grant Admin Role to a Gmail/User
To give an admin access to `/admin/dashboard`, update their `raw_app_meta_data`:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'yourname@gmail.com';
```

### Revoke Admin Role
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data - 'role'
WHERE email = 'user@example.com';
```

### View All Registered Admins
```sql
SELECT id, email, raw_app_meta_data->>'role' as role, created_at, last_sign_in_at
FROM auth.users
WHERE (raw_app_meta_data->>'role') IN ('admin', 'super_admin', 'moderator');
```

---

## 3. Row-Level Security (RLS) Summary

| Table / Bucket | Public (Anon) Access | Authenticated User Access | Admin (`role: 'admin'`) Access |
| :--- | :--- | :--- | :--- |
| **`public.masjids`** | SELECT (where `status NOT IN ('on_hold', 'deleted')`), INSERT (`unverified`) | Same as Public | **FULL (SELECT, INSERT, UPDATE, DELETE)** |
| **`public.quran_tutors`** | SELECT (where `status = 'active'`), INSERT | Same as Public | **FULL (SELECT, INSERT, UPDATE, DELETE)** |
| **`public.timing_proposals`** | SELECT, INSERT | SELECT, INSERT | **FULL (Approve, Reject, Delete)** |
| **Storage: `timetable-verifications`** | ❌ Blocked (private) | ❌ Blocked | **FULL (View, Download, Delete via Signed URLs)** |

---

## 4. Supabase CLI Workflow

If you prefer using the Supabase CLI locally:

```bash
# 1. Link project
supabase link --project-ref your-project-ref

# 2. Push all migrations to remote database
supabase db push

# 3. Apply seeds (if needed)
supabase db reset
```
