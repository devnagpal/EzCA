"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
    return (
        <div className="flex space-x-1 rounded-xl bg-white/5 p-1 mb-8 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "relative px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2",
                        activeTab === tab.id ? "text-white" : "text-muted-foreground hover:text-white"
                    )}
                    style={{
                        WebkitTapHighlightColor: "transparent",
                    }}
                >
                    {activeTab === tab.id && (
                        <motion.span
                            layoutId="bubble"
                            className="absolute inset-0 z-10 bg-primary shadow-lg shadow-primary/20 rounded-lg mix-blend-screen"
                            style={{ borderRadius: 8 }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-20 mix-blend-plus-lighter">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
