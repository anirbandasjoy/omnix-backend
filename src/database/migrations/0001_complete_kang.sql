-- ============================================================================
-- Idempotent Migration: Rename Tables
-- ============================================================================
-- This migration can be run multiple times safely.
-- It renames: activities → user_activities, identities → user_identities, etc.
-- ============================================================================

-- Step 1: Check if old tables exist and drop them safely
DO $$
BEGIN
    -- Drop old tables if they exist
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activities') THEN
        DROP TABLE IF EXISTS "activities" CASCADE;
        RAISE NOTICE 'Dropped table: activities';
    ELSE
        RAISE NOTICE 'Table "activities" does not exist, skipping...';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'identities') THEN
        DROP TABLE IF EXISTS "identities" CASCADE;
        RAISE NOTICE 'Dropped table: identities';
    ELSE
        RAISE NOTICE 'Table "identities" does not exist, skipping...';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        DROP TABLE IF EXISTS "profiles" CASCADE;
        RAISE NOTICE 'Dropped table: profiles';
    ELSE
        RAISE NOTICE 'Table "profiles" does not exist, skipping...';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sessions') THEN
        DROP TABLE IF EXISTS "sessions" CASCADE;
        RAISE NOTICE 'Dropped table: sessions';
    ELSE
        RAISE NOTICE 'Table "sessions" does not exist, skipping...';
    END IF;
END $$;

-- Step 2: Create new tables with updated names
CREATE TABLE IF NOT EXISTS "user_activities" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid,
    "type" varchar(50) NOT NULL,
    "action" varchar(100) NOT NULL,
    "description" text,
    "metadata" jsonb,
    "ip_address" varchar(45),
    "user_agent" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_identities" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "provider" varchar(50) NOT NULL,
    "provider_id" varchar(255) NOT NULL,
    "password" text,
    "is_verified" boolean DEFAULT false NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "oauth_access_token" text,
    "oauth_refresh_token" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "first_name" varchar(100),
    "last_name" varchar(100),
    "display_name" varchar(255),
    "bio" text,
    "avatar_id" uuid,
    "date_of_birth" date,
    "gender" varchar(50),
    "phone_number" varchar(20),
    "address" text,
    "city" varchar(100),
    "country" varchar(100),
    "postal_code" varchar(20),
    "preferences" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "device_id" uuid NOT NULL,
    "token" text NOT NULL,
    "ip_address" varchar(45),
    "user_agent" text,
    "location" jsonb,
    "is_active" boolean DEFAULT true NOT NULL,
    "last_activity" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "user_sessions_token_unique" UNIQUE("token")
);

-- Step 3: Add Foreign Keys (idempotent)
DO $$ BEGIN
 ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_device_id_devices_id_fk"
    FOREIGN KEY ("device_id") REFERENCES "public"."devices"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Step 4: Create Indexes (idempotent - IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS "idx_activities_user_id" ON "user_activities" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_activities_type" ON "user_activities" USING btree ("type");
CREATE INDEX IF NOT EXISTS "idx_activities_action" ON "user_activities" USING btree ("action");
CREATE INDEX IF NOT EXISTS "idx_activities_user_id_action" ON "user_activities" USING btree ("user_id","action");
CREATE INDEX IF NOT EXISTS "idx_activities_created_at" ON "user_activities" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "idx_identities_user_id" ON "user_identities" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_identities_provider" ON "user_identities" USING btree ("provider");
CREATE INDEX IF NOT EXISTS "idx_identities_provider_id" ON "user_identities" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "idx_identities_is_verified" ON "user_identities" USING btree ("is_verified");
CREATE INDEX IF NOT EXISTS "idx_identities_is_primary" ON "user_identities" USING btree ("is_primary");
CREATE INDEX IF NOT EXISTS "idx_identities_unique_provider" ON "user_identities" USING btree ("user_id","provider","provider_id");

CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "user_profiles" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_avatar_id" ON "user_profiles" USING btree ("avatar_id");

CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "user_sessions" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_device_id" ON "user_sessions" USING btree ("device_id");
CREATE INDEX IF NOT EXISTS "idx_sessions_is_active" ON "user_sessions" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id_active" ON "user_sessions" USING btree ("user_id","is_active");
CREATE INDEX IF NOT EXISTS "idx_sessions_expires_at" ON "user_sessions" USING btree ("expires_at");
