"use client";

import { FileText, Headphones, Download, Play, Pause } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { StudyResource } from "@/lib/data";

interface FileCardProps {
    resource: StudyResource;
}

export function FileCard({ resource }: FileCardProps) {
    const isPdf = resource.type === "pdf";
    const Icon = isPdf ? FileText : Headphones;
    const [isPlaying, setIsPlaying] = useState(false);

    const handleMainClick = () => {
        if (isPdf && resource.fileUrl) {
            window.open(resource.fileUrl, '_blank');
        } else if (!isPdf && resource.fileUrl) {
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className={cn("group relative p-5 rounded-xl bg-card/40 border border-white/5 hover:bg-card/60 transition-colors flex flex-col gap-4", isPlaying && "border-primary/50 bg-card/80")}>
            <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg flex-shrink-0", isPdf ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400")}>
                    {isPlaying ? <Pause className="w-6 h-6 animate-pulse" /> : <Icon className="w-6 h-6" />}
                </div>

                <div className="flex-grow min-w-0">
                    <h4
                        className={cn("text-base font-semibold truncate pr-2 transition-colors cursor-pointer", isPdf ? "group-hover:text-primary hover:underline" : "")}
                        onClick={handleMainClick}
                    >
                        {resource.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="bg-white/5 py-0.5 px-2 rounded">{resource.chapter}</span>
                        <span>{isPdf ? `${resource.pages} pages` : resource.duration}</span>
                        <span>•</span>
                        <span>{resource.size}</span>
                    </div>
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-white/10"
                        onClick={handleMainClick}
                    >
                        {isPdf ? <Download className="w-4 h-4" /> : (isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />)}
                    </Button>
                </div>
            </div>

            {isPlaying && !isPdf && resource.fileUrl && (
                <div className="w-full mt-2 animate-in fade-in slide-in-from-top-2">
                    <audio controls autoPlay className="w-full h-8" src={resource.fileUrl}>
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
}
