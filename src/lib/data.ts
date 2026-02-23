import { Scale, TrendingUp, Calculator, Sigma, PieChart, BookText, Headphones, Sparkles } from "lucide-react";

export const subjects = [
    {
        slug: "laws",
        title: "Business Laws",
        description: "Master the legal framework with simplified notes and case studies.",
        icon: Scale,
        color: "from-blue-500 to-indigo-500",
        gradient: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20",
        border: "group-hover:border-blue-500/50",
        stats: { pdfs: 12, audios: 5 },
    },
    {
        slug: "economics",
        title: "Business Economics",
        description: "Understand market dynamics and economic policies effortlessly.",
        icon: TrendingUp,
        color: "from-emerald-500 to-teal-500",
        gradient: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
        border: "group-hover:border-emerald-500/50",
        stats: { pdfs: 8, audios: 4 },
    },
    {
        slug: "accounting",
        title: "Accounting",
        description: "Build a strong foundation in financial accounting principles.",
        icon: Calculator,
        color: "from-orange-500 to-red-500",
        gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20",
        border: "group-hover:border-orange-500/50",
        stats: { pdfs: 15, audios: 6 },
    },
    {
        slug: "quant",
        title: "Quantitative Aptitude",
        description: "Ace mathematics, logical reasoning, and statistics.",
        icon: Sigma,
        color: "from-purple-500 to-pink-500",
        gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20",
        border: "group-hover:border-purple-500/50",
        stats: { pdfs: 20, audios: 8 },
    },
];

export const features = [
    {
        title: "Curated PDFs",
        description: "Concise, exam-oriented notes designed for quick revision.",
        icon: BookText,
    },
    {
        title: "Audio Pockets",
        description: "Listen to key concepts on the go. Perfect for multitasking.",
        icon: Headphones,
    },
    {
        title: "AI Copilot (Soon)",
        description: "Instant doubt solving and personalized study schedules.",
        icon: Sparkles,
    },
];

export interface StudyResource {
    id: string;
    title: string;
    type: "pdf" | "audio";
    duration?: string; // for audio
    pages?: number; // for pdf
    size: string;
    chapter: string;
    fileUrl?: string; // path to the file in public/assets
}

export const mockResources: Record<string, StudyResource[]> = {
    laws: [
        { id: "l1", title: "Indian Regulatory Framework | Previous Year Questions", type: "pdf", pages: 5, size: "60 KB", chapter: "Indian Regulatory Framework", fileUrl: "/assets/pdfs/INDIAN-REGULATORY-FRAMEWORK-PREVIOUS-YEAR-QUESTIONS.pdf" },
        { id: "l2", title: "Indian Regulatory Framework | Flash Cards for Quick Revision", type: "pdf", pages: 26, size: "347 KB", chapter: "Companies Act", fileUrl: "/assets/pdfs/INDIAN-REGULATORY-FRAMEWORK-FLASH-CARDS.pdf" },
        { id: "l3", title: "Indian Regulatory Framework | Full Chapter Audio Revision", type: "audio", duration: "06:08", size: "2.80 MB", chapter: "Indian Regulatory Framework", fileUrl: "/assets/audio/INDIAN-REGULATORY-FRAMEWORK-FULL-CHAPTER-AUDIO-REVISION.mp3" },
        { id: "l4", title: "Contract Act | UNIT 6 | Contingent Contract", type: "audio", duration: "4:32", size: "4 MB", chapter: "Contract Act", fileUrl: "/assets/audio/Audio1.mp3" },
    ],
    economics: [
        { id: "e1", title: "Demand & Supply Analysis", type: "pdf", pages: 15, size: "3.2 MB", chapter: "Microeconomics" },
        { id: "e2", title: "Market Structures Summary", type: "pdf", pages: 10, size: "1.8 MB", chapter: "Markets" },
        { id: "e3", title: "Business Cycles Audio", type: "audio", duration: "12:15", size: "10 MB", chapter: "Macroeconomics" },
    ],
    accounting: [
        { id: "a1", title: "BRS - Concept Notes", type: "pdf", pages: 6, size: "1.5 MB", chapter: "Bank Reconciliation" },
        { id: "a2", title: "Depreciation Methods", type: "pdf", pages: 9, size: "2.1 MB", chapter: "Depreciation" },
        { id: "a3", title: "Final Accounts Adjustment Audio", type: "audio", duration: "20:00", size: "18 MB", chapter: "Final Accounts" },
    ],
    quant: [
        { id: "q1", title: "Time Value of Money Formulas", type: "pdf", pages: 5, size: "1.2 MB", chapter: "TVM" },
        { id: "q2", title: "Logical Reasoning Tricks", type: "pdf", pages: 11, size: "2.5 MB", chapter: "LR" },
        { id: "q3", title: "Statistics Theory Audio", type: "audio", duration: "18:45", size: "16 MB", chapter: "Statistics" },
    ],
};
