"use client";

// ─── Bookmarks List ────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Headphones, ExternalLink, Bookmark } from "lucide-react";
import type { Bookmark as BookmarkType } from "@/hooks/useBookmarks";

interface BookmarksListProps {
    bookmarks: BookmarkType[];
    isLoading: boolean;
}

export function BookmarksList({ bookmarks, isLoading }: BookmarksListProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
            </div>
        );
    }

    if (!bookmarks.length) {
        return (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06]
                                flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">No bookmarks yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Save PDFs and audio notes to quickly revisit them.
                    </p>
                </div>
                <Link
                    href="/#subjects"
                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                    Browse subjects →
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {bookmarks.slice(0, 6).map((bookmark, i) => (
                <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                >
                    <a
                        href={bookmark.file_url ?? `/subjects/${bookmark.subject_slug}`}
                        target={bookmark.file_url ? "_blank" : undefined}
                        rel={bookmark.file_url ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl
                                   bg-white/[0.03] border border-white/[0.06]
                                   hover:bg-white/[0.06] hover:border-white/[0.1]
                                   transition-all duration-200 group"
                    >
                        <div className={`p-1.5 rounded-lg ${
                            bookmark.resource_type === "audio"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-primary/10 text-primary"
                        }`}>
                            {bookmark.resource_type === "audio"
                                ? <Headphones className="w-3.5 h-3.5" />
                                : <FileText className="w-3.5 h-3.5" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {bookmark.resource_title}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {bookmark.subject_slug} · {bookmark.resource_type}
                            </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                </motion.div>
            ))}
            {bookmarks.length > 6 && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                    +{bookmarks.length - 6} more saved resources
                </p>
            )}
        </div>
    );
}
