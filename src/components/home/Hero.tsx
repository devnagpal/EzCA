"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles, Files, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 12,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 14,
            delay: 0.5 + i * 0.12,
        },
    }),
};

const featureCards = [
    {
        icon: Files,
        title: "Concise PDFs",
        description: "High-yield notes focused on exam scoring.",
        color: "text-primary",
        glow: "from-primary/10 to-primary/5",
    },
    {
        icon: Headphones,
        title: "Audio Pockets",
        description: "Revise entire chapters in 15 mins.",
        color: "text-accent",
        glow: "from-accent/10 to-accent/5",
    },
    {
        icon: Sparkles,
        title: "AI Solves Doubts",
        description: "Instant answers for tricky concepts.",
        color: "text-purple-400",
        glow: "from-purple-500/10 to-purple-500/5",
        badge: "Soon",
    },
];

export function Hero() {
    return (
        <div className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
            {/* Ambient background orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-[-1]">
                <div className="absolute top-[5%] left-[15%] w-80 h-80 bg-primary/15 rounded-full blur-[120px] animate-ambient" />
                <div className="absolute top-[20%] right-[15%] w-96 h-96 bg-accent/12 rounded-full blur-[140px] animate-ambient-slow" />
                <div className="absolute top-[50%] left-[40%] w-64 h-64 bg-purple-500/8 rounded-full blur-[100px] animate-ambient" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    {/* Badge */}
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/[0.08] border border-accent/15 mb-8 shimmer"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-medium text-accent tracking-wide">AI Study Copilot Coming Soon</span>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                    >
                        <span className="text-gradient-subtle">Master the CA Curriculum.</span>
                        <br />
                        <span className="text-gradient">Smarter, Faster.</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={itemVariants}
                        className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl leading-relaxed"
                    >
                        Premium curated study materials for aspiring Chartered Accountants.
                        Access high-yield PDF notes and audio revisions designed for rapid retention.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Link href="#subjects">
                            <Button size="lg" className="w-full sm:w-auto group">
                                Start Learning
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                View Features
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Feature Preview Cards */}
                    <div className="mt-20 md:mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
                        {featureCards.map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={card.title}
                                    custom={i}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="relative p-6 rounded-2xl glass-card group cursor-default"
                                >
                                    {/* Hover glow */}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <Icon className={`w-6 h-6 ${card.color}`} />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                                            {card.badge && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/80">{card.badge}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
