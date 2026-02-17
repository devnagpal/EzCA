"use client";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { features } from "@/lib/data";
import { motion } from "framer-motion";

export function Features() {
    return (
        <SectionWrapper id="features" className="py-24 border-t border-white/5 bg-white/[0.02]">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Why EzCA?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We focus on what matters most: clarity, brevity, and accessibility.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="p-8 rounded-3xl bg-card/20 border border-white/5 relative overflow-hidden group hover:bg-card/40 transition-colors"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                                <Icon className="w-7 h-7" />
                            </div>

                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </SectionWrapper>
    );
}
