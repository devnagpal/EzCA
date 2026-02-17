"use client";

import { FileText, Headphones, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { StudyResource } from "@/lib/data";

interface FileCardProps {
    resource: StudyResource;
}

export function FileCard({ resource }: FileCardProps) {
    const isPdf = resource.type === "pdf";
    const Icon = isPdf ? FileText : Headphones;

    return (
        <div className="group relative p-5 rounded-xl bg-card/40 border border-white/5 hover:bg-card/60 transition-colors flex items-start gap-4">
            <div className={cn("p-3 rounded-lg flex-shrink-0", isPdf ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400")}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-grow min-w-0">
                <h4 className="text-base font-semibold truncate pr-2 group-hover:text-primary transition-colors">{resource.title}</h4>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="bg-white/5 py-0.5 px-2 rounded">{resource.chapter}</span>
                    <span>{isPdf ? `${resource.pages} pages` : resource.duration}</span>
                    <span>•</span>
                    <span>{resource.size}</span>
                </div>
            </div>

            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10">
                    {isPdf ? <Download className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
            </div>
        </div>
    );
}
