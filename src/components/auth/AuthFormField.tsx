"use client";

// ─── Reusable Form Field ───────────────────────────────────────────────────

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AuthFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(
    ({ label, error, hint, className, id, ...props }, ref) => {
        const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={fieldId}
                    className="text-sm font-medium text-foreground/80"
                >
                    {label}
                </label>
                <input
                    ref={ref}
                    id={fieldId}
                    className={cn(
                        "w-full px-4 py-2.5 rounded-xl text-sm",
                        "bg-white/[0.04] border border-white/[0.08]",
                        "text-foreground placeholder:text-muted-foreground/50",
                        "outline-none ring-0",
                        "transition-all duration-200",
                        "focus:border-primary/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-primary/20",
                        error && "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20",
                        className
                    )}
                    aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
                    aria-invalid={!!error}
                    {...props}
                />
                {hint && !error && (
                    <p id={`${fieldId}-hint`} className="text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
                {error && (
                    <p id={`${fieldId}-error`} className="text-xs text-red-400 flex items-center gap-1">
                        <span aria-hidden>⚠</span> {error}
                    </p>
                )}
            </div>
        );
    }
);

AuthFormField.displayName = "AuthFormField";
