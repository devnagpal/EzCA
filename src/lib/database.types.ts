// ─── TypeScript Database Types ────────────────────────────────────────────
// Typed representations of our Supabase tables.
// Extend this file as you add new tables.

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    exam_year: number | null;
                    preferred_subjects: string[];
                    study_goal_hours_per_day: number;
                    timezone: string;
                    onboarding_complete: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
                Update: Partial<Database['public']['Tables']['profiles']['Row']>;
            };
            user_settings: {
                Row: {
                    user_id: string;
                    theme: string;
                    copilot_model: string;
                    email_notifications: boolean;
                    revision_reminder_time: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['user_settings']['Row']> & { user_id: string };
                Update: Partial<Database['public']['Tables']['user_settings']['Row']>;
            };
            bookmarks: {
                Row: {
                    id: string;
                    user_id: string;
                    resource_id: string;
                    subject_slug: string;
                    resource_type: 'pdf' | 'audio';
                    resource_title: string;
                    file_url: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['bookmarks']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['bookmarks']['Row']>;
            };
            progress: {
                Row: {
                    id: string;
                    user_id: string;
                    subject_slug: string;
                    chapter: string;
                    resource_id: string | null;
                    status: 'not_started' | 'in_progress' | 'completed';
                    completion_pct: number;
                    last_accessed_at: string;
                    completed_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['progress']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['progress']['Row']>;
            };
            revision_streaks: {
                Row: {
                    user_id: string;
                    current_streak: number;
                    longest_streak: number;
                    last_activity_date: string | null;
                    total_study_days: number;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['revision_streaks']['Row']> & { user_id: string };
                Update: Partial<Database['public']['Tables']['revision_streaks']['Row']>;
            };
            conversations: {
                Row: {
                    id: string;
                    user_id: string | null;
                    title: string;
                    pinned: boolean;
                    subject_slug: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['conversations']['Row']>;
                Update: Partial<Database['public']['Tables']['conversations']['Row']>;
            };
            messages: {
                Row: {
                    id: string;
                    conversation_id: string;
                    user_id: string | null;
                    role: 'user' | 'assistant' | 'system';
                    content: string;
                    intent: string | null;
                    tool_result: Json | null;
                    sources: Json | null;
                    created_at: string;
                };
                Insert: Partial<Database['public']['Tables']['messages']['Row']> & {
                    id: string;
                    conversation_id: string;
                    role: 'user' | 'assistant' | 'system';
                };
                Update: Partial<Database['public']['Tables']['messages']['Row']>;
            };
            subscriptions: {
                Row: {
                    user_id: string;
                    plan: 'free' | 'pro' | 'team';
                    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
                    current_period_end: string | null;
                    stripe_customer_id: string | null;
                    stripe_subscription_id: string | null;
                    razorpay_subscription_id: string | null;
                    trial_ends_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & { user_id: string };
                Update: Partial<Database['public']['Tables']['subscriptions']['Row']>;
            };
        };
        Functions: {
            match_document_chunks: {
                Args: {
                    query_embedding: number[];
                    match_threshold?: number;
                    match_count?: number;
                    filter_subject?: string;
                    filter_resource?: string;
                };
                Returns: Array<{
                    id: string;
                    resource_id: string;
                    subject_slug: string;
                    type: string;
                    title: string;
                    chapter: string | null;
                    chunk_index: number;
                    content: string;
                    page_range: string | null;
                    file_name: string;
                    metadata: Json;
                    similarity: number;
                }>;
            };
        };
    };
}

// ─── Convenience types ────────────────────────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];
export type ProgressRecord = Database['public']['Tables']['progress']['Row'];
export type RevisionStreak = Database['public']['Tables']['revision_streaks']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
