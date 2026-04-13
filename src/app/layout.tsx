import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "EzCA - Premium Study Material for CA Students",
    description: "Curated PDF notes and audio revisions for Business Laws, Economics, Accounting, and QA.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
            >
                {/* Layered ambient background */}
                <div className="fixed inset-0 z-[-1]">
                    {/* Base radial gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
                    {/* Secondary warm glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_-10%,rgba(167,139,250,0.06),transparent)]" />
                    {/* Subtle grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                            backgroundSize: '64px 64px',
                        }}
                    />
                </div>

                <Navbar />
                <main className="flex-1 pt-16">
                    {children}
                </main>
                <Footer />
                <Analytics />
            </body>
        </html>
    );
}
