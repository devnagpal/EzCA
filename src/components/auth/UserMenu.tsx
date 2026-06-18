"use client";

// ─── User Menu (Navbar dropdown) ───────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
    const { user, profile, signOut } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
        // Refresh RSC cache BEFORE navigating so the homepage layout
        // renders with the correct (unauthenticated) server state
        router.refresh();
        router.push("/");
    };

    const displayName = profile?.display_name ?? user?.email?.split("@")[0] ?? "User";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div ref={menuRef} className="relative">
            {/* Avatar trigger */}
            <button
                id="user-menu-trigger"
                onClick={() => setIsOpen((p) => !p)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
                        {initials}
                    </div>
                )}
                <ChevronDown
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        role="menu"
                        aria-label="User menu"
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-56 z-[60]
                                   bg-[#0f0f14]/95 backdrop-blur-xl
                                   border border-white/[0.08] rounded-2xl shadow-2xl
                                   overflow-hidden"
                    >
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {user?.email}
                            </p>
                        </div>

                        {/* Menu items */}
                        <nav className="p-1.5 flex flex-col gap-0.5">
                            <MenuLink
                                href="/dashboard"
                                icon={<LayoutDashboard className="w-4 h-4" />}
                                label="Dashboard"
                                onClick={() => setIsOpen(false)}
                            />
                            <MenuLink
                                href="/profile"
                                icon={<User className="w-4 h-4" />}
                                label="Profile"
                                onClick={() => setIsOpen(false)}
                            />
                            <MenuLink
                                href="/profile#settings"
                                icon={<Settings className="w-4 h-4" />}
                                label="Settings"
                                onClick={() => setIsOpen(false)}
                            />
                        </nav>

                        <div className="p-1.5 border-t border-white/[0.06]">
                            <button
                                id="sign-out-btn"
                                role="menuitem"
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                           text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MenuLink({
    href,
    icon,
    label,
    onClick,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            onClick={onClick}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                       text-muted-foreground hover:text-foreground hover:bg-white/[0.04]
                       transition-colors"
        >
            {icon}
            {label}
        </Link>
    );
}
