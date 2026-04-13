"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
    tabs: { id: string; label: string; count?: number }[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div className="flex gap-1 rounded-xl bg-white/[0.03] border border-white/[0.04] p-1 mb-8 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "relative px-5 md:px-6 py-2.5 text-sm font-medium transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                    }}
                >
                    {activeTab === tab.id && (
                        <motion.span
                            layoutId="active-tab"
                            className="absolute inset-0 z-10 bg-primary/90 shadow-lg shadow-primary/20 rounded-lg"
                            style={{ borderRadius: 8 }}
                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-20 flex items-center gap-2">
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-colors",
                                activeTab === tab.id
                                    ? "bg-white/20 text-white"
                                    : "bg-white/[0.05] text-muted-foreground"
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
}
