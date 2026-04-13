"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Mail, Clock, MessageSquare } from "lucide-react";

const contactInfo = [
    {
        icon: Mail,
        label: "Email Support",
        value: "ezca2431@gmail.com",
        href: "mailto:ezca2431@gmail.com",
    },
    {
        icon: Clock,
        label: "Response Time",
        value: "Usually within 24-48 hours",
    },
    {
        icon: MessageSquare,
        label: "Feedback",
        value: "Student feedback actually shapes EzCA.",
    },
];

export default function ContactPage() {
    return (
        <div className="pt-24 pb-20 min-h-screen relative">
            {/* Ambient background */}
            <div className="absolute top-0 right-1/4 w-96 h-64 bg-accent/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />

            <SectionWrapper>
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/70 mb-4">
                            Contact
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Contact Us</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Got a doubt, spotted a mistake, or want to contribute? We&apos;d love to hear from you.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left: Contact info */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.5 }}
                            className="space-y-6"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Get in Touch</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    You can contact us for doubts related to material, reporting errors or typos, suggestions and feedback, or collaboration opportunities.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {contactInfo.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            key={item.label}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-4.5 h-4.5 text-primary" />
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">{item.label}</span>
                                                {item.href ? (
                                                    <a href={item.href} className="block text-sm text-foreground hover:text-primary transition-colors mt-0.5">
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-0.5">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Right: Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                            className="glass-card rounded-2xl p-6 md:p-8"
                        >
                            <form className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground placeholder:text-muted-foreground/40 transition-all"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-foreground placeholder:text-muted-foreground/40 transition-all"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 resize-none text-foreground placeholder:text-muted-foreground/40 transition-all"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <Button className="w-full" size="lg">Send Message</Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
