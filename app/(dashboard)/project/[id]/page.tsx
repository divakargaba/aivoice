import { getProject } from "@/actions/projects";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound } from "next/navigation";
import { Sparkles, Users, Mic } from "lucide-react";

export default async function ProjectPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let project;
    try {
        project = await getProject(id);
    } catch (error) {
        notFound();
    }

    // Get status badge color
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "draft":
                return "secondary";
            case "analyzing":
                return "default";
            case "ready":
                return "outline";
            case "generating":
                return "default";
            case "published":
                return "default";
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            {/* Project Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(project.status)} className="capitalize">
                            {project.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {project.chapters.length} {project.chapters.length === 1 ? "chapter" : "chapters"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="manuscript" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="manuscript">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Manuscript
                    </TabsTrigger>
                    <TabsTrigger value="cast">
                        <Users className="mr-2 h-4 w-4" />
                        Cast
                    </TabsTrigger>
                    <TabsTrigger value="studio">
                        <Mic className="mr-2 h-4 w-4" />
                        Studio
                    </TabsTrigger>
                </TabsList>

                {/* Manuscript Tab */}
                <TabsContent value="manuscript" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Manuscript Content</h2>
                        <Button disabled={project.status !== "draft"}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Run Analysis
                        </Button>
                    </div>

                    {project.chapters.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No chapters yet
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {project.chapters.map((chapter) => (
                                <Card key={chapter.id}>
                                    <CardContent className="p-6 space-y-3">
                                        <h3 className="font-semibold text-lg">{chapter.title}</h3>
                                        {chapter.rawText ? (
                                            <div className="rounded-md border bg-muted/30 p-4 max-h-[400px] overflow-y-auto">
                                                <p className="text-sm text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                                                    {chapter.rawText}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                No content
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Cast Tab */}
                <TabsContent value="cast" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Characters & Voice Cast</h2>
                        <Button variant="outline" disabled>
                            Add Character
                        </Button>
                    </div>

                    {project.characters.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                                    <Users className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="mt-6 text-lg font-semibold">No characters yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                                    Run analysis on your manuscript to automatically detect characters
                                    and dialogue.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {project.characters.map((character) => (
                                <Card key={character.id}>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold">{character.name}</h3>
                                        {character.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {character.description}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Studio Tab */}
                <TabsContent value="studio" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Audio Studio</h2>
                        <Button variant="outline" disabled>
                            Generate Audio
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="py-16 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                                <Mic className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 text-lg font-semibold">Studio coming soon</h3>
                            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                                The audio generation studio will be available here. Assign voices,
                                generate audio, and manage your final output.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

