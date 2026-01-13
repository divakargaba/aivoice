import { CreateProjectDialog } from "@/components/create-project-dialog";
import { listProjects } from "@/actions/projects";
import { PageHeader } from "@/components/ui-kit/page-header";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { StatCard } from "@/components/ui-kit/stat-card";
import { BentoGrid, BentoCard } from "@/components/ui-kit/bento-grid";
import { ProjectCard } from "@/components/ui-kit/project-card";
import {
    BookOpen,
    FileText,
    CheckCircle2,
    Plus,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    const projects = await listProjects();

    // Calculate stats
    const totalChapters = projects.reduce((sum, p) => sum + p.chapters.length, 0);
    const readyProjects = projects.filter(p => p.status === 'ready' || p.status === 'published').length;
    const totalProjects = projects.length;

    return (
        <div className="space-y-8">
            <PageHeader
                title="Dashboard"
                subtitle="Create and manage your audiobook projects"
                actions={<CreateProjectDialog />}
            />

            {/* Quick Start Card */}
            {totalProjects === 0 && (
                <div className="surface-elevated p-10">
                    <EmptyState
                        icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
                        title="Welcome to Audiobook Studio"
                        description="Create your first audiobook project. Upload your manuscript, choose voices for your characters, and generate professional audio."
                        secondaryAction={{
                            label: "Learn how it works",
                            href: "/how-it-works"
                        }}
                        helpLink="/help"
                    />
                    <div className="flex justify-center mt-6">
                        <CreateProjectDialog />
                    </div>
                </div>
            )}

            {/* Stats */}
            {totalProjects > 0 && (
                <BentoGrid columns={3}>
                    <StatCard
                        label="Total Projects"
                        value={totalProjects}
                        icon={<BookOpen className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Total Chapters"
                        value={totalChapters}
                        icon={<FileText className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Ready to Export"
                        value={readyProjects}
                        icon={<CheckCircle2 className="h-5 w-5" />}
                    />
                </BentoGrid>
            )}

            {/* Projects Section */}
            {totalProjects > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-headline text-foreground">Your Projects</h2>
                            <p className="text-body text-muted-foreground mt-1">
                                Continue working on your projects or create a new one
                            </p>
                        </div>
                        <CreateProjectDialog />
                    </div>

                    <BentoGrid columns={3}>
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                id={project.id}
                                title={project.title}
                                status={project.status}
                                chapterCount={project.chapters.length}
                                lastUpdated={new Date(project.createdAt)}
                                href={`/project/${project.id}`}
                            />
                        ))}
                    </BentoGrid>
                </div>
            )}

            {/* Help Section */}
            {totalProjects > 0 && (
                <div className="surface p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <h3 className="text-title text-foreground">Need help getting started?</h3>
                            <p className="text-body text-muted-foreground">
                                Learn how to create your first audiobook with our step-by-step guide.
                            </p>
                        </div>
                        <Link href="/how-it-works">
                            <Button variant="outline" className="gap-2">
                                View guide
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
