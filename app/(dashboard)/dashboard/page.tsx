import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { listProjects } from "@/actions/projects";
import Link from "next/link";

export default async function DashboardPage() {
    const projects = await listProjects();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your AI voice projects
                    </p>
                </div>
                <CreateProjectDialog />
            </div>

            {projects.length === 0 ? (
                /* Empty State */
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                            <FolderOpen className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="mt-6 text-xl font-semibold">No projects yet</h3>
                        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
                            Get started by creating your first AI voice project. Click the button
                            above to begin.
                        </p>
                        <div className="mt-6">
                            <CreateProjectDialog />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Projects Grid */
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/project/${project.id}`}>
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                <CardContent className="p-6">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{project.chapters.length} chapters</span>
                                            <span>•</span>
                                            <span className="capitalize">{project.status}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Created {new Date(project.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

