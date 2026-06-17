"use client";

// ─── Profile & Settings Page ───────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, AlertCircle, User, Bell, Shield, BookOpen } from "lucide-react";
import { subjects } from "@/lib/data";

const EXAM_YEARS = [2025, 2026, 2027, 2028, 2029];

export default function ProfilePage() {
    const { user, profile, updateProfile, isLoading } = useAuth();

    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [examYear, setExamYear] = useState<number | "">("");
    const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
    const [studyGoal, setStudyGoal] = useState(2);

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name ?? "");
            setBio(profile.bio ?? "");
            setExamYear(profile.exam_year ?? "");
            setPreferredSubjects(profile.preferred_subjects ?? []);
            setStudyGoal(profile.study_goal_hours_per_day ?? 2);
        }
    }, [profile]);

    const toggleSubject = (slug: string) => {
        setPreferredSubjects((prev) =>
            prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus("idle");

        const { error } = await updateProfile({
            display_name: displayName.trim() || null,
            bio: bio.trim() || null,
            exam_year: examYear ? Number(examYear) : null,
            preferred_subjects: preferredSubjects,
            study_goal_hours_per_day: studyGoal,
        });

        setIsSaving(false);
        setSaveStatus(error ? "error" : "success");
        if (!error) setTimeout(() => setSaveStatus("idle"), 3000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const initials = (displayName || user?.email?.split("@")[0] || "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-bold text-foreground">Profile &amp; Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your study preferences and account details.
                </p>
            </motion.div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
                {/* Avatar + name */}
                <Section icon={<User className="w-4 h-4 text-primary" />} title="Personal info">
                    <div className="flex items-center gap-4 mb-5">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt={displayName}
                                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent
                                            flex items-center justify-center text-xl font-bold text-white">
                                {initials}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {displayName || user?.email?.split("@")[0]}
                            </p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <AuthFormField
                            label="Display name"
                            id="profile-name"
                            type="text"
                            autoComplete="name"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="profile-bio" className="text-sm font-medium text-foreground/80">
                                Bio <span className="text-muted-foreground/60 font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="profile-bio"
                                rows={2}
                                placeholder="CA Foundation 2026 aspirant..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl text-sm resize-none
                                           bg-white/[0.04] border border-white/[0.08]
                                           text-foreground placeholder:text-muted-foreground/50
                                           outline-none focus:border-primary/60 focus:bg-white/[0.06]
                                           focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                            />
                        </div>
                    </div>
                </Section>

                {/* Study preferences */}
                <Section icon={<BookOpen className="w-4 h-4 text-emerald-400" />} title="Study preferences">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="profile-exam-year" className="text-sm font-medium text-foreground/80">
                                Target exam year
                            </label>
                            <select
                                id="profile-exam-year"
                                value={examYear}
                                onChange={(e) => setExamYear(e.target.value ? Number(e.target.value) : "")}
                                className="w-full px-4 py-2.5 rounded-xl text-sm
                                           bg-white/[0.04] border border-white/[0.08]
                                           text-foreground outline-none cursor-pointer
                                           focus:border-primary/60 focus:ring-2 focus:ring-primary/20
                                           transition-all duration-200"
                            >
                                <option value="">Select year</option>
                                {EXAM_YEARS.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground/80">
                                Preferred subjects
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {subjects.map((s) => {
                                    const selected = preferredSubjects.includes(s.slug);
                                    return (
                                        <button
                                            key={s.slug}
                                            type="button"
                                            onClick={() => toggleSubject(s.slug)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                                selected
                                                    ? "bg-primary text-white"
                                                    : "bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {s.title}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground/80">
                                Daily study goal: <span className="text-primary font-semibold">{studyGoal}h</span>
                            </label>
                            <input
                                id="profile-study-goal"
                                type="range"
                                min={0.5}
                                max={10}
                                step={0.5}
                                value={studyGoal}
                                onChange={(e) => setStudyGoal(Number(e.target.value))}
                                className="w-full accent-primary cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>30 min</span>
                                <span>5h</span>
                                <span>10h</span>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Account info */}
                <Section icon={<Shield className="w-4 h-4 text-blue-400" />} title="Account">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-foreground">Email address</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>
                        <div className="h-px bg-white/[0.06]" />
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-foreground">Password</p>
                                <p className="text-xs text-muted-foreground">
                                    {user?.app_metadata?.provider === "google"
                                        ? "Signed in with Google"
                                        : "Change your password"}
                                </p>
                            </div>
                            {user?.app_metadata?.provider !== "google" && (
                                <a
                                    href="/auth/forgot-password"
                                    className="text-xs text-primary hover:text-primary/80 transition-colors"
                                >
                                    Reset
                                </a>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Save */}
                <div className="flex items-center gap-3">
                    <Button
                        type="submit"
                        id="profile-save-btn"
                        disabled={isSaving}
                        className="rounded-xl px-6"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving…
                            </span>
                        ) : (
                            "Save changes"
                        )}
                    </Button>

                    {saveStatus === "success" && (
                        <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-1.5 text-sm text-emerald-400"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Saved!
                        </motion.span>
                    )}
                    {saveStatus === "error" && (
                        <motion.span
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-1.5 text-sm text-red-400"
                        >
                            <AlertCircle className="w-4 h-4" /> Failed to save
                        </motion.span>
                    )}
                </div>
            </form>
        </div>
    );
}

function Section({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
        >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
                {icon}
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </motion.div>
    );
}
