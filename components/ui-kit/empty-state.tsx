import { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  helpLink?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  helpLink = "/help",
  className,
}: EmptyStateProps) {
  const PrimaryButton = primaryAction?.href ? Link : "button";
  const SecondaryButton = secondaryAction?.href ? Link : "button";

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 border border-border">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {primaryAction && (
          <PrimaryButton
            href={primaryAction.href}
            onClick={primaryAction.onClick}
            className="inline-flex"
          >
            <Button className="gradient-primary border-0">
              {primaryAction.label}
            </Button>
          </PrimaryButton>
        )}
        {secondaryAction && (
          <SecondaryButton
            href={secondaryAction.href}
            onClick={secondaryAction.onClick}
            className="inline-flex"
          >
            <Button variant="outline">
              {secondaryAction.label}
            </Button>
          </SecondaryButton>
        )}
      </div>

      {helpLink && (
        <Link
          href={helpLink}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Need help? View guide</span>
        </Link>
      )}
    </div>
  );
}

