"use client";

// ─── User Dashboard ────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Sparkles, BookOpen, Settings, ArrowRight, GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useProgress } from "@/hooks/useProgress";
import { useCopilot } from "@/components/copilot/AiCopilotProvider";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { SubjectProgressCard } from "@/components/dashboard/SubjectProgressCard";
import { BookmarksList } from "@/components/dashboard/BookmarksList";
import { RecentConversations } from "@/components/dashboard/RecentConversations";
import { Button } from "@/components/ui/Button";
import { getBrowserClient } from "@/lib/supabase-client";
import { subjects, mockResources } from "@/lib/data";

interface RevisionStreak {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    total_study_days: number;
    updated_at: string;
}

export default function DashboardPage() {
    const { user, profile, isLoading } = useAuth();
    const { bookmarks, isLoading: bookmarksLoading } = useBookmarks();
    const { getSubjectProgress } = useProgress();
    const { openCopilot } = useCopilot();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = getBrowserClient() as any;

    const [streak, setStreak] = useState<RevisionStreak | null>(null);
    const [greeting, setGreeting] = useState("Good morning");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
        else if (hour >= 17) setGreeting("Good evening");
    }, []);

    useEffect(() => {
        if (!user) return;
        supabase
            .from("revision_streaks")
            .select("*")
            .eq("user_id", user.id)
            .single()
            .then(({ data }: { data: RevisionStreak | null }) => setStreak(data));
    }, [user, supabase]);

    const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "there";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
            {/* Welcome banner */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between mb-8"
            >
                <div>
                    <p className="text-sm text-muted-foreground">{greeting} 👋</p>
                    <h1 className="text-3xl font-bold text-foreground mt-1">
                        {displayName}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Ready to ace your CA exams?
                    </p>
                </div>
                <Link href="/profile">
                    <button
                        id="dashboard-settings-btn"
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]
                                   hover:bg-white/[0.08] transition-colors"
                        aria-label="Profile settings"
                    >
                        <Settings className="w-5 h-5 text-muted-foreground" />
                    </button>
                </Link>
            </motion.div>

            {/* Quick actions */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
            >
                <QuickAction
                    icon={<Sparkles className="w-5 h-5 text-primary" />}
                    label="Open Copilot"
                    description="Ask the AI anything"
                    color="from-primary/15 to-accent/5"
                    onClick={openCopilot}
                    id="dashboard-open-copilot"
                />
                <Link href="/#subjects" className="block">
                    <QuickAction
                        icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
                        label="Browse Subjects"
                        description="Study PDFs & audio"
                        color="from-emerald-500/15 to-teal-500/5"
                        id="dashboard-browse-subjects"
                    />
                </Link>
                <Link href="/profile" className="block">
                    <QuickAction
                        icon={<GraduationCap className="w-5 h-5 text-yellow-400" />}
                        label="Study Goals"
                        description="Set your targets"
                        color="from-yellow-500/15 to-orange-500/5"
                        id="dashboard-study-goals"
                    />
                </Link>
            </motion.div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column — streak + subject progress */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Streak */}
                    <StreakCard streak={streak} />

                    {/* Subject progress */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold text-foreground">Study Progress</h2>
                            <Link
                                href="/#subjects"
                                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                                All subjects <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {subjects.map((subject, i) => {
                                const resources = mockResources[subject.slug] ?? [];
                                const progressPct = getSubjectProgress(subject.slug);
                                const completedCount = Math.round((progressPct / 100) * resources.length);

                                return (
                                    <SubjectProgressCard
                                        key={subject.slug}
                                        subject={subject}
                                        progressPct={progressPct}
                                        resourceCount={resources.length}
                                        completedCount={completedCount}
                                        index={i}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right column — bookmarks + recent chats */}
                <div className="flex flex-col gap-6">
                    {/* Saved resources */}
                    <DashCard
                        title="Saved Resources"
                        action={{ label: "Browse all", href: "/#subjects" }}
                    >
                        <BookmarksList bookmarks={bookmarks} isLoading={bookmarksLoading} />
                    </DashCard>

                    {/* Recent AI conversations */}
                    <DashCard
                        title="Recent Conversations"
                        action={{ label: "Open Copilot", onClick: openCopilot }}
                    >
                        <RecentConversations />
                    </DashCard>
                </div>
            </div>
        </div>
    );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function QuickAction({
    icon,
    label,
    description,
    color,
    onClick,
    id,
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    onClick?: () => void;
    id?: string;
}) {
    return (
        <button
            id={id}
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border border-white/[0.08]
                        bg-gradient-to-br ${color} hover:border-white/[0.15] hover:bg-opacity-80
                        transition-all duration-200 text-left`}
        >
            <div className="p-2 rounded-xl bg-white/[0.06] shrink-0">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </button>
    );
}

function DashCard({
    title,
    children,
    action,
}: {
    title: string;
    children: React.ReactNode;
    action?: { label: string; href?: string; onClick?: () => void };
}) {
    return (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                {action && (
                    action.href ? (
                        <Link
                            href={action.href}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            {action.label} <ArrowRight className="w-3 h-3" />
                        </Link>
                    ) : (
                        <button
                            onClick={action.onClick}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            {action.label} <ArrowRight className="w-3 h-3" />
                        </button>
                    )
                )}
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}
