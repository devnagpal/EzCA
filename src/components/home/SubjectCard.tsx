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
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 80 }}
            viewport={{ once: true, margin: "-40px" }}
        >
            <Link href={`/subjects/${subject.slug}`} className="block h-full">
                <div
                    className={cn(
                        "group relative h-full rounded-2xl p-6 md:p-8 transition-all duration-300",
                        "glass-card hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden",
                        subject.gradient
                    )}
                >
                    {/* Gradient border overlay on hover */}
                    <div
                        className={cn(
                            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                            `bg-gradient-to-br ${subject.color}`
                        )}
                        style={{ padding: '1px', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude', WebkitMaskComposite: 'xor', opacity: 0 }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                        {/* Icon */}
                        <div className={cn(
                            "mb-6 inline-flex p-3.5 rounded-xl self-start transition-all duration-300",
                            "bg-gradient-to-br",
                            subject.color,
                            "opacity-15 group-hover:opacity-25"
                        )}
                            style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', width: '3.25rem', height: '3.25rem' }}
                        />
                        <div className="mb-6 inline-flex p-3.5 rounded-xl self-start relative z-10">
                            <Icon className={cn("w-7 h-7 transition-transform duration-300 group-hover:scale-110")}
                                style={{
                                    color: subject.color.includes('blue') ? '#60a5fa'
                                        : subject.color.includes('emerald') ? '#34d399'
                                            : subject.color.includes('orange') ? '#fb923c'
                                                : '#c084fc'
                                }}
                            />
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground group-hover:text-white transition-colors duration-200">
                            {subject.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow leading-relaxed">
                            {subject.description}
                        </p>

                        {/* Stats & Arrow */}
                        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/[0.04]">
                            <div className="flex gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 opacity-60" /> {subject.stats.pdfs} PDFs
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Headphones className="w-3.5 h-3.5 opacity-60" /> {subject.stats.audios} Audio
                                </span>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300">
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
