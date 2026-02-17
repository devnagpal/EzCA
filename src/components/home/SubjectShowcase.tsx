"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { subjects } from "@/lib/data";
import { SubjectCard } from "@/components/home/SubjectCard";
import { motion } from "framer-motion";

export function SubjectShowcase() {
    return (
        <SectionWrapper id="subjects" className="py-24">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-6"
                >
                    Choose Your Subject
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-muted-foreground"
                >
                    Comprehensive resources tailored for CA Foundation students. Select a subject to access notes and audio revisions.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subjects.map((subject, index) => (
                    <SubjectCard key={subject.slug} subject={subject} index={index} />
                ))}
            </div>
        </SectionWrapper>
    );
}
