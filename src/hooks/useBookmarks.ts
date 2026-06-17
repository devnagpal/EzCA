"use client";

// ─── Bookmarks Hook ────────────────────────────────────────────────────────
// Manages the current user's bookmarked study resources.
// Hydrates on mount. Provides toggle (add/remove) and list.

import { useState, useEffect, useCallback } from "react";
import { getBrowserClient } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";

export interface Bookmark {
    id: string;
    user_id: string;
    resource_id: string;
    subject_slug: string;
    resource_type: 'pdf' | 'audio';
    resource_title: string;
    file_url: string | null;
    created_at: string;
}

export function useBookmarks() {
    const { user, isAuthenticated } = useAuth();
    // Cast to any to bypass strict DB generic typing for tables not in the generated schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getBrowserClient() as any;
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBookmarks = useCallback(async () => {
        if (!user) { setBookmarks([]); return; }
        setIsLoading(true);
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        setBookmarks((data as Bookmark[]) ?? []);
        setIsLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    const isBookmarked = useCallback(
        (resourceId: string) => bookmarks.some((b) => b.resource_id === resourceId),
        [bookmarks]
    );

    const toggleBookmark = useCallback(
        async (resource: {
            resource_id: string;
            subject_slug: string;
            resource_type: "pdf" | "audio";
            resource_title: string;
            file_url?: string | null;
        }) => {
            if (!user || !isAuthenticated) return { error: new Error("Not authenticated") };

            const existing = bookmarks.find((b) => b.resource_id === resource.resource_id);

            if (existing) {
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .eq("id", existing.id);
                if (!error) {
                    setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
                }
                return { error };
            } else {
                const { data, error } = await supabase
                    .from("bookmarks")
                    .insert({ user_id: user.id, ...resource })
                    .select()
                    .single();
                if (!error && data) {
                    setBookmarks((prev) => [data as Bookmark, ...prev]);
                }
                return { error };
            }
        },
        [user, isAuthenticated, bookmarks, supabase]
    );

    return { bookmarks, isBookmarked, toggleBookmark, isLoading, refetch: fetchBookmarks };
}
