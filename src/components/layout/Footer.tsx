"use client";

import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const footerLinks = {
    resources: [
        { name: "Business Laws", href: "/subjects/laws" },
        { name: "Economics", href: "/subjects/economics" },
        { name: "Accounting", href: "/subjects/accounting" },
        { name: "Quantitative Aptitude", href: "/subjects/quant" },
    ],
    company: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy Policy", href: "/privacy" },
    ],
};

export function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mt-auto"
        >
            {/* Gradient divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="bg-black/30 backdrop-blur-sm py-16">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-5">
                            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/10">
                                    <BookOpen className="w-4.5 h-4.5 text-primary" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">
                                    Ez<span className="text-gradient">CA</span>
                                </span>
                            </Link>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                                Premium study materials for CA Foundation students. Access curated PDF notes, audio revisions,
                                and AI-powered learning assistance designed for rapid retention.
                            </p>
                        </div>

                        {/* Resources */}
                        <div className="col-span-1 md:col-span-3 md:col-start-7">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-5">Resources</h3>
                            <ul className="space-y-3">
                                {footerLinks.resources.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="group/link text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                                        >
                                            {link.name}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-50 group-hover/link:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-5">Company</h3>
                            <ul className="space-y-3">
                                {footerLinks.company.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="group/link text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                                        >
                                            {link.name}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-50 group-hover/link:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground/60">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent absolute left-0" />
                        <p className="relative">
                            &copy; {new Date().getFullYear()} EzCA Education. All rights reserved.
                        </p>
                        <p className="relative mt-3 md:mt-0 text-muted-foreground/40">
                            Built for CA Foundation aspirants
                        </p>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}
