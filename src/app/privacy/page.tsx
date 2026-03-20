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
                        <p>We may collect basic information such as your email address if you contact us directly. We do not collect any sensitive personal data from users.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>Any information shared with us is used only to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Personalize your learning experience.</li>
                            <li>Fix errors reported by users</li>
                        </ul>
                        <p>We do not sell, rent, or share your personal information with third parties.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Cookies</h2>
                        <p>EzCA may use basic cookies or analytics tools to understand website traffic and improve user experience. These do not personally identify you.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Third-Party Services</h2>
                        <p>Our website may contain links to YouTube or other educational resources. We are not responsible for the privacy practices of those external sites.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Data Security</h2>
                        <p>We take reasonable steps to keep your information safe, but no internet transmission is 100% secure.</p>

                        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:ezca2431@gmail.com" className="text-primary hover:underline transition-colors">ezca2431@gmail.com</a>.</p>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
