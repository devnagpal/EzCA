"use client";

import { useState, useEffect } from "react";
import { subjects, mockResources } from "@/lib/data";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Tabs } from "@/components/ui/Tabs";
import { FileCard } from "@/components/subject/FileCard";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Headphones, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCopilot } from "@/components/copilot/AiCopilotProvider";

export default function SubjectPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const subject = subjects.find(s => s.slug === slug);
    const [activeTab, setActiveTab] = useState("pdf");
    const { setPageContext } = useCopilot();

    // Pass subject + tab context to the Copilot
    useEffect(() => {
        if (subject) {
            setPageContext({
                subjectSlug: slug,
                activeTab: activeTab as 'pdf' | 'audio',
            });
        }
        return () => {
            setPageContext(null);
        };
    }, [slug, activeTab, subject, setPageContext]);

    if (!subject) {
        return (
            <div className="min-h-screen pt-32 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-2">
                    <FolderOpen className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h1 className="text-2xl font-bold">Subject Not Found</h1>
                <p className="text-muted-foreground text-sm">The subject you're looking for doesn't exist.</p>
                <Link href="/" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">Return Home</Link>
            </div>
        );
    }

    const resources = mockResources[slug] || [];
    const pdfCount = resources.filter(r => r.type === "pdf").length;
    const audioCount = resources.filter(r => r.type === "audio").length;
    const filteredResources = resources.filter(r => r.type === activeTab);

    const Icon = subject.icon;

    return (
        <div className="pt-24 pb-20 relative">
            {/* Page header ambient glow */}
            <div className="absolute top-0 left-0 right-0 h-80 pointer-events-none -z-10">
                <div className={cn(
                    "absolute top-0 left-1/4 w-96 h-64 rounded-full blur-[120px] opacity-10",
                    `bg-gradient-to-br ${subject.color}`
                )} />
            </div>

            <SectionWrapper>
                {/* Back navigation */}
                <Link
                    href="/#subjects"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10 transition-colors group py-1.5 px-3 -ml-3 rounded-lg hover:bg-white/[0.03]"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Subjects
                </Link>

                {/* Page header */}
                <div className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4 mb-4"
                    >
                        <div className={cn(
                            "p-3 rounded-xl flex-shrink-0",
                            "bg-gradient-to-br",
                            subject.color,
                            "opacity-15"
                        )}
                            style={{ position: 'relative' }}
                        >
                            <Icon className="w-7 h-7"
                                style={{
                                    color: subject.color.includes('blue') ? '#60a5fa'
                                        : subject.color.includes('emerald') ? '#34d399'
                                            : subject.color.includes('orange') ? '#fb923c'
                                                : '#c084fc'
                                }}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                                {subject.title}
                            </h1>
                            <p className="text-base md:text-lg text-muted-foreground mt-2 max-w-2xl">
                                {subject.description}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Tabs with counts */}
                <Tabs
                    tabs={[
                        { id: "pdf", label: "PDF Notes", count: pdfCount },
                        { id: "audio", label: "Audio Revisions", count: audioCount }
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                {/* Resource grid */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                    {filteredResources.length > 0 ? (
                        filteredResources.map((resource, i) => (
                            <FileCard key={resource.id} resource={resource} index={i} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06]">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                                {activeTab === "pdf"
                                    ? <FileText className="w-7 h-7 text-muted-foreground/40" />
                                    : <Headphones className="w-7 h-7 text-muted-foreground/40" />
                                }
                            </div>
                            <p className="text-muted-foreground font-medium">No {activeTab === "pdf" ? "PDF notes" : "audio revisions"} available yet.</p>
                            <p className="text-sm text-muted-foreground/60 mt-1.5">New content is added regularly. Check back soon!</p>
                        </div>
                    )}
                </motion.div>
            </SectionWrapper>
        </div>
    );
}
