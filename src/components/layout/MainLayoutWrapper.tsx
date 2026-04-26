"use client";

import { useCopilot } from "@/components/copilot/AiCopilotProvider";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isOpen, sidebarWidth } = useCopilot();
    return (
        <div
            className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
            style={{
                paddingRight: isOpen ? `${sidebarWidth}px` : '0px',
            }}
        >
            {children}
        </div>
    );
}
