"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Subjects", href: "/#subjects" },
    { name: "Features", href: "/#features" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
                    scrolled
                        ? "bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-white/[0.06] shadow-[0_1px_40px_-10px_rgba(0,0,0,0.5)]"
                        : "bg-transparent border-transparent"
                )}
            >
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20 transition-all duration-300 overflow-hidden">
                            <BookOpen className="w-4.5 h-4.5 text-primary relative z-10" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Ez<span className="text-gradient">CA</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-white/[0.04]",
                                    pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.name}
                                {pathname === link.href && (
                                    <motion.span
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/[0.08] border border-accent/15 shimmer">
                            <Sparkles className="w-3 h-3 text-accent/80" />
                            <span className="text-[11px] font-medium text-accent/80 tracking-wide uppercase">AI Soon</span>
                        </div>
                        <Link href="/#subjects">
                            <Button size="sm" className="rounded-full px-5 h-8 text-xs">
                                Start Learning
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-background/98 backdrop-blur-2xl pt-20 px-6 md:hidden"
                    >
                        <nav className="flex flex-col gap-2 mt-4">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between py-4 px-4 text-lg font-medium rounded-xl transition-colors",
                                            pathname === link.href
                                                ? "text-foreground bg-white/[0.04]"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                                        )}
                                    >
                                        {link.name}
                                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-6"
                            >
                                <Link href="/#subjects" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full" size="lg">
                                        Start Learning Now
                                    </Button>
                                </Link>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
