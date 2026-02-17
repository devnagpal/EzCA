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
            staggerChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10,
        },
    },
};

export function Hero() {
    return (
        <div className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-[-1]">
                <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-[30%] right-[20%] w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto flex flex-col items-center"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-8 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                        <span className="text-sm font-medium text-accent">AI Study Copilot Coming Soon</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Master the CA Curriculum. <br /> <span className="text-gradient">Smarter, Faster.</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
                        Premium curated study materials for aspiring Chartered Accountants. Access high-yield PDF notes and audio revisions designed for rapid retention.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link href="#subjects">
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                                Start Learning <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-white/5 border-white/10 hover:bg-white/10">
                            View Features
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                    >
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center">
                            <Files className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Concise PDFs</h3>
                            <p className="text-sm text-muted-foreground">High-yield notes focused on exam scoring.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center">
                            <Headphones className="w-10 h-10 text-accent mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Audio Pockets</h3>
                            <p className="text-sm text-muted-foreground">Revise entire chapters in 15 mins.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Sparkles className="w-10 h-10 text-indigo-400 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">AI Solves Doubts</h3>
                            <p className="text-sm text-muted-foreground">Instant answers for tricky concepts (Soon).</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
