import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "gradient";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-xl",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            outline: "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 text-foreground backdrop-blur-sm",
            ghost: "hover:bg-white/[0.06] text-muted-foreground hover:text-foreground",
            link: "text-primary underline-offset-4 hover:underline",
            gradient: "bg-gradient-to-r from-primary via-accent to-purple-400 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl hover:brightness-110",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs rounded-lg gap-1.5",
            md: "h-11 px-5 py-2 rounded-xl gap-2",
            lg: "h-13 px-8 rounded-xl text-base gap-2.5",
            icon: "h-10 w-10 p-2 rounded-full",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button };
