import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-12 mt-auto">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-6 h-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight">
                                Ez<span className="text-primary">CA</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            Premium study materials for CA students. Audio revisions, PDF notes, and AI-powered learning assistance.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/subjects/laws" className="hover:text-primary transition-colors">Business Laws</Link></li>
                            <li><Link href="/subjects/economics" className="hover:text-primary transition-colors">Economics</Link></li>
                            <li><Link href="/subjects/accounting" className="hover:text-primary transition-colors">Accounting</Link></li>
                            <li><Link href="/subjects/quant" className="hover:text-primary transition-colors">Quantitative Aptitude</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} EzCA Education. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {/* Social icons could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
