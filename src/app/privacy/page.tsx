import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | EzCA",
    description: "Read our privacy policy.",
};

export default function PrivacyPage() {
    return (
        <div className="pt-24 pb-16 min-h-screen">
            <SectionWrapper>
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
                        <p>At EzCA, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and safeguard your personal information when you use our website and services.</p>
                        
                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when creating an account, subscribing to our services, or contacting support. This may include your name, email address, and educational preferences.</p>
                        
                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Personalize your learning experience.</li>
                            <li>Communicate with you regarding updates, offers, and support.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Data Security</h2>
                        <p>We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access, alteration, or destruction.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Third-Party Services</h2>
                        <p>We may use third-party analytics and payment processors. These providers have their own privacy policies governing the data they collect and process on our behalf.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@ezca.edu" className="text-primary hover:underline transition-colors">privacy@ezca.edu</a>.</p>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
