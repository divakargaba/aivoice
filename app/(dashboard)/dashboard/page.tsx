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
    Sparkles,
    Plus,
    Mic2,
    Play,
    HelpCircle
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
                subtitle="Manage your audiobook projects and create new ones"
                actions={<CreateProjectDialog />}
            />

            {/* Quick Actions - Bento Grid */}
            <BentoGrid columns={3}>
                <BentoCard size="md" className="hover-lift">
                    <div className="space-y-3">
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                            <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">New Project</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Create a new audiobook from your manuscript
                            </p>
                            <CreateProjectDialog />
                        </div>
                    </div>
                </BentoCard>

                <BentoCard size="md" className="hover-lift cursor-pointer group">
                    <Link href="/voices" className="block">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Mic2 className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Browse Voices</h3>
                                <p className="text-sm text-muted-foreground">
                                    Preview and explore available AI voices
                                </p>
                            </div>
                        </div>
                    </Link>
                </BentoCard>

                <BentoCard size="md" className="hover-lift cursor-pointer group">
                    <Link href="/help" className="block">
                        <div className="space-y-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <HelpCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Get Help</h3>
                                <p className="text-sm text-muted-foreground">
                                    Guides, tips, and FAQs
                                </p>
                            </div>
                        </div>
                    </Link>
                </BentoCard>
            </BentoGrid>

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
                        icon={<Sparkles className="h-5 w-5" />}
                    />
                </BentoGrid>
            )}

            {/* Projects Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Projects</h2>
                    {totalProjects > 0 && <CreateProjectDialog />}
                </div>

                {totalProjects === 0 ? (
                    <div className="card-premium-lg">
                        <EmptyState
                            icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
                            title="No projects yet"
                            description="Create your first audiobook project to get started. Upload your manuscript and we'll guide you through the process."
                            secondaryAction={{
                                label: "Browse Voices",
                                href: "/voices"
                            }}
                            helpLink="/help"
                        />
                        <div className="px-6 pb-6 flex justify-center">
                            <CreateProjectDialog />
                        </div>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
}
