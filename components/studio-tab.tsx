"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, RotateCcw, Save, Play, Pause, Download, Sparkles } from "lucide-react";
import { regenerateBlockAudio, saveDirectorNotes, generateAudioForChapter } from "@/actions/audio";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
    textBlocks: TextBlock[];
}

interface StudioTabProps {
    projectId: string;
    chapter: Chapter | null;
    projectStatus: string;
}

export function StudioTab({
    projectId,
    chapter,
    projectStatus,
}: StudioTabProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedBlock, setSelectedBlock] = useState<TextBlock | null>(null);
    const [regeneratingBlockId, setRegeneratingBlockId] = useState<string | null>(null);
    const [directorNotes, setDirectorNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPlayingBlockId, setCurrentPlayingBlockId] = useState<string | null>(null);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const allBlocks = chapter?.textBlocks || [];
    const blocksWithAudio = allBlocks.filter(block => block.audioSegment);
    const hasNoAudio = blocksWithAudio.length === 0;
    const hasSomeAudio = blocksWithAudio.length > 0 && blocksWithAudio.length < allBlocks.length;

    // Update director notes when block selection changes
    useEffect(() => {
        if (selectedBlock) {
            setDirectorNotes(selectedBlock.meta?.director_notes || "");
        }
    }, [selectedBlock]);

    useEffect(() => {
        setSelectedBlock(null);
        setDirectorNotes("");
        setCurrentPlayingBlockId(null);
        setIsPlaying(false);
    }, [chapter?.id]);

    // Handle sequential playback
    const playNextBlock = () => {
        if (!currentPlayingBlockId) return;

        const currentIndex = blocksWithAudio.findIndex(b => b.id === currentPlayingBlockId);
        if (currentIndex < blocksWithAudio.length - 1) {
            const nextBlock = blocksWithAudio[currentIndex + 1];
            setCurrentPlayingBlockId(nextBlock.id);
            setSelectedBlock(nextBlock);
        } else {
            // Reached the end
            setIsPlaying(false);
            setCurrentPlayingBlockId(null);
            toast.success("Chapter playback complete!");
        }
    };

    const handlePlayChapter = () => {
        if (blocksWithAudio.length === 0) {
            toast.error("No audio generated yet. Generate audio first.");
            return;
        }

        if (isPlaying) {
            // Pause
            setIsPlaying(false);
            audioRef.current?.pause();
        } else {
            // Start playing from the first block with audio
            const firstBlock = blocksWithAudio[0];
            setIsPlaying(true);
            setCurrentPlayingBlockId(firstBlock.id);
            setSelectedBlock(firstBlock);
        }
    };

    const handleDownloadChapter = async () => {
        if (blocksWithAudio.length === 0) {
            toast.error("No audio to download. Generate audio first.");
            return;
        }

        const chapterId = chapter?.id;
        if (!chapterId) return;

        try {
            const response = await fetch(`/api/chapters/${chapterId}/download`);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const chapterTitle = chapter?.title || "chapter";
            a.download = `chapter-${chapterTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Chapter downloaded!");
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download chapter");
        }
    };

    const handleGenerateAllAudio = () => {
        if (!chapter) return;

        const chapterId = chapter.id;
        const chapterTitle = chapter.title;

        setIsGeneratingAll(true);

        startTransition(async () => {
            try {
                toast.info(`Generating audio for ${chapterTitle}...`);

                const result = await generateAudioForChapter(projectId, chapterId);

                if (result.errorCount > 0) {
                    toast.warning(
                        `Generated ${result.successCount}/${result.totalBlocks} audio segments. ${result.errorCount} failed.`
                    );
                } else {
                    toast.success(
                        `Successfully generated ${result.successCount} audio segments!`
                    );
                }

                router.refresh();
            } catch (error) {
                console.error("Audio generation failed:", error);
                toast.error(
                    error instanceof Error ? error.message : "Failed to generate audio"
                );
            } finally {
                setIsGeneratingAll(false);
            }
        });
    };

    const handleSaveDirectorNotes = async () => {
        if (!selectedBlock) return;

        setIsSavingNotes(true);
        try {
            await saveDirectorNotes(projectId, selectedBlock.id, directorNotes);
            toast.success("Director notes saved!");
            router.refresh();
        } catch (error) {
            console.error("Failed to save director notes:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to save notes"
            );
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleRegenerateBlock = () => {
        if (!selectedBlock) return;

        setRegeneratingBlockId(selectedBlock.id);

        startTransition(async () => {
            try {
                await regenerateBlockAudio(projectId, selectedBlock.id);
                toast.success("Audio regenerated successfully!");
                router.refresh();
            } catch (error) {
                console.error("Regeneration failed:", error);
                toast.error(
                    error instanceof Error ? error.message : "Failed to regenerate audio"
                );
            } finally {
                setRegeneratingBlockId(null);
            }
        });
    };

    if (!chapter) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">No chapter selected</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        Select a chapter to start generating audio.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (projectStatus === "analyzing") {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">Analysis in progress</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        Your chapter is being analyzed. This usually takes a minute or two.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (allBlocks.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">No text blocks yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        Run analysis on this chapter first.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Show "Generate All Audio" prompt if no audio exists
    if (hasNoAudio) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
                        <Sparkles className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">Ready to Generate Audio</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                        Your manuscript has been analyzed and voices are assigned.
                        Click the button below to generate audio for all {allBlocks.length} blocks.
                    </p>
                    <Button
                        onClick={handleGenerateAllAudio}
                        disabled={isGeneratingAll}
                        size="lg"
                        className="mt-6 gap-2"
                    >
                        {isGeneratingAll ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating All Audio...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Generate All Audio ({allBlocks.length} blocks)
                            </>
                        )}
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground">
                        This may take a few minutes depending on chapter length
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-300px)]">
            {/* Left: Text Blocks List */}
            <Card className="flex flex-col">
                <CardContent className="p-4 flex-1 overflow-hidden flex flex-col">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="font-semibold">Text Blocks</h3>
                                <p className="text-sm text-muted-foreground">
                                    {allBlocks.length} blocks • {blocksWithAudio.length} with audio
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {hasSomeAudio && (
                                    <Button
                                        onClick={handleGenerateAllAudio}
                                        disabled={isGeneratingAll}
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {isGeneratingAll ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Generate All
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button
                                    onClick={handlePlayChapter}
                                    disabled={blocksWithAudio.length === 0}
                                    variant={isPlaying ? "destructive" : "default"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="h-4 w-4" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" />
                                            Play Chapter
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleDownloadChapter}
                                    disabled={blocksWithAudio.length === 0}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {allBlocks.map((block) => (
                            <div
                                key={block.id}
                                onClick={() => setSelectedBlock(block)}
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
                                    selectedBlock?.id === block.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-card",
                                    currentPlayingBlockId === block.id &&
                                    "ring-2 ring-green-500 bg-green-500/10 animate-pulse"
                                )}
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="text-xs font-mono text-muted-foreground min-w-[2rem]">
                                        #{block.idx}
                                    </span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        <Badge
                                            variant={
                                                block.kind === "dialogue" ? "default" : "secondary"
                                            }
                                            className="text-xs"
                                        >
                                            {block.speakerCharacter?.name || "Narrator"}
                                        </Badge>
                                        {block.meta?.emotion && block.meta.emotion !== "neutral" && (
                                            <Badge variant="outline" className="text-xs">
                                                {block.meta.emotion}
                                            </Badge>
                                        )}
                                        {block.audioSegment && (
                                            <Badge
                                                variant="outline"
                                                className="text-xs bg-green-500/10 text-green-600 border-green-600/20"
                                            >
                                                ✓ Audio
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm line-clamp-2">{block.text}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Right: Audio Player */}
            <Card className="flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                    {!selectedBlock ? (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div>
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold mb-1">No block selected</h3>
                                <p className="text-sm text-muted-foreground">
                                    Select a text block to preview or generate audio
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <div className="flex items-start gap-2 mb-3">
                                    <span className="text-sm font-mono text-muted-foreground">
                                        Block #{selectedBlock.idx}
                                    </span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        <Badge
                                            variant={
                                                selectedBlock.kind === "dialogue"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {selectedBlock.speakerCharacter?.name || "Narrator"}
                                        </Badge>
                                        {selectedBlock.meta?.emotion &&
                                            selectedBlock.meta.emotion !== "neutral" && (
                                                <Badge variant="outline">
                                                    {selectedBlock.meta.emotion}
                                                </Badge>
                                            )}
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed">{selectedBlock.text}</p>
                            </div>

                            {/* Director Notes */}
                            <div className="space-y-2 border-t pt-4">
                                <Label htmlFor="director-notes" className="text-sm font-medium">
                                    Director Notes
                                </Label>
                                <Textarea
                                    id="director-notes"
                                    placeholder="Add notes to guide the voice generation (e.g., 'speak slowly and mysteriously', 'emphasize the word danger', 'whisper this line')..."
                                    value={directorNotes}
                                    onChange={(e) => setDirectorNotes(e.target.value)}
                                    className="min-h-[80px] text-sm"
                                />
                                <Button
                                    onClick={handleSaveDirectorNotes}
                                    disabled={isSavingNotes}
                                    variant="secondary"
                                    size="sm"
                                    className="gap-2"
                                >
                                    {isSavingNotes ? (
                                        <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3 w-3" />
                                            Save Notes
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-auto space-y-4 pt-4">
                                {selectedBlock.audioSegment ? (
                                    <>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                            <audio
                                                ref={audioRef}
                                                key={selectedBlock.audioSegment.audioUrl}
                                                controls
                                                className="w-full"
                                                autoPlay={isPlaying}
                                                src={selectedBlock.audioSegment.audioUrl}
                                                onEnded={() => {
                                                    if (isPlaying) {
                                                        playNextBlock();
                                                    }
                                                }}
                                                onPlay={() => {
                                                    if (isPlaying) {
                                                        setCurrentPlayingBlockId(selectedBlock.id);
                                                    }
                                                }}
                                            >
                                                Your browser does not support audio playback.
                                            </audio>
                                        </div>
                                        <Button
                                            onClick={handleRegenerateBlock}
                                            disabled={isPending}
                                            variant="outline"
                                            className="w-full gap-2"
                                        >
                                            {regeneratingBlockId === selectedBlock.id ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Regenerating...
                                                </>
                                            ) : (
                                                <>
                                                    <RotateCcw className="h-4 w-4" />
                                                    Regenerate Audio
                                                </>
                                            )}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="text-center p-8 bg-muted/20 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-3">
                                            No audio generated yet for this block
                                        </p>
                                        <Button
                                            onClick={handleRegenerateBlock}
                                            disabled={isPending}
                                            className="gap-2"
                                        >
                                            {regeneratingBlockId === selectedBlock.id ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>Generate Audio</>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
