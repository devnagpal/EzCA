-- ═══════════════════════════════════════════════════════════════════════
-- EzCA — Auth & User Identity Schema Migration
-- Run AFTER the base supabase_schema.sql (which creates conversations,
-- messages, document_chunks, usage_logs, and the match_document_chunks fn).
--
-- Paste this into Supabase → SQL Editor → New Query and click Run.
-- ═══════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════
-- 1. USER PROFILES
--    Auto-populated via trigger on auth.users INSERT.
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists profiles (
    id              uuid primary key references auth.users(id) on delete cascade,
    display_name    text,
    avatar_url      text,
    bio             text,
    exam_year       int,
    preferred_subjects text[] default '{}',
    study_goal_hours_per_day int default 2,
    timezone        text default 'Asia/Kolkata',
    onboarding_complete boolean default false,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 2. USER SETTINGS
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists user_settings (
    user_id         uuid primary key references auth.users(id) on delete cascade,
    theme           text default 'dark',
    copilot_model   text default 'claude-3-haiku-20240307',
    email_notifications boolean default true,
    revision_reminder_time time,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 3. BOOKMARKS (saved study resources)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists bookmarks (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    resource_id     text not null,          -- e.g. 'l1', 'e2' from data.ts
    subject_slug    text not null,          -- e.g. 'laws'
    resource_type   text not null check (resource_type in ('pdf', 'audio')),
    resource_title  text not null,
    file_url        text,
    created_at      timestamptz default now(),
    unique (user_id, resource_id)
);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. PROGRESS TRACKING (per resource/chapter)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists progress (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    subject_slug    text not null,
    chapter         text not null,
    resource_id     text,                   -- null = chapter-level progress
    status          text default 'not_started'
                        check (status in ('not_started', 'in_progress', 'completed')),
    completion_pct  int default 0 check (completion_pct between 0 and 100),
    last_accessed_at timestamptz default now(),
    completed_at    timestamptz,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now(),
    unique (user_id, subject_slug, resource_id)
);

-- ═══════════════════════════════════════════════════════════════════════
-- 5. REVISION STREAKS
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists revision_streaks (
    user_id             uuid primary key references auth.users(id) on delete cascade,
    current_streak      int default 0,
    longest_streak      int default 0,
    last_activity_date  date,
    total_study_days    int default 0,
    updated_at          timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 6. QUIZ HISTORY (future feature — schema ready now)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists quiz_history (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    subject_slug    text,
    chapter         text,
    score           int,
    total_questions int,
    time_taken_sec  int,
    answers         jsonb default '[]',
    created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 7. FLASHCARD DECKS & CARDS (future feature)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists flashcard_decks (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    title           text not null,
    subject_slug    text,
    card_count      int default 0,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

create table if not exists flashcards (
    id              uuid primary key default gen_random_uuid(),
    deck_id         uuid not null references flashcard_decks(id) on delete cascade,
    user_id         uuid not null references auth.users(id) on delete cascade,
    front           text not null,
    back            text not null,
    difficulty      text default 'medium' check (difficulty in ('easy','medium','hard')),
    next_review_at  timestamptz default now(),
    review_count    int default 0,
    ease_factor     float default 2.5,      -- for spaced repetition (SM-2)
    created_at      timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 8. ACHIEVEMENTS / BADGES (future feature)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists achievements (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references auth.users(id) on delete cascade,
    badge_key       text not null,   -- e.g. 'first_chat','streak_7','laws_complete'
    badge_label     text,
    unlocked_at     timestamptz default now(),
    unique (user_id, badge_key)
);

-- ═══════════════════════════════════════════════════════════════════════
-- 9. SUBSCRIPTIONS (future Stripe/Razorpay)
-- ═══════════════════════════════════════════════════════════════════════

create table if not exists subscriptions (
    user_id                 uuid primary key references auth.users(id) on delete cascade,
    plan                    text default 'free'
                                check (plan in ('free','pro','team')),
    status                  text default 'active'
                                check (status in ('active','cancelled','past_due','trialing')),
    current_period_end      timestamptz,
    stripe_customer_id      text,
    stripe_subscription_id  text,
    razorpay_subscription_id text,
    trial_ends_at           timestamptz,
    created_at              timestamptz default now(),
    updated_at              timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- 10. ADD user_id TO EXISTING TABLES
--     Migration: existing rows will have user_id = NULL (orphaned).
--     See MIGRATION GUIDE below for cleanup options.
-- ═══════════════════════════════════════════════════════════════════════

alter table conversations
    add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table messages
    add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table usage_logs
    add column if not exists user_id uuid references auth.users(id) on delete set null;

-- ═══════════════════════════════════════════════════════════════════════
-- 11. INDEXES
-- ═══════════════════════════════════════════════════════════════════════

create index if not exists bookmarks_user_idx       on bookmarks(user_id);
create index if not exists progress_user_idx        on progress(user_id);
create index if not exists conversations_user_idx   on conversations(user_id);
create index if not exists messages_user_idx        on messages(user_id);
create index if not exists quiz_history_user_idx    on quiz_history(user_id);
create index if not exists flashcards_deck_idx      on flashcards(deck_id);

-- ═══════════════════════════════════════════════════════════════════════
-- 12. AUTO-CREATE PROFILE ON SIGNUP (Database trigger)
--     Fires when a new user is inserted into auth.users.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into profiles (id, display_name, avatar_url)
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        ),
        new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do nothing;

    insert into user_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    insert into revision_streaks (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    insert into subscriptions (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════
-- 13. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════

alter table profiles          enable row level security;
alter table user_settings     enable row level security;
alter table bookmarks         enable row level security;
alter table progress          enable row level security;
alter table revision_streaks  enable row level security;
alter table quiz_history      enable row level security;
alter table flashcard_decks   enable row level security;
alter table flashcards        enable row level security;
alter table achievements      enable row level security;
alter table subscriptions     enable row level security;

-- Profiles
create policy "profiles_own" on profiles
    for all using (auth.uid() = id) with check (auth.uid() = id);

-- User settings
create policy "settings_own" on user_settings
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bookmarks
create policy "bookmarks_own" on bookmarks
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Progress
create policy "progress_own" on progress
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Streaks
create policy "streaks_own" on revision_streaks
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quiz history
create policy "quiz_own" on quiz_history
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Flashcard decks
create policy "decks_own" on flashcard_decks
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Flashcards
create policy "flashcards_own" on flashcards
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Achievements
create policy "achievements_own" on achievements
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscriptions
create policy "subscriptions_own" on subscriptions
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Update conversations & messages RLS to be user-scoped ──────────────

-- Drop the old "allow all" policies
drop policy if exists "Allow all on conversations" on conversations;
drop policy if exists "Allow all on messages"      on messages;
drop policy if exists "Allow all on usage_logs"    on usage_logs;

-- New user-scoped policies
create policy "conversations_own" on conversations
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "messages_own" on messages
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Document chunks: remain public (RAG knowledge base — no user data)
-- The existing "Allow all on document_chunks" policy is kept unchanged.

create policy "usage_logs_own" on usage_logs
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);