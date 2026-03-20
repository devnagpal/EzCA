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
                        <p className="text-xl text-muted-foreground">EzCA is built by students, for students — because we know CA prep can get overwhelming real fast. Empowering CA students with premium, high-quality study resources.</p>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At EzCA, Our goal is simple: provide quick, clean, exam-focused material that actually helps during revision time. No unnecessary fluff, no time waste — just the important questions, one-shot revisions, and notes you really need before exams.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us?</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We created EzCA after seeing how most students struggle not because they lack ability, but because they don’t have the right revision support at the right time. This platform is our attempt to make CA Foundation prep more focused, efficient, and less stressful.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">The Team</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We’re continuously improving and adding new material. If EzCA makes your preparation even a little easier, we’re doing something right.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            - Saksham & Dev
                        </p>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
