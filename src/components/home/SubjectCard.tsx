"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { subjects } from "@/lib/data";

interface SubjectCardProps {
    subject: typeof subjects[0];
    index: number;
}

export function SubjectCard({ subject, index }: SubjectCardProps) {
    const Icon = subject.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
        >
            <Link href={`/subjects/${subject.slug}`} className="block h-full">
                <div
                    className={cn(
                        "group relative h-full rounded-2xl border border-white/5 p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 glass-card overflow-hidden",
                        subject.gradient
                    )}
                >
                    {/* Glowing border effect on hover */}
                    <div
                        className={cn(
                            "absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300",
                            subject.border
                        )}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className={cn("mb-6 inline-flex p-3 rounded-xl bg-background/40 backdrop-blur-sm self-start")}>
                            <Icon className={cn("w-8 h-8", `text-transparent bg-clip-text bg-gradient-to-br ${subject.color}`)} style={{ color: "var(--color-primary)" }} />
                            {/* Fallback color via style if bg-clip fails or just simpler: text-white/90 */}
                        </div>

                        <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{subject.title}</h3>
                        <p className="text-muted-foreground mb-6 flex-grow">{subject.description}</p>

                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" /> {subject.stats.pdfs}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Headphones className="w-4 h-4" /> {subject.stats.audios}
                                </span>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
