"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { regenerateBlockAudio, saveDirectorNotes, generateAudioForChapter } from "@/actions/audio";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { contentCrossfade, contentCrossfadeConfig } from "@/lib/motion";
import { Play, Pause, Download, Loader2, Mic2, RotateCcw, Volume2, Settings } from "lucide-react";

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
  const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [directorNotes, setDirectorNotes] = useState<Record<string, string>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (chapter) {
      const notes: Record<string, string> = {};
      chapter.textBlocks.forEach((block) => {
        if (block.meta?.director_notes) {
          notes[block.id] = block.meta.director_notes;
        }
      });
      setDirectorNotes(notes);
    }
  }, [chapter]);

  const handlePlayPause = (blockId: string, audioUrl: string) => {
    if (!audioRefs.current[blockId]) {
      const audio = new Audio(audioUrl);
      audioRefs.current[blockId] = audio;
      audio.onended = () => setPlayingBlockId(null);
    }

    const audio = audioRefs.current[blockId];

    if (playingBlockId === blockId) {
      audio.pause();
      setPlayingBlockId(null);
    } else {
      if (playingBlockId) {
        audioRefs.current[playingBlockId]?.pause();
      }
      audio.play();
      setPlayingBlockId(blockId);
    }
  };

  const handleRegenerate = (blockId: string) => {
    startTransition(async () => {
      try {
        await regenerateBlockAudio(projectId, blockId);
        toast.success("Audio regenerated");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to regenerate audio"
        );
      }
    });
  };

  const handleSaveNotes = (blockId: string, notes: string) => {
    startTransition(async () => {
      try {
        await saveDirectorNotes(blockId, notes);
        toast.success("Notes saved");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save notes"
        );
      }
    });
  };

  const handleGenerateAll = () => {
    if (!chapter) return;

    startTransition(async () => {
      try {
        toast.info("Generating audio for all blocks...");
        await generateAudioForChapter(projectId, chapter.id);
        toast.success("Audio generation started");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to generate audio"
        );
      }
    });
  };

  if (!chapter) {
    return (
      <motion.div
        initial={contentCrossfade.initial}
        animate={contentCrossfade.animate}
        exit={contentCrossfade.exit}
        transition={contentCrossfadeConfig}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <Mic2 className="mb-4 h-12 w-12 text-[rgb(var(--text-muted))]" />
        <h2 className="text-title mb-2">No chapter selected</h2>
        <p className="text-body text-[rgb(var(--text-secondary))] max-w-md">
          Select a chapter to view and generate audio.
        </p>
      </motion.div>
    );
  }

  if (chapter.textBlocks.length === 0) {
    return (
      <motion.div
        initial={contentCrossfade.initial}
        animate={contentCrossfade.animate}
        exit={contentCrossfade.exit}
        transition={contentCrossfadeConfig}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <Mic2 className="mb-4 h-12 w-12 text-[rgb(var(--text-muted))]" />
        <h2 className="text-title mb-2">No text blocks</h2>
        <p className="text-body text-[rgb(var(--text-secondary))] max-w-md mb-6">
          Run analysis on your manuscript to create text blocks.
        </p>
      </motion.div>
    );
  }

  const hasUnassignedBlocks = chapter.textBlocks.some(
    (block) => block.kind === "dialogue" && !block.speakerCharacter
  );
  const hasUnassignedVoices = chapter.textBlocks.some(
    (block) =>
      block.kind === "dialogue" &&
      block.speakerCharacter &&
      !block.audioSegment
  );
  const selectedBlock = chapter.textBlocks.find((b) => b.id === selectedBlockId);
  const hasAudio = chapter.textBlocks.some((b) => b.audioSegment);

  return (
    <motion.div
      initial={contentCrossfade.initial}
      animate={contentCrossfade.animate}
      exit={contentCrossfade.exit}
      transition={contentCrossfadeConfig}
      className="h-full flex flex-col"
    >
      {/* Toolbar */}
      <div className="border-b border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-6 py-3 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateAll}
            disabled={isPending || hasUnassignedBlocks || hasUnassignedVoices}
            size="sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mic2 className="mr-2 h-4 w-4" />
                Generate all
              </>
            )}
          </Button>
          {hasAudio && (
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export chapter
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
          <span>{chapter.textBlocks.length} blocks</span>
          <span>•</span>
          <span>{chapter.textBlocks.filter((b) => b.audioSegment).length} with audio</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Blocks List */}
        <div className="flex-1 overflow-y-auto scrollbar-custom space-y-3 pr-2">
          {chapter.textBlocks.map((block) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedBlockId(block.id)}
              className={cn(
                "rounded-lg border p-4 cursor-pointer transition-all",
                selectedBlockId === block.id
                  ? "border-[rgb(var(--accent))] bg-[rgb(var(--bg-surface))]"
                  : "border-[rgb(var(--border-base))] bg-[rgb(var(--bg-elevated))] hover:bg-[rgb(var(--bg-surface))]"
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <Badge variant="outline" className="text-xs">
                    {block.kind}
                  </Badge>
                  {block.speakerCharacter && (
                    <Badge variant="secondary" className="text-xs">
                      {block.speakerCharacter.name}
                    </Badge>
                  )}
                  {block.meta?.emotion && (
                    <Badge variant="outline" className="text-xs">
                      {block.meta.emotion}
                    </Badge>
                  )}
                  <span className="text-xs text-[rgb(var(--text-muted))] ml-auto">
                    #{block.idx + 1}
                  </span>
                </div>
                {block.audioSegment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause(block.id, block.audioSegment!.audioUrl);
                    }}
                  >
                    {playingBlockId === block.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <p className="text-sm text-[rgb(var(--text-primary))] leading-relaxed mb-3">
                {block.text}
              </p>
              {block.audioSegment && (
                <div className="flex items-center gap-2 pt-3 border-t border-[rgb(var(--border-base))]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate(block.id);
                    }}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                  <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-secondary))] ml-auto">
                    <Volume2 className="h-3 w-3" />
                    <span>Audio ready</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Inspector Panel */}
        {selectedBlock && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 border-l border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-6 overflow-y-auto scrollbar-custom"
          >
            <div className="mb-6">
              <h3 className="text-base font-semibold text-[rgb(var(--text-primary))] mb-4">Block Inspector</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-[rgb(var(--text-secondary))] mb-2 block">Type</Label>
                  <Badge variant="outline">{selectedBlock.kind}</Badge>
                </div>
                {selectedBlock.speakerCharacter && (
                  <div>
                    <Label className="text-xs text-[rgb(var(--text-secondary))] mb-2 block">Character</Label>
                    <Badge variant="secondary">{selectedBlock.speakerCharacter.name}</Badge>
                  </div>
                )}
                {selectedBlock.meta?.emotion && (
                  <div>
                    <Label className="text-xs text-[rgb(var(--text-secondary))] mb-2 block">Emotion</Label>
                    <Badge variant="outline">{selectedBlock.meta.emotion}</Badge>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-[rgb(var(--text-secondary))] mb-2 block">Text</Label>
                  <p className="text-sm text-[rgb(var(--text-primary))] leading-relaxed bg-[rgb(var(--bg-elevated))] p-3 rounded border border-[rgb(var(--border-base))]">
                    {selectedBlock.text}
                  </p>
                </div>
                <div>
                  <Label htmlFor={`notes-${selectedBlock.id}`} className="text-xs text-[rgb(var(--text-secondary))] mb-2 block">
                    Director Notes
                  </Label>
                  <Textarea
                    id={`notes-${selectedBlock.id}`}
                    value={directorNotes[selectedBlock.id] || ""}
                    onChange={(e) => {
                      setDirectorNotes((prev) => ({
                        ...prev,
                        [selectedBlock.id]: e.target.value,
                      }));
                    }}
                    onBlur={(e) => handleSaveNotes(selectedBlock.id, e.target.value)}
                    placeholder="Add notes for voice delivery..."
                    className="min-h-[100px] text-sm"
                  />
                  <p className="text-xs text-[rgb(var(--text-muted))] mt-2">
                    Control delivery with notes like "whisper", "speak slowly", or "emphasize danger"
                  </p>
                </div>
                {selectedBlock.audioSegment && (
                  <div>
                    <Label className="text-xs text-[rgb(var(--text-secondary))] mb-2 block">Audio</Label>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handlePlayPause(selectedBlock.id, selectedBlock.audioSegment!.audioUrl)}
                      >
                        {playingBlockId === selectedBlock.id ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleRegenerate(selectedBlock.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Regenerate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
