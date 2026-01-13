"use client";

import { FormEvent, useCallback, useEffect, useState, useTransition } from "react";
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
import { PageHeader } from "@/components/ui-kit/page-header";
import { StepIndicator } from "@/components/ui-kit/step-indicator";
import { EmptyState } from "@/components/ui-kit/empty-state";
import {
    ArrowDown,
    ArrowUp,
    Pencil,
    Plus,
    Trash2,
    Users,
    FileText,
    Mic2,
    Loader2,
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
            }, 2000);

            return () => clearInterval(interval);
        }
    }, [project?.status, refreshProject]);

    const handleAnalysisComplete = () => {
        setActiveTab("cast");
    };

    const openAddChapterDialog = () => {
        const nextIndex = project ? project.chapters.length + 1 : 1;
        setEditingChapter(null);
        setChapterTitle(`Chapter ${nextIndex}`);
        setChapterText("");
        setIsChapterDialogOpen(true);
    };

    const openEditChapterDialog = () => {
        if (!project) return;
        const activeChapter = project.chapters.find(ch => ch.id === activeChapterId) || project.chapters[0];
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
        if (!project) return;
        const activeChapter = project.chapters.find(ch => ch.id === activeChapterId) || project.chapters[0];
        if (!activeChapter) return;

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

    // Calculate current step
    const getCurrentStep = (): number => {
        if (!project) return 0;
        if (project.chapters.length === 0 || !project.chapters[0]?.rawText) return 0;
        if (project.status === "analyzing") return 1;
        const hasTextBlocks = project.chapters.some(ch => ch.textBlocks.length > 0);
        if (!hasTextBlocks) return 1;
        const hasVoiceAssignments = project.characters.some(char => char.voiceAssignments.length > 0);
        if (!hasVoiceAssignments) return 2;
        const hasAudio = project.chapters.some(ch => 
            ch.textBlocks.some(block => block.audioSegment)
        );
        if (!hasAudio) return 3;
        return 4;
    };

    const steps = [
        { id: "upload", label: "Upload", description: "Add manuscript" },
        { id: "analyze", label: "Review", description: "Check characters" },
        { id: "cast", label: "Assign Voices", description: "Choose voices" },
        { id: "generate", label: "Generate", description: "Create audio" },
        { id: "listen", label: "Listen & Export", description: "Review & download" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading project...</p>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Project not found</p>
                </div>
            </div>
        );
    }

    const currentStep = getCurrentStep();
    const activeChapter = project.chapters.find(ch => ch.id === activeChapterId) || project.chapters[0];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <PageHeader
                title={project.title}
                subtitle={`${project.chapters.length} ${project.chapters.length === 1 ? "chapter" : "chapters"}`}
                breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]}
                actions={
                    project.chapters.length > 0 && (
                        <Select
                            value={activeChapterId || ""}
                            onValueChange={(value) => setActiveChapterId(value)}
                            disabled={project.chapters.length === 0}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select chapter" />
                            </SelectTrigger>
                            <SelectContent>
                                {project.chapters.map((chapter, index) => (
                                    <SelectItem key={chapter.id} value={chapter.id}>
                                        {index + 1}. {chapter.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )
                }
            />

            {/* Step Indicator */}
            <div className="surface-elevated p-6">
                <StepIndicator steps={steps} currentStep={currentStep} />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="manuscript" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Manuscript
                    </TabsTrigger>
                    <TabsTrigger value="cast" className="gap-2">
                        <Users className="h-4 w-4" />
                        Cast
                    </TabsTrigger>
                    <TabsTrigger value="studio" className="gap-2">
                        <Mic2 className="h-4 w-4" />
                        Studio
                    </TabsTrigger>
                </TabsList>

                {/* Manuscript Tab */}
                <TabsContent value="manuscript" className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-headline text-foreground">Manuscript</h2>
                            <p className="text-body text-muted-foreground mt-1">
                                Add and edit your chapter text
                            </p>
                        </div>
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
                            {activeChapter && (
                                <>
                                    <Button
                                        onClick={openEditChapterDialog}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        disabled={isPending}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={handleDeleteChapter}
                                        variant="destructive"
                                        size="sm"
                                        className="gap-2"
                                        disabled={isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                    <RunAnalysisButton
                                        projectId={project.id}
                                        chapterId={activeChapter.id}
                                        disabled={
                                            project.status === "analyzing" ||
                                            !activeChapter.rawText
                                        }
                                        label={
                                            activeChapter.textBlocks.length > 0
                                                ? "Re-analyze"
                                                : "Review Characters"
                                        }
                                        onComplete={handleAnalysisComplete}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {project.chapters.length === 0 ? (
                        <div className="surface-elevated">
                            <EmptyState
                                icon={<FileText className="h-12 w-12 text-muted-foreground" />}
                                title="No chapters yet"
                                description="Add your first chapter by uploading your manuscript text. You can add multiple chapters to organize your audiobook."
                                primaryAction={{
                                    label: "Add Chapter",
                                    onClick: openAddChapterDialog
                                }}
                                helpLink="/help"
                            />
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                            <div className="surface h-fit">
                                <div className="p-4 space-y-2">
                                    {project.chapters.map((chapter, index) => (
                                        <button
                                            key={chapter.id}
                                            onClick={() => setActiveChapterId(chapter.id)}
                                            className={cn(
                                                "w-full rounded-lg border p-3 text-left transition-colors",
                                                activeChapter?.id === chapter.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:bg-muted"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {index + 1}. {chapter.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {chapter.textBlocks.length} blocks
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        disabled={index === 0 || isPending}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleMoveChapter(chapter.id, "up");
                                                        }}
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        disabled={
                                                            index === project.chapters.length - 1 ||
                                                            isPending
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleMoveChapter(chapter.id, "down");
                                                        }}
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="surface">
                                <div className="p-6 space-y-4">
                                    {activeChapter ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-title text-foreground">
                                                    {activeChapter.title}
                                                </h3>
                                                {activeChapter.textBlocks.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {activeChapter.textBlocks.length} blocks
                                                    </Badge>
                                                )}
                                            </div>
                                            {activeChapter.rawText ? (
                                                <div className="rounded-lg border border-border bg-muted/30 p-6 max-h-[600px] overflow-y-auto scrollbar-custom">
                                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                        {activeChapter.rawText}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="surface p-8 text-center">
                                                    <p className="text-muted-foreground">
                                                        No content yet. Edit this chapter to add text.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="surface p-8 text-center">
                                            <p className="text-muted-foreground">
                                                Select a chapter to view its content.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
