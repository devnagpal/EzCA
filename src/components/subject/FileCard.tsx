"use client";

import { FileText, Headphones, Download, Play, Pause } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { StudyResource } from "@/lib/data";
import { useCopilot } from "@/components/copilot/AiCopilotProvider";

interface FileCardProps {
    resource: StudyResource;
    index?: number;
}

export function FileCard({ resource, index = 0 }: FileCardProps) {
    const isPdf = resource.type === "pdf";
    const Icon = isPdf ? FileText : Headphones;
    const [isPlaying, setIsPlaying] = useState(false);
    const { setPageContext, pageContext } = useCopilot();

    const handleMainClick = () => {
        if (isPdf && resource.fileUrl) {
            // Set active resource context so Copilot knows what the user is viewing
            setPageContext({
                ...pageContext,
                activeResource: {
                    id: resource.id,
                    title: resource.title,
                    type: resource.type,
                    chapter: resource.chapter,
                    fileUrl: resource.fileUrl,
                },
            });
            window.open(resource.fileUrl, '_blank');
        } else if (!isPdf && resource.fileUrl) {
            const newPlaying = !isPlaying;
            setIsPlaying(newPlaying);

            // Set/clear active resource context for audio
            if (newPlaying) {
                setPageContext({
                    ...pageContext,
                    activeResource: {
                        id: resource.id,
                        title: resource.title,
                        type: resource.type,
                        chapter: resource.chapter,
                        fileUrl: resource.fileUrl,
                    },
                });
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <div className={cn(
                "group relative p-5 rounded-xl transition-all duration-200 flex flex-col gap-3",
                "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]",
                isPlaying && "border-primary/30 bg-primary/[0.03]"
            )}>
                {/* Left accent bar on active */}
                {isPlaying && (
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-primary to-accent rounded-full origin-top"
                    />
                )}

                <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={cn(
                        "p-2.5 rounded-xl flex-shrink-0 transition-colors duration-200",
                        isPdf
                            ? "bg-blue-500/[0.08] text-blue-400 group-hover:bg-blue-500/[0.12]"
                            : "bg-purple-500/[0.08] text-purple-400 group-hover:bg-purple-500/[0.12]"
                    )}>
                        {isPlaying
                            ? <Pause className="w-5 h-5" />
                            : <Icon className="w-5 h-5" />
                        }
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                        <h4
                            className={cn(
                                "text-sm font-semibold leading-snug pr-2 transition-colors cursor-pointer line-clamp-2",
                                isPdf ? "hover:text-primary" : ""
                            )}
                            onClick={handleMainClick}
                        >
                            {resource.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground/70 mt-2">
                            <span className="bg-white/[0.04] py-0.5 px-2 rounded-md">{resource.chapter}</span>
                            <span>{isPdf ? `${resource.pages} pages` : resource.duration}</span>
                            <span className="text-white/10">•</span>
                            <span>{resource.size}</span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white/[0.06]"
                            onClick={handleMainClick}
                        >
                            {isPdf
                                ? <Download className="w-3.5 h-3.5" />
                                : (isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />)
                            }
                        </Button>
                    </div>
                </div>

                {/* Audio Player */}
                {isPlaying && !isPdf && resource.fileUrl && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full pt-1"
                    >
                        <div className="rounded-lg bg-black/30 p-2">
                            <audio controls autoPlay className="w-full h-8 opacity-80" src={resource.fileUrl}>
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
