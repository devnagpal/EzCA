"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const sections = [
    {
        title: "1. Information We Collect",
        content: "We may collect basic information such as your email address if you contact us directly. We do not collect any sensitive personal data from users.",
    },
    {
        title: "2. How We Use Your Information",
        content: "Any information shared with us is used only to:",
        list: [
            "Provide, maintain, and improve our services.",
            "Personalize your learning experience.",
            "Fix errors reported by users.",
        ],
        footer: "We do not sell, rent, or share your personal information with third parties.",
    },
    {
        title: "3. Cookies",
        content: "EzCA may use basic cookies or analytics tools to understand website traffic and improve user experience. These do not personally identify you.",
    },
    {
        title: "4. Third-Party Services",
        content: "Our website may contain links to YouTube or other educational resources. We are not responsible for the privacy practices of those external sites.",
    },
    {
        title: "5. Data Security",
        content: "We take reasonable steps to keep your information safe, but no internet transmission is 100% secure.",
    },
    {
        title: "6. Contact Us",
        content: "If you have any questions about this Privacy Policy, please contact us at",
        email: "ezca2431@gmail.com",
    },
];

export default function PrivacyPage() {
    return (
        <div className="pt-24 pb-20 min-h-screen relative">
            {/* Ambient background */}
            <div className="absolute top-0 left-1/2 w-96 h-64 bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

            <SectionWrapper>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary/70">Privacy</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground/60">
                            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </motion.div>

                    {/* Intro */}
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="text-muted-foreground leading-relaxed mb-10 p-6 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                        At EzCA, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you use our website and services.
                    </motion.p>

                    {/* Sections */}
                    <div className="space-y-8">
                        {sections.map((section, i) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                            >
                                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-3">
                                    <span className="w-1 h-5 bg-gradient-to-b from-primary/60 to-primary/20 rounded-full" />
                                    {section.title}
                                </h2>
                                <div className="pl-4 border-l border-white/[0.04]">
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {section.content}
                                        {section.email && (
                                            <>
                                                {" "}
                                                <a href={`mailto:${section.email}`} className="text-primary hover:text-primary/80 transition-colors font-medium">
                                                    {section.email}
                                                </a>.
                                            </>
                                        )}
                                    </p>
                                    {section.list && (
                                        <ul className="mt-3 space-y-2">
                                            {section.list.map((item) => (
                                                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2.5">
                                                    <span className="w-1 h-1 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {section.footer && (
                                        <p className="text-muted-foreground leading-relaxed text-sm mt-3">{section.footer}</p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
