"use client";

import { motion } from "framer-motion";
import { Sparkles, BookOpen, GraduationCap, FileText } from "lucide-react";
import { getSuggestions } from "@/lib/copilot/subjectContext";
import { useCopilot } from "./AiCopilotProvider";

interface SuggestionPillsProps {
    onSelect: (text: string) => void;
}

export function SuggestionPills({ onSelect }: SuggestionPillsProps) {
    const { subjectContext, pageContext } = useCopilot();
    const suggestions = getSuggestions(subjectContext, pageContext);

    return (
        <div className="flex flex-col gap-2 w-full mt-4">
            {suggestions.map((suggestion, index) => {
                let Icon = Sparkles;
                if (suggestion.toLowerCase().includes('study')) Icon = BookOpen;
                if (suggestion.toLowerCase().includes('quiz')) Icon = GraduationCap;
                if (suggestion.toLowerCase().includes('summarize') || suggestion.toLowerCase().includes('flashcards')) Icon = FileText;

                return (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => onSelect(suggestion)}
                        className="flex items-center gap-3 w-full text-left p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200 group"
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-foreground/80 group-hover:text-foreground">
                            {suggestion}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
