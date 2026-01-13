import { CreateProjectDialog } from "@/components/create-project-dialog";
import { listProjects } from "@/actions/projects";
import { PageHeader } from "@/components/ui-kit/page-header";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { BentoGrid } from "@/components/ui-kit/bento-grid";
import { ProjectCard } from "@/components/ui-kit/project-card";
import { BookOpen } from "lucide-react";

export default async function ProjectsPage() {
    const projects = await listProjects();

    return (
        <div className="space-y-8">
            <PageHeader
                title="Projects"
                subtitle="All your audiobook projects in one place"
                actions={<CreateProjectDialog />}
            />

            {projects.length === 0 ? (
                <div className="surface-elevated">
                    <EmptyState
                        icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
                        title="No projects yet"
                        description="Create your first project to get started. Upload your manuscript and we'll guide you through the process."
                        helpLink="/help"
                    />
                    <div className="flex justify-center pb-8">
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
    );
}
