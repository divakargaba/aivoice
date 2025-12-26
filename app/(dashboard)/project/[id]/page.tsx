"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RunAnalysisButton } from "@/components/run-analysis-button";
import { CastTab } from "@/components/cast-tab";
import { StudioTab } from "@/components/studio-tab";
import { Sparkles, Users, Mic } from "lucide-react";

interface VoiceAssignment {
    id: string;
    provider: string;
    voiceId: string;
    settings: any;
}

interface Character {
    id: string;
    name: string;
    description: string | null;
    voiceAssignments: VoiceAssignment[];
}

interface TextBlock {
    id: string;
    idx: number;
    kind: "narration" | "dialogue";
    text: string;
    meta: {
        emotion?: string;
        director_notes?: string;
    } | null;
    speakerCharacter: {
        name: string;
    } | null;
    audioSegment: {
        id: string;
        audioUrl: string;
    } | null;
}

interface Chapter {
    id: string;
    title: string;
    rawText: string | null;
    textBlocks: TextBlock[];
}

interface Project {
    id: string;
    title: string;
    status: string;
    chapters: Chapter[];
    characters: Character[];
}

interface ProjectPageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
    const [activeTab, setActiveTab] = useState("manuscript");
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            const { id } = await params;
            const response = await fetch(`/api/projects/${id}`);
            if (response.ok) {
                const data = await response.json();
                setProject(data);
            }
            setLoading(false);
        };
        loadProject();
    }, [params]);

    // Poll for status updates while analyzing
    useEffect(() => {
        if (project?.status === "analyzing") {
            const interval = setInterval(async () => {
                const { id } = await params;
                const response = await fetch(`/api/projects/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProject(data);
                    if (data.status !== "analyzing") {
                        clearInterval(interval);
                    }
                }
            }, 2000); // Poll every 2 seconds

            return () => clearInterval(interval);
        }
    }, [project?.status, params]);

    const handleAnalysisComplete = () => {
        setActiveTab("cast");
    };

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Project not found</p>
            </div>
        );
    }

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                        {project.chapters[0] && (
                            <RunAnalysisButton
                                projectId={project.id}
                                chapterId={project.chapters[0].id}
                                disabled={project.status !== "draft"}
                                onComplete={handleAnalysisComplete}
                            />
                        )}
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
                    <CastTab projectId={project.id} characters={project.characters} />
                </TabsContent>

                {/* Studio Tab */}
                <TabsContent value="studio" className="space-y-4">
                    <StudioTab
                        projectId={project.id}
                        chapters={project.chapters}
                        projectStatus={project.status}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

