import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export function BentoGrid({
  children,
  className,
  columns = 3,
}: BentoGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: 1 | 2; // Column span
  size?: "sm" | "md" | "lg";
}

export function BentoCard({
  children,
  className,
  span = 1,
  size = "md",
}: BentoCardProps) {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "surface",
        sizeClasses[size],
        span === 2 && "md:col-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}
