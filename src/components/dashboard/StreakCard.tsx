"use client";

// ─── Streak Card ───────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { Flame, Trophy, Calendar } from "lucide-react";
// RevisionStreak defined inline (database.types doesn't exist — types are inline per file)
interface RevisionStreak {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    total_study_days: number;
    updated_at: string;
}

interface StreakCardProps {
    streak: RevisionStreak | null;
}

export function StreakCard({ streak }: StreakCardProps) {
    const current = streak?.current_streak ?? 0;
    const longest = streak?.longest_streak ?? 0;
    const totalDays = streak?.total_study_days ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08]
                       bg-gradient-to-br from-orange-500/10 to-red-500/5 p-5"
        >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        Study Streak
                    </p>
                    <div className="flex items-end gap-2 mt-1">
                        <span className="text-4xl font-bold text-foreground">{current}</span>
                        <span className="text-lg text-muted-foreground mb-1">days</span>
                    </div>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/20">
                    <Flame className="w-6 h-6 text-orange-400" />
                </div>
            </div>

            <div className="flex gap-4">
                <StatChip icon={<Trophy className="w-3.5 h-3.5 text-yellow-400" />} label="Longest" value={`${longest}d`} />
                <StatChip icon={<Calendar className="w-3.5 h-3.5 text-primary" />} label="Total days" value={`${totalDays}d`} />
            </div>

            {current === 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                    Start studying today to begin your streak! 🔥
                </p>
            )}
        </motion.div>
    );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-2.5 py-1.5">
            {icon}
            <span className="text-xs text-muted-foreground">{label}:</span>
            <span className="text-xs font-semibold text-foreground">{value}</span>
        </div>
    );
}
