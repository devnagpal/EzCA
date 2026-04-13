"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { motion } from "framer-motion";
import { Target, Heart, Users } from "lucide-react";

const sections = [
    {
        icon: Target,
        title: "Our Mission",
        content: "At EzCA, Our goal is simple: provide quick, clean, exam-focused material that actually helps during revision time. No unnecessary fluff, no time waste — just the important questions, one-shot revisions, and notes you really need before exams.",
    },
    {
        icon: Heart,
        title: "Why Choose Us?",
        content: "We created EzCA after seeing how most students struggle not because they lack ability, but because they don't have the right revision support at the right time. This platform is our attempt to make CA Foundation prep more focused, efficient, and less stressful.",
    },
    {
        icon: Users,
        title: "The Team",
        content: "We're continuously improving and adding new material. If EzCA makes your preparation even a little easier, we're doing something right.",
        signature: "— Saksham & Dev",
    },
];

export default function AboutPage() {
    return (
        <div className="pt-24 pb-20 min-h-screen relative">
            {/* Ambient background */}
            <div className="absolute top-0 left-1/3 w-96 h-64 bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />

            <SectionWrapper>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/70 mb-4">
                            About
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">About EzCA</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            EzCA is built by students, for students — because we know CA prep can get overwhelming real fast. Empowering CA students with premium, high-quality study resources.
                        </p>
                    </motion.div>

                    {/* Content cards */}
                    <div className="space-y-6">
                        {sections.map((section, i) => {
                            const Icon = section.icon;
                            return (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                                    className="group p-8 rounded-2xl glass-card hover:bg-white/[0.03] transition-colors duration-300"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-11 h-11 rounded-xl bg-primary/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                                            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                                            {section.signature && (
                                                <p className="text-primary/80 font-medium mt-4 text-sm">{section.signature}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
