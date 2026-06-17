"use client";

// ─── Progress Hook ─────────────────────────────────────────────────────────
// Reads and updates per-resource learning progress for the current user.

import { useState, useEffect, useCallback } from "react";
import { getBrowserClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProgressRecord {
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
}

export function useProgress(subjectSlug?: string) {
    const { user } = useAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getBrowserClient() as any;
    const [progress, setProgress] = useState<ProgressRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProgress = useCallback(async () => {
        if (!user) { setProgress([]); return; }
        setIsLoading(true);
        let query = supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id);
        if (subjectSlug) {
            query = query.eq("subject_slug", subjectSlug);
        }
        const { data } = await query;
        setProgress(data ?? []);
        setIsLoading(false);
    }, [user, supabase, subjectSlug]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    const getResourceProgress = useCallback(
        (resourceId: string) => progress.find((p) => p.resource_id === resourceId),
        [progress]
    );

    const updateProgress = useCallback(
        async (params: {
            resource_id: string;
            subject_slug: string;
            chapter: string;
            status?: ProgressRecord["status"];
            completion_pct?: number;
        }) => {
            if (!user) return;

            const { error } = await supabase.from("progress").upsert(
                {
                    user_id: user.id,
                    resource_id: params.resource_id,
                    subject_slug: params.subject_slug,
                    chapter: params.chapter,
                    status: params.status ?? "in_progress",
                    completion_pct: params.completion_pct ?? 50,
                    last_accessed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    completed_at:
                        params.status === "completed" ? new Date().toISOString() : null,
                },
                { onConflict: "user_id,subject_slug,resource_id" }
            );

            if (!error) fetchProgress();
        },
        [user, supabase, fetchProgress]
    );

    // Aggregate subject-level completion percentage
    const getSubjectProgress = useCallback(
        (slug: string) => {
            const subjectRecords = progress.filter((p) => p.subject_slug === slug);
            if (!subjectRecords.length) return 0;
            const total = subjectRecords.reduce((sum, r) => sum + r.completion_pct, 0);
            return Math.round(total / subjectRecords.length);
        },
        [progress]
    );

    return { progress, getResourceProgress, updateProgress, getSubjectProgress, isLoading };
}
