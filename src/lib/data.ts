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
        stats: { pdfs: 2, audios: 2 },
    },
    {
        slug: "economics",
        title: "Business Economics",
        description: "Understand market dynamics and economic policies effortlessly.",
        icon: TrendingUp,
        color: "from-emerald-500 to-teal-500",
        gradient: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20",
        border: "group-hover:border-emerald-500/50",
        stats: { pdfs: 1, audios: 0 },
    },
    {
        slug: "accounting",
        title: "Accounting",
        description: "Build a strong foundation in financial accounting principles.",
        icon: Calculator,
        color: "from-orange-500 to-red-500",
        gradient: "bg-gradient-to-br from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20",
        border: "group-hover:border-orange-500/50",
        stats: { pdfs: 2, audios: 1 },
    },
    {
        slug: "quant",
        title: "Quantitative Aptitude",
        description: "Ace mathematics, logical reasoning, and statistics.",
        icon: Sigma,
        color: "from-purple-500 to-pink-500",
        gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20",
        border: "group-hover:border-purple-500/50",
        stats: { pdfs: 1, audios: 0 },
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
        { id: "e1", title: "Theory of Demand & Supply | MCQs", type: "pdf", pages: 7, size: "323 KB", chapter: "Microeconomics", fileUrl: "/assets/pdfs/THEORY-OF-DEMAND-SUPPLY-MCQS_1.pdf" },
    ],
    accounting: [
        { id: "a1", title: "BRS - Concept Notes", type: "pdf", pages: 6, size: "1.5 MB", chapter: "Bank Reconciliation" },
        { id: "a2", title: "Depreciation Methods", type: "pdf", pages: 9, size: "2.1 MB", chapter: "Depreciation" },
        { id: "a3", title: "Final Accounts Adjustment Audio", type: "audio", duration: "20:00", size: "18 MB", chapter: "Final Accounts" },
    ],
    quant: [
        { id: "q1", title: "Mathematics of Finance Formulas", type: "pdf", pages: 4, size: "131 KB", chapter: "Mathematics of Finance", fileUrl: "/assets/pdfs/MATHEMATICS-OF-FINANCE-FULL-FORMULA-SHEET.pdf" },
    ],
};
