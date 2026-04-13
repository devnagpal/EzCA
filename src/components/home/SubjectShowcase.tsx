"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { subjects } from "@/lib/data";
import { SubjectCard } from "@/components/home/SubjectCard";
import { motion } from "framer-motion";

export function SubjectShowcase() {
    return (
        <SectionWrapper id="subjects" className="py-24 md:py-32 relative">
            {/* Section background accent */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />
            </div>

            <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/70 mb-4">
                        Explore Subjects
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05, duration: 0.5 }}
                    className="text-3xl md:text-5xl font-bold mb-5 tracking-tight"
                >
                    Choose Your Subject
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-base md:text-lg text-muted-foreground leading-relaxed"
                >
                    Comprehensive resources tailored for CA Foundation students.
                    Select a subject to access notes and audio revisions.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {subjects.map((subject, index) => (
                    <SubjectCard key={subject.slug} subject={subject} index={index} />
                ))}
            </div>
        </SectionWrapper>
    );
}
