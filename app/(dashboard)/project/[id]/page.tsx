"use client";

import { FormEvent, useCallback, useEffect, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RunAnalysisButton } from "@/components/run-analysis-button";
import { CastTab } from "@/components/cast-tab";
import { StudioTab } from "@/components/studio-tab";
import {
    ArrowDown,
    ArrowUp,
    Mic,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
    Users,
} from "lucide-react";
import {
    createChapter,
    deleteChapter,
    reorderChapters,
    updateChapter,
} from "@/actions/chapters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    const [isPending, startTransition] = useTransition();
    const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
    const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [chapterTitle, setChapterTitle] = useState("");
    const [chapterText, setChapterText] = useState("");

    const refreshProject = useCallback(async () => {
        const { id } = await params;
        const response = await fetch(`/api/projects/${id}`, { cache: "no-store" });
        if (response.ok) {
            const data = await response.json();
            setProject(data);
            setActiveChapterId((prev) => {
                if (prev && data.chapters.some((chapter: Chapter) => chapter.id === prev)) {
                    return prev;
                }
                return data.chapters[0]?.id || null;
            });
            setLoading(false);
            return data as Project;
        }
        setLoading(false);
        return null;
    }, [params]);

    useEffect(() => {
        refreshProject();
    }, [refreshProject]);

    // Poll for status updates while analyzing
    useEffect(() => {
        if (project?.status === "analyzing") {
            const interval = setInterval(async () => {
                const data = await refreshProject();
                if (data && data.status !== "analyzing") {
                    clearInterval(interval);
                }
            }, 2000); // Poll every 2 seconds

            return () => clearInterval(interval);
        }
    }, [project?.status, refreshProject]);

    const handleAnalysisComplete = () => {
        setActiveTab("cast");
    };

    const activeChapter = project?.chapters.find(
        (chapter) => chapter.id === activeChapterId
    ) || null;

    const openAddChapterDialog = () => {
        const nextIndex = project ? project.chapters.length + 1 : 1;
        setEditingChapter(null);
        setChapterTitle(`Chapter ${nextIndex}`);
        setChapterText("");
        setIsChapterDialogOpen(true);
    };

    const openEditChapterDialog = () => {
        if (!activeChapter) return;
        setEditingChapter(activeChapter);
        setChapterTitle(activeChapter.title);
        setChapterText(activeChapter.rawText || "");
        setIsChapterDialogOpen(true);
    };

    const handleSaveChapter = (event: FormEvent) => {
        event.preventDefault();

        if (!project) return;
        if (!chapterTitle.trim()) {
            toast.error("Please enter a chapter title.");
            return;
        }

        startTransition(async () => {
            try {
                if (editingChapter) {
                    await updateChapter(editingChapter.id, {
                        title: chapterTitle.trim(),
                        rawText: chapterText,
                    });
                    toast.success("Chapter updated.");
                } else {
                    const newChapter = await createChapter(
                        project.id,
                        chapterTitle.trim(),
                        chapterText
                    );
                    setActiveChapterId(newChapter.id);
                    toast.success("Chapter added.");
                }
                setIsChapterDialogOpen(false);
                await refreshProject();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to save chapter."
                );
            }
        });
    };

    const handleDeleteChapter = () => {
        if (!activeChapter) return;
        if (!project) return;

        const confirmed = window.confirm(
            `Delete "${activeChapter.title}"? This will remove its text blocks and audio.`
        );
        if (!confirmed) return;

        startTransition(async () => {
            try {
                await deleteChapter(activeChapter.id);
                toast.success("Chapter deleted.");
                await refreshProject();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to delete chapter."
                );
            }
        });
    };

    const handleMoveChapter = (chapterId: string, direction: "up" | "down") => {
        if (!project) return;
        const chapters = [...project.chapters];
        const currentIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
        if (currentIndex === -1) return;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= chapters.length) return;

        const reordered = [...chapters];
        [reordered[currentIndex], reordered[targetIndex]] = [
            reordered[targetIndex],
            reordered[currentIndex],
        ];

        startTransition(async () => {
            try {
                await reorderChapters(
                    project.id,
                    reordered.map((chapter) => chapter.id)
                );
                await refreshProject();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to reorder chapters."
                );
            }
        });
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
            <div className="flex items-start justify-between gap-6">
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
                <div className="flex items-center gap-3">
                    {project.chapters.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Active chapter</span>
                            <Select
                                value={activeChapterId || ""}
                                onValueChange={(value) => setActiveChapterId(value)}
                                disabled={project.chapters.length === 0}
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Select a chapter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {project.chapters.map((chapter, index) => (
                                        <SelectItem key={chapter.id} value={chapter.id}>
                                            {index + 1}. {chapter.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
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
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">Manuscript Content</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={openAddChapterDialog}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={isPending}
                            >
                                <Plus className="h-4 w-4" />
                                Add Chapter
                            </Button>
                            <Button
                                onClick={openEditChapterDialog}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                disabled={!activeChapter || isPending}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit Chapter
                            </Button>
                            <Button
                                onClick={handleDeleteChapter}
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                disabled={!activeChapter || isPending}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                            {activeChapter && (
                                <RunAnalysisButton
                                    projectId={project.id}
                                    chapterId={activeChapter.id}
                                    disabled={
                                        project.status === "analyzing" ||
                                        !activeChapter.rawText
                                    }
                                    label={
                                        activeChapter.textBlocks.length > 0
                                            ? "Re-run Analysis"
                                            : "Run Analysis"
                                    }
                                    onComplete={handleAnalysisComplete}
                                />
                            )}
                        </div>
                    </div>

                    {project.chapters.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                No chapters yet
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                            <Card className="h-fit">
                                <CardContent className="p-4 space-y-2">
                                    {project.chapters.map((chapter, index) => (
                                        <button
                                            key={chapter.id}
                                            onClick={() => setActiveChapterId(chapter.id)}
                                            className={cn(
                                                "w-full rounded-lg border p-3 text-left transition-colors",
                                                activeChapter?.id === chapter.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:bg-accent/30"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {index + 1}. {chapter.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {chapter.textBlocks.length} blocks
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={index === 0 || isPending}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleMoveChapter(chapter.id, "up");
                                                        }}
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        disabled={
                                                            index === project.chapters.length - 1 ||
                                                            isPending
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleMoveChapter(chapter.id, "down");
                                                        }}
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 space-y-3">
                                    {activeChapter ? (
                                        <>
                                            <h3 className="font-semibold text-lg">
                                                {activeChapter.title}
                                            </h3>
                                            {activeChapter.rawText ? (
                                                <div className="rounded-md border bg-muted/30 p-4 max-h-[480px] overflow-y-auto">
                                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                                                        {activeChapter.rawText}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">
                                                    No content
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Select a chapter to view its content.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
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
                        chapter={activeChapter}
                        projectStatus={project.status}
                    />
                </TabsContent>
            </Tabs>

            <Dialog
                open={isChapterDialogOpen}
                onOpenChange={(open) => {
                    setIsChapterDialogOpen(open);
                    if (!open) {
                        setEditingChapter(null);
                        setChapterTitle("");
                        setChapterText("");
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <form onSubmit={handleSaveChapter}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingChapter ? "Edit Chapter" : "Add Chapter"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingChapter
                                    ? "Update the chapter title or text."
                                    : "Add a new chapter to your project."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="chapter-title">Chapter Title</Label>
                                <Input
                                    id="chapter-title"
                                    value={chapterTitle}
                                    onChange={(event) => setChapterTitle(event.target.value)}
                                    placeholder="Chapter title"
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="chapter-text">Chapter Text</Label>
                                <Textarea
                                    id="chapter-text"
                                    value={chapterText}
                                    onChange={(event) => setChapterText(event.target.value)}
                                    placeholder="Paste chapter text here..."
                                    className="min-h-[220px] font-mono text-sm"
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsChapterDialogOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending
                                    ? "Saving..."
                                    : editingChapter
                                        ? "Save Changes"
                                        : "Add Chapter"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
