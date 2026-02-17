"use client";

import { useState } from "react";
import { subjects, mockResources } from "@/lib/data";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Tabs } from "@/components/ui/Tabs";
import { FileCard } from "@/components/subject/FileCard";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SubjectPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const subject = subjects.find(s => s.slug === slug);
    const [activeTab, setActiveTab] = useState("pdf");

    if (!subject) {
        return (
            <div className="min-h-screen pt-32 text-center flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Subject Not Found</h1>
                <Link href="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    const resources = mockResources[slug] || [];
    const filteredResources = resources.filter(r => r.type === activeTab);

    return (
        <div className="pt-24 pb-20">
            <SectionWrapper>
                <Link href="/#subjects" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Subjects
                </Link>

                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-4 text-white"
                    >
                        {subject.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl"
                    >
                        {subject.description}
                    </motion.p>
                </div>

                <Tabs
                    tabs={[
                        { id: "pdf", label: "PDF Notes" },
                        { id: "audio", label: "Audio Revisions" }
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {filteredResources.length > 0 ? (
                        filteredResources.map((resource) => (
                            <FileCard key={resource.id} resource={resource} />
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <p>No content available in this section yet.</p>
                            <p className="text-sm mt-2">Check back soon!</p>
                        </div>
                    )}
                </motion.div>
            </SectionWrapper>
        </div>
    );
}
