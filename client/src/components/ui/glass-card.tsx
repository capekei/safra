import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "button" | "pill";
  active?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", active, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card",
          {
            "glass-button": variant === "button",
            "glass-pill": variant === "pill",
            "active": active && variant === "pill",
            "hover:transform hover:-translate-y-1": variant === "hover",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
