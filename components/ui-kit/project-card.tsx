import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  title: string;
  status: string;
  chapterCount: number;
  lastUpdated: Date;
  href: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  analyzing: { label: "Analyzing", variant: "default" },
  ready: { label: "Ready", variant: "default" },
  generating: { label: "Generating", variant: "default" },
  published: { label: "Complete", variant: "default" },
};

export function ProjectCard({
  id,
  title,
  status,
  chapterCount,
  lastUpdated,
  href,
  className,
}: ProjectCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.draft;
  const timeAgo = getTimeAgo(lastUpdated);

  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "surface-elevated p-6 space-y-4 transition-all hover:shadow-lg group cursor-pointer",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-title text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {title}
          </h3>
          <Badge variant={statusInfo.variant} className="shrink-0">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            <span>{chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Open project</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
