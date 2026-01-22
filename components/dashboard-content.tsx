"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createProject } from "@/actions/projects";
import { toast } from "sonner";
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  ArrowRight,
  MoreVertical,
} from "lucide-react";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  chapters: Array<{ id: string }>;
  characters?: Array<{ id: string }>;
}

interface DashboardContentProps {
  projects: Project[];
}

export function DashboardContent({ projects }: DashboardContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsPending(true);
    try {
      const project = await createProject(projectTitle.trim());
      toast.success("Project created");
      setIsDialogOpen(false);
      setProjectTitle("");
      router.push(`/project/${project.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsPending(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "published":
      case "ready":
        return { icon: CheckCircle2, label: "Ready", variant: "default" as const };
      case "generating":
      case "analyzing":
        return { icon: Clock, label: "Processing", variant: "secondary" as const };
      default:
        return { icon: BookOpen, label: "Draft", variant: "outline" as const };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const stats = useMemo(() => {
    return {
      total: projects.length,
      ready: projects.filter((p) => p.status === "ready" || p.status === "published").length,
      inProgress: projects.filter((p) => p.status === "analyzing" || p.status === "generating").length,
      drafts: projects.filter((p) => p.status === "draft").length,
    };
  }, [projects]);

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-headline mb-1">Projects</h1>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        </div>

        {/* Stats Bar */}
        {projects.length > 0 && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-4 py-3">
              <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">Total</div>
              <div className="text-xl font-semibold text-[rgb(var(--text-primary))]">{stats.total}</div>
            </div>
            <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-4 py-3">
              <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">Ready</div>
              <div className="text-xl font-semibold text-[rgb(var(--text-primary))]">{stats.ready}</div>
            </div>
            <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-4 py-3">
              <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">In Progress</div>
              <div className="text-xl font-semibold text-[rgb(var(--text-primary))]">{stats.inProgress}</div>
            </div>
            <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-4 py-3">
              <div className="text-xs text-[rgb(var(--text-secondary))] mb-1">Drafts</div>
              <div className="text-xl font-semibold text-[rgb(var(--text-primary))]">{stats.drafts}</div>
            </div>
          </div>
        )}

        {/* Projects Table */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <BookOpen className="mb-4 h-10 w-10 text-[rgb(var(--text-muted))]" />
            <h3 className="text-title mb-2">No projects yet</h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] mb-6 max-w-md">
              Create your first project to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create project
            </Button>
          </div>
        ) : (
          <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <div className="border-b border-[rgb(var(--border-base))] px-4 py-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                <div className="col-span-5">Project</div>
                <div className="col-span-2">Chapters</div>
                <div className="col-span-2">Characters</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1"></div>
              </div>
            </div>
            <div className="divide-y divide-[rgb(var(--border-base))]">
              {projects.map((project, index) => {
                const statusConfig = getStatusConfig(project.status);
                const Icon = statusConfig.icon;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link href={`/project/${project.id}`}>
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[rgb(var(--bg-elevated))] transition-colors cursor-pointer items-center">
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-[rgb(var(--bg-elevated))] flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-[rgb(var(--text-secondary))]" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                              {project.title}
                            </div>
                            <div className="text-xs text-[rgb(var(--text-muted))]">
                              {formatDate(project.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 text-sm text-[rgb(var(--text-secondary))]">
                          {project.chapters.length}
                        </div>
                        <div className="col-span-2 text-sm text-[rgb(var(--text-secondary))]">
                          {project.characters?.length || 0}
                        </div>
                        <div className="col-span-2">
                          <Badge variant={statusConfig.variant} className="text-xs">
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <ArrowRight className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateProject}>
            <DialogHeader>
              <DialogTitle>Create new project</DialogTitle>
              <DialogDescription>
                Give your project a name to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="title">Project name</Label>
              <Input
                id="title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="My audiobook"
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !projectTitle.trim()} size="sm">
                {isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
