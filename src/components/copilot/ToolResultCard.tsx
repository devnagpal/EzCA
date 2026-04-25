"use client";

// ─── Tool Result Card ─────────────────────────────────────────────────
// Rich structured cards for quiz results, flashcards, and summaries.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, ChevronRight } from "lucide-react";
import type { ToolResult, QuizQuestion, FlashcardData, SummaryData } from "@/lib/copilot/types";
import { cn } from "@/lib/utils";

interface ToolResultCardProps {
    result: ToolResult;
}

export function ToolResultCard({ result }: ToolResultCardProps) {
    switch (result.type) {
        case "quiz":
            return <QuizCard questions={result.data as QuizQuestion[]} />;
        case "flashcard":
            return <FlashcardDeck cards={result.data as FlashcardData[]} />;
        case "summary":
            return <SummaryCard summary={result.data as SummaryData} />;
        default:
            return null;
    }
}

// ─── Quiz Card ─────────────────────────────────────────────────────────

function QuizCard({ questions }: { questions: QuizQuestion[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const question = questions[currentIndex];

    const handleSelect = (optIndex: number) => {
        if (selectedOption !== null) return; // already answered
        setSelectedOption(optIndex);
        if (optIndex === question.correctIndex) {
            setScore((p) => p + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((p) => p + 1);
            setSelectedOption(null);
        } else {
            setIsFinished(true);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setScore(0);
        setIsFinished(false);
    };

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
            >
                <div className="text-center">
                    <div className={cn(
                        "text-3xl font-bold mb-1",
                        percentage >= 70 ? "text-emerald-400" : percentage >= 40 ? "text-amber-400" : "text-red-400"
                    )}>
                        {score}/{questions.length}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {percentage >= 70 ? "Great job! 🎉" : percentage >= 40 ? "Good effort! Keep practicing 📚" : "Keep studying! You'll get there 💪"}
                    </p>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
            {/* Progress */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Question {currentIndex + 1}/{questions.length}
                </span>
                <span className="text-[10px] font-medium text-primary">
                    Score: {score}
                </span>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/[0.04] rounded-full mb-4 overflow-hidden">
                <motion.div
                    className="h-full bg-primary/60 rounded-full"
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question */}
            <p className="text-sm font-medium text-foreground/90 mb-3 leading-relaxed">
                {question.question}
            </p>

            {/* Options */}
            <div className="space-y-1.5 mb-3">
                {question.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === question.correctIndex;
                    const showResult = selectedOption !== null;

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            disabled={selectedOption !== null}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer",
                                !showResult && "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]",
                                showResult && isCorrect && "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300",
                                showResult && isSelected && !isCorrect && "bg-red-500/10 border border-red-500/30 text-red-300",
                                showResult && !isSelected && !isCorrect && "bg-white/[0.01] border border-white/[0.03] opacity-50",
                                selectedOption !== null && "cursor-default"
                            )}
                        >
                            <span className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px]",
                                !showResult && "border-white/10",
                                showResult && isCorrect && "border-emerald-500/50 bg-emerald-500/20",
                                showResult && isSelected && !isCorrect && "border-red-500/50 bg-red-500/20"
                            )}>
                                {showResult && isCorrect ? (
                                    <Check className="w-3 h-3" />
                                ) : showResult && isSelected && !isCorrect ? (
                                    <X className="w-3 h-3" />
                                ) : (
                                    String.fromCharCode(65 + i)
                                )}
                            </span>
                            {opt}
                        </button>
                    );
                })}
            </div>

            {/* Explanation & Next */}
            <AnimatePresence>
                {selectedOption !== null && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {question.explanation && (
                            <p className="text-[11px] text-muted-foreground bg-white/[0.02] p-2.5 rounded-lg mb-2 leading-relaxed">
                                💡 {question.explanation}
                            </p>
                        )}
                        <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                            {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Flashcard Deck ────────────────────────────────────────────────────

function FlashcardDeck({ cards }: { cards: FlashcardData[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const card = cards[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Flashcard {currentIndex + 1}/{cards.length}
                </span>
            </div>

            <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors text-center min-h-[100px] flex items-center justify-center cursor-pointer"
            >
                <motion.div
                    key={isFlipped ? "back" : "front"}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <p className={cn(
                        "text-sm leading-relaxed",
                        isFlipped ? "text-primary" : "text-foreground font-medium"
                    )}>
                        {isFlipped ? card.definition : card.term}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-2">
                        {isFlipped ? "Click to see term" : "Click to reveal answer"}
                    </p>
                </motion.div>
            </button>

            <div className="flex items-center justify-center gap-2 mt-2">
                <button
                    onClick={() => { setCurrentIndex((p) => Math.max(0, p - 1)); setIsFlipped(false); }}
                    disabled={currentIndex === 0}
                    className="px-2.5 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                >
                    ← Previous
                </button>
                <button
                    onClick={() => { setCurrentIndex((p) => Math.min(cards.length - 1, p + 1)); setIsFlipped(false); }}
                    disabled={currentIndex === cards.length - 1}
                    className="px-2.5 py-1 rounded-md text-[10px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer"
                >
                    Next →
                </button>
            </div>
        </motion.div>
    );
}

// ─── Summary Card ──────────────────────────────────────────────────────

function SummaryCard({ summary }: { summary: SummaryData }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
        >
            <h4 className="text-sm font-semibold text-foreground mb-3">{summary.title}</h4>
            <div className="space-y-2">
                {summary.sections.map((section, i) => (
                    <div key={i}>
                        <h5 className="text-xs font-medium text-primary/80 mb-0.5">
                            {section.heading}
                        </h5>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {section.content}
                        </p>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
