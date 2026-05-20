-- Carry App — Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── GROUPS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  short       TEXT NOT NULL,
  description TEXT,
  color_tag   TEXT NOT NULL DEFAULT '#888888',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ISSUES ──────────────────────────────────────────────────
CREATE TYPE issue_status AS ENUM ('pending', 'resolved');

CREATE TABLE IF NOT EXISTS public.issues (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  photo_url         TEXT,
  current_status    issue_status NOT NULL DEFAULT 'pending',
  created_month     TEXT NOT NULL,          -- format: YYYY-MM
  carry_over_count  INTEGER NOT NULL DEFAULT 0,
  last_review_month TEXT,
  resolved_month    TEXT,
  reporter          TEXT NOT NULL DEFAULT 'Unknown',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── MONTHLY REVIEWS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.monthly_reviews (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year       TEXT NOT NULL UNIQUE,
  total_issues     INTEGER DEFAULT 0,
  resolved_count   INTEGER DEFAULT 0,
  unresolved_count INTEGER DEFAULT 0,
  carry_over_count INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REVIEW ACTIONS ──────────────────────────────────────────
CREATE TYPE review_action_type AS ENUM ('resolved', 'carry_over');

CREATE TABLE IF NOT EXISTS public.review_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  review_id   UUID REFERENCES public.monthly_reviews(id),
  action_type review_action_type NOT NULL,
  action_by   TEXT DEFAULT 'user',
  action_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RPC: increment carry_over_count atomically ───────────────
CREATE OR REPLACE FUNCTION increment_carry_over(issue_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.issues
  SET carry_over_count = carry_over_count + 1
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.groups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions  ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access
CREATE POLICY "auth_all" ON public.groups
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all" ON public.issues
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all" ON public.monthly_reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_all" ON public.review_actions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anon read (for demo without login)
CREATE POLICY "anon_read" ON public.groups
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read" ON public.issues
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_all" ON public.issues
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_all" ON public.groups
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_all" ON public.monthly_reviews
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon_all" ON public.review_actions
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── STORAGE BUCKET ──────────────────────────────────────────
-- Run in Storage section of Supabase dashboard OR via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('issue-photos', 'issue-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'issue-photos');

CREATE POLICY "Auth upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-photos');

CREATE POLICY "Anon upload" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'issue-photos');
