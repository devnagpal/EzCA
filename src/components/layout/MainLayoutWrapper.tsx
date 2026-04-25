"use client";

import { useCopilot } from "@/components/copilot/AiCopilotProvider";
import { cn } from "@/lib/utils";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isOpen } = useCopilot();
    return (
        <div className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            isOpen ? "md:pr-[420px] lg:pr-[480px]" : "pr-0"
        )}>
            {children}
        </div>
    );
}
