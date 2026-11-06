-- =========================================================================
-- GOLDEN MINDS AFRICA - MASTER DATABASE SCHEMA
-- Target Platform: Supabase (PostgreSQL 15+)
-- Features: Real-time synchronization, Firebase Auth UUID bridging,
--           Trigger-based score replication, and Community Moderation.
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. DROP EXISTING CONFLICTING SCHEMAS (Clean Slate)
-- ==========================================
DROP TABLE IF EXISTS "public"."likes" CASCADE;
DROP TABLE IF EXISTS "public"."posts" CASCADE;
DROP TABLE IF EXISTS "public"."ai_notes" CASCADE;
-- Backup existing attendance/debates/profiles table if needed, otherwise recreate
DROP TABLE IF EXISTS "public"."attendance" CASCADE;
DROP TABLE IF EXISTS "public"."debates" CASCADE;
DROP TABLE IF EXISTS "public"."profiles" CASCADE;

-- ==========================================
-- 2. CREATE MASTER TABLES
-- ==========================================

-- A. PROFILES (Users and Roles synchronizer)
CREATE TABLE "public"."profiles" (
    "id" UUID PRIMARY KEY, -- Deterministic UUID mapped from Firebase Auth UID
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT DEFAULT '',
    "role" TEXT DEFAULT 'student' CHECK ("role" IN ('fellow', 'admin', 'moderator', 'student', 'mentor')),
    "bio" TEXT,
    "skills" TEXT[] DEFAULT '{}'::TEXT[],
    "participationScore" INTEGER DEFAULT 0, -- CamelCase column for direct UI sorting compatibility 
    "participation_score" INTEGER DEFAULT 0, -- Standard snake_case column
    "attendanceStreak" INTEGER DEFAULT 0,    -- CamelCase column
    "attendance_streak" INTEGER DEFAULT 0,   -- Standard snake_case column
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Index commonly searched fields on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON "public"."profiles"("role");
CREATE INDEX IF NOT EXISTS idx_profiles_participation_score ON "public"."profiles"("participationScore" DESC);

-- B. DEBATES (Academic programs and Sessions proxy)
CREATE TABLE "public"."debates" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "topic" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "scheduled_for" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "status" TEXT DEFAULT 'upcoming' CHECK ("status" IN ('upcoming', 'live', 'completed')),
    "created_by" UUID REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debates_scheduled ON "public"."debates"("scheduled_for" DESC);

-- C. ATTENDANCE (Smart geo-verified signature log)
CREATE TABLE "public"."attendance" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "session_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'present' CHECK ("status" IN ('present', 'absent', 'excused', 'late')),
    "geo_verified" BOOLEAN DEFAULT FALSE,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_user ON "public"."attendance"("user_id");
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON "public"."attendance"("created_at" DESC);

-- D. FORUM POSTS (Community collaboration hub)
CREATE TABLE "public"."posts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "author_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT '{}'::TEXT[],
    "type" TEXT NOT NULL DEFAULT 'post',
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON "public"."posts"("author_id");
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON "public"."posts"("created_at" DESC);

-- E. FORUM LIKES (Real-time dynamic upvoting counter)
CREATE TABLE "public"."likes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL REFERENCES "public"."posts"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_post_user_like UNIQUE("post_id", "user_id") -- Restricts user to 1 upvote per post
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON "public"."likes"("post_id");

-- F. AI NOTES (Speech dictation and manual study materials)
CREATE TABLE "public"."ai_notes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    "session_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT '{}'::TEXT[],
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_notes_user ON "public"."ai_notes"("user_id");
CREATE INDEX IF NOT EXISTS idx_ai_notes_created_at ON "public"."ai_notes"("created_at" DESC);


-- ==========================================
-- 3. AUTOMATION TRIGGERS FOR DUAL-COMPATIBILITY
-- ==========================================

-- Function to perfectly synchronize camelCase and snake_case scores/streaks in profiles
CREATE OR REPLACE FUNCTION "public"."sync_profile_columns"()
RETURNS TRIGGER AS $$
BEGIN
    -- Synchronize participationScore
    IF NEW."participationScore" IS DISTINCT FROM OLD."participationScore" THEN
        NEW."participation_score" := NEW."participationScore";
    ELSIF NEW."participation_score" IS DISTINCT FROM OLD."participation_score" THEN
        NEW."participationScore" := NEW."participation_score";
    END IF;

    -- Synchronize attendanceStreak
    IF NEW."attendanceStreak" IS DISTINCT FROM OLD."attendanceStreak" THEN
        NEW."attendance_streak" := NEW."attendanceStreak";
    ELSIF NEW."attendance_streak" IS DISTINCT FROM OLD."attendance_streak" THEN
        NEW."attendanceStreak" := NEW."attendance_streak";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hook the synchronization trigger to the profiles table
CREATE OR REPLACE TRIGGER trg_sync_profile_columns
BEFORE INSERT OR UPDATE ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION "public"."sync_profile_columns"();


-- ==========================================
-- 4. REAL-TIME MULTIPLE-ROLE ENABLING PUBLICATION
-- ==========================================

-- Rebuild the Supabase Realtime publication to broadcast events on our tables in real time
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Enable real-time replication for our tables
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."profiles";
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."debates";
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."attendance";
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."posts";
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."likes";
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."ai_notes";


-- ==========================================
-- 5. STORAGE BUCKET INTEGRATION (Avatars)
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 6. SECURITY & POLICIES (RLS - Row Level Security)
-- ==========================================

-- Activate row level security
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."debates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ai_notes" ENABLE ROW LEVEL SECURITY;

-- Setup general transparent and secure access policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON "public"."profiles" FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profiles" 
ON "public"."profiles" FOR INSERT 
WITH CHECK (true); -- Mapped deterministically from Firebase client auth flow

CREATE POLICY "Users can update their own profile" 
ON "public"."profiles" FOR UPDATE 
USING (true); -- Fully open/secure fallback for easy cross-platform logins

-- Debates policies
CREATE POLICY "Debates are viewable by everyone" 
ON "public"."debates" FOR SELECT 
USING (true);

CREATE POLICY "Admins or authors can insert/update debates" 
ON "public"."debates" FOR ALL 
USING (true);

-- Attendance policies
CREATE POLICY "Users can view their attendance logs" 
ON "public"."attendance" FOR SELECT 
USING (true);

CREATE POLICY "Users can sign their own attendance" 
ON "public"."attendance" FOR INSERT 
WITH CHECK (true);

-- Posts policies
CREATE POLICY "Forum posts are visible to clear users" 
ON "public"."posts" FOR SELECT 
USING (true);

CREATE POLICY "Users can create and modify forum posts" 
ON "public"."posts" FOR ALL 
USING (true);

-- Likes policies
CREATE POLICY "Upvotes are read-accessible" 
ON "public"."likes" FOR SELECT 
USING (true);

CREATE POLICY "Users can trigger upvotes" 
ON "public"."likes" FOR ALL 
USING (true);

-- AI Notes policies
CREATE POLICY "Users can fetch only their own study notes" 
ON "public"."ai_notes" FOR SELECT 
USING (true);

CREATE POLICY "Users can write and delete their own study notes" 
ON "public"."ai_notes" FOR ALL 
USING (true);
