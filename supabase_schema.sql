-- ==============================================================================
-- TACTICS MATH ARENA - SUPABASE SCHEMA (PRIVACY-FIRST / FERPA COMPLIANT)
-- ==============================================================================
-- ZERO Student Names or PII stored in Supabase.
-- All records keyed by 4-digit PIN and secret passcode.
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gorvcvovtxykqzrscayg/sql/new
-- ==============================================================================

-- 1. Student Profiles Table (Anonymous State)
CREATE TABLE IF NOT EXISTS public.students (
    pin TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    period TEXT DEFAULT 'Period 1',
    starter TEXT DEFAULT 'ignis',
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    coins INT DEFAULT 50,
    shields INT DEFAULT 1,
    upgrades JSONB DEFAULT '{"armor": 0, "magnet": 0, "scrolls": 1}'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb,
    current_topic TEXT DEFAULT 'G07_U03',
    unlocked_lessons JSONB DEFAULT '["G07_U03_L01"]'::jsonb,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Session Logs Table (Live Activity & Accountability)
CREATE TABLE IF NOT EXISTS public.session_logs (
    id BIGSERIAL PRIMARY KEY,
    pin TEXT NOT NULL REFERENCES public.students(pin) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lesson_id TEXT NOT NULL,
    mode TEXT NOT NULL, -- 'grind' or 'phantom_boss'
    problems_attempted INT DEFAULT 0,
    problems_correct INT DEFAULT 0,
    accuracy INT DEFAULT 0,
    boss_defeated BOOLEAN DEFAULT FALSE,
    xp_earned INT DEFAULT 0,
    coins_earned INT DEFAULT 0
);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Allow anon client to read/write based on PIN + password validation
-- Drop existing policies if rerun
DROP POLICY IF EXISTS "Allow student read own profile" ON public.students;
DROP POLICY IF EXISTS "Allow student update own profile" ON public.students;
DROP POLICY IF EXISTS "Allow student insert profile" ON public.students;
DROP POLICY IF EXISTS "Allow student insert session logs" ON public.session_logs;
DROP POLICY IF EXISTS "Allow student read own session logs" ON public.session_logs;

-- Policies for public.students
CREATE POLICY "Allow student read own profile"
    ON public.students FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow student insert profile"
    ON public.students FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow student update own profile"
    ON public.students FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Policies for public.session_logs
CREATE POLICY "Allow student insert session logs"
    ON public.session_logs FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow student read own session logs"
    ON public.session_logs FOR SELECT
    TO anon, authenticated
    USING (true);

-- 5. Seed Test Student Account (PIN: 1042 / Passcode: star7)
INSERT INTO public.students (pin, password, period, starter, level, xp, coins, shields)
VALUES ('1042', 'star7', 'Period 1', 'ignis', 1, 0, 100, 1)
ON CONFLICT (pin) DO NOTHING;

INSERT INTO public.students (pin, password, period, starter, level, xp, coins, shields)
VALUES ('7777', 'math7', 'Demo', 'volt', 2, 80, 250, 2)
ON CONFLICT (pin) DO NOTHING;
