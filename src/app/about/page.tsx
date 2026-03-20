import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | EzCA",
    description: "Learn more about EzCA, your premium study platform for CA students.",
};

export default function AboutPage() {
    return (
        <div className="pt-24 pb-16 min-h-screen">
            <SectionWrapper>
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About EzCA</h1>
                        <p className="text-xl text-muted-foreground">Empowering Chartered Accountancy students with premium, high-quality study resources.</p>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At EzCA, our mission is to simplify the complex world of Chartered Accountancy studies. We understand the sheer volume and difficulty of the syllabus. That's why we've built a platform that curates the best PDF notes, auditory revision materials, and an advanced AI Copilot to guide you through your journey. 
                        </p>
                        
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us?</h2>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li><strong className="text-white">Curated Content:</strong> We collaborate with top educators to ensure accuracy and relevance.</li>
                            <li><strong className="text-white">Multi-modal Learning:</strong> Audio pockets for on-the-go revision and detailed PDF notes for deep dives.</li>
                            <li><strong className="text-white">AI-Powered Assistance:</strong> Next-generation tools to solve your doubts instantly.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">The Team</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We are a passionate team of educators, developers, and former CA students who understand exactly what it takes to succeed in these crucial exams.
                        </p>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
