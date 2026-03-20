import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "Contact Us | EzCA",
    description: "Get in touch with the EzCA team.",
};

export default function ContactPage() {
    return (
        <div className="pt-24 pb-16 min-h-screen">
            <SectionWrapper>
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Contact Us</h1>
                        <p className="text-xl text-muted-foreground">We're here to help. Reach out to us with any questions or feedback.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Get in Touch</h3>
                                <p className="text-muted-foreground">Have a question about our study materials or your subscription? Our support team is ready to assist you.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-primary">Email Support</span>
                                    <a href="mailto:support@ezca.edu" className="text-muted-foreground hover:text-white transition-colors">support@ezca.edu</a>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="font-medium text-primary">Business Inquiries</span>
                                    <a href="mailto:partners@ezca.edu" className="text-muted-foreground hover:text-white transition-colors">partners@ezca.edu</a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" id="name" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" placeholder="Your name" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" id="email" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white" placeholder="you@example.com" />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                                    <textarea id="message" rows={4} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-white" placeholder="How can we help?"></textarea>
                                </div>
                                <Button className="w-full">Send Message</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
