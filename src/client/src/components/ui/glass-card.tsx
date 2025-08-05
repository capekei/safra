import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  blur?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, blur = 'md', opacity = 0.1, ...props }, ref) => {
    const blurClasses = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur',
      lg: 'backdrop-blur-lg'
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white/90 border border-white/20 rounded-lg shadow-lg",
          blurClasses[blur],
          className
        )}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }