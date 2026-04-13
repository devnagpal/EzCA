"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { features } from "@/lib/data";
import { motion } from "framer-motion";

export function Features() {
    return (
        <SectionWrapper id="features" className="py-24 md:py-32 relative">
            {/* Section background */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                <div className="absolute inset-0 bg-white/[0.01]" />
            </div>

            <div className="text-center mb-16 md:mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/70 mb-4">
                        Why Students Love Us
                    </span>
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05, duration: 0.5 }}
                    className="text-3xl md:text-5xl font-bold mb-5 tracking-tight"
                >
                    Why EzCA?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                    We focus on what matters most: clarity, brevity, and accessibility.
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ delay: index * 0.15, duration: 0.5, type: "spring", stiffness: 80 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className="group relative p-8 md:p-10 rounded-2xl glass-card overflow-hidden cursor-default"
                        >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                            {/* Corner glow */}
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/[0.04] rounded-full blur-[50px] group-hover:bg-primary/[0.08] transition-colors duration-500" />

                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center mb-7 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                                    <Icon className="w-7 h-7 text-primary" />
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </SectionWrapper>
    );
}
