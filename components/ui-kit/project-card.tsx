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

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  analyzing: { label: "Analyzing", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  ready: { label: "Ready", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  generating: { label: "Generating", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  published: { label: "Complete", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
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
    <Link href={href}>
      <div
        className={cn(
          "card-premium-lg p-6 space-y-4 hover-lift group cursor-pointer",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {title}
          </h3>
          <Badge className={cn("shrink-0 border", statusInfo.color)}>
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

        {/* CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Open project</span>
          <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
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

