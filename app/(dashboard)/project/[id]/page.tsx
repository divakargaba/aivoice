"use client";

import { FormEvent, useCallback, useEffect, useState, useTransition } from "react";
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
import { Badge } from "@/components/ui/badge";
import { RunAnalysisButton } from "@/components/run-analysis-button";
import { CastTab } from "@/components/cast-tab";
import { StudioTab } from "@/components/studio-tab";
import {
  createChapter,
  deleteChapter,
  updateChapter,
} from "@/actions/chapters";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  pageTransition,
  pageTransitionConfig,
  panelSlide,
  panelSlideConfig,
  contentCrossfade,
  contentCrossfadeConfig,
} from "@/lib/motion";
import {
  Pencil,
  Plus,
  Trash2,
  FileText,
  Mic2,
  Loader2,
  BookOpen,
  Users,
  ChevronRight,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-[rgb(var(--accent))] mx-auto" />
          <p className="text-sm text-[rgb(var(--text-secondary))]">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4">
          <BookOpen className="h-10 w-10 text-[rgb(var(--text-muted))] mx-auto" />
          <p className="text-sm text-[rgb(var(--text-secondary))]">Project not found</p>
        </div>
      </div>
    );
  }

  const activeChapter = project.chapters.find(ch => ch.id === activeChapterId) || project.chapters[0];

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="h-[calc(100vh-4rem)] flex flex-col bg-[rgb(var(--bg-base))]"
    >
      {/* Toolbar */}
      <div className="border-b border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{project.title}</h1>
          <div className="text-xs text-[rgb(var(--text-secondary))]">
            {project.chapters.length} chapters • {project.characters.length} characters
          </div>
        </div>
        {project.chapters.length > 0 && (
          <Select
            value={activeChapterId || ""}
            onValueChange={(value) => setActiveChapterId(value)}
            disabled={project.chapters.length === 0}
          >
            <SelectTrigger className="w-[200px] h-8 text-sm">
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
        )}
      </div>

      {/* Studio Layout - Panel-based */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chapter Panel */}
        <motion.aside
          initial={panelSlide.initial}
          animate={panelSlide.animate}
          transition={panelSlideConfig}
          className="w-56 border-r border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] flex flex-col"
        >
          <div className="border-b border-[rgb(var(--border-base))] px-3 py-2.5 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-[rgb(var(--text-primary))] uppercase tracking-wider">Chapters</h2>
            <Button
              onClick={openAddChapterDialog}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-custom p-2 space-y-1">
            {project.chapters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-[rgb(var(--text-muted))]">No chapters</p>
              </div>
            ) : (
              project.chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={cn(
                    "w-full rounded px-2.5 py-2 text-left transition-colors text-xs",
                    activeChapter?.id === chapter.id
                      ? "bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))] border-l-2 border-[rgb(var(--accent))]"
                      : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated))]"
                  )}
                >
                  <div className="font-medium truncate mb-0.5">
                    {index + 1}. {chapter.title}
                  </div>
                  <div className="text-[10px] text-[rgb(var(--text-muted))]">
                    {chapter.textBlocks.length} blocks
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.aside>

        {/* Center: Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[rgb(var(--bg-base))]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] px-4">
              <TabsList className="bg-transparent h-9">
                <TabsTrigger value="manuscript" className="text-xs px-3">
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Manuscript
                </TabsTrigger>
                <TabsTrigger
                  value="cast"
                  disabled={project.chapters.length === 0 || !activeChapter?.textBlocks.length}
                  className="text-xs px-3"
                >
                  <Users className="mr-2 h-3.5 w-3.5" />
                  Cast
                </TabsTrigger>
                <TabsTrigger
                  value="studio"
                  disabled={project.chapters.length === 0 || !activeChapter?.textBlocks.length}
                  className="text-xs px-3"
                >
                  <Mic2 className="mr-2 h-3.5 w-3.5" />
                  Studio
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-custom">
              <AnimatePresence mode="wait">
                <TabsContent value="manuscript" className="mt-0 p-6" key="manuscript">
                  <motion.div
                    initial={contentCrossfade.initial}
                    animate={contentCrossfade.animate}
                    exit={contentCrossfade.exit}
                    transition={contentCrossfadeConfig}
                    className="max-w-4xl mx-auto"
                  >
                    {activeChapter ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-headline mb-2">{activeChapter.title}</h2>
                            <RunAnalysisButton
                              projectId={project.id}
                              chapterId={activeChapter.id}
                              disabled={project.status === "analyzing" || !activeChapter.rawText}
                              label={project.status === "analyzing" ? "Analyzing..." : "Run analysis"}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={openEditChapterDialog}
                              variant="ghost"
                              size="sm"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={handleDeleteChapter}
                              variant="ghost"
                              size="sm"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        {activeChapter.rawText ? (
                          <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-6">
                            <p className="text-sm text-[rgb(var(--text-primary))] whitespace-pre-wrap leading-relaxed font-mono">
                              {activeChapter.rawText}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
                            <FileText className="mb-3 h-10 w-10 text-[rgb(var(--text-muted))]" />
                            <h3 className="text-title mb-2">No content yet</h3>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
                              Edit this chapter to add your manuscript text.
                            </p>
                            <Button onClick={openEditChapterDialog} size="sm">
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Chapter
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
                        <BookOpen className="mb-3 h-10 w-10 text-[rgb(var(--text-muted))]" />
                        <h3 className="text-title mb-2">No chapters yet</h3>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mb-4">
                          Add your first chapter to get started.
                        </p>
                        <Button onClick={openAddChapterDialog} size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Chapter
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="cast" className="mt-0 p-6" key="cast">
                  <motion.div
                    initial={contentCrossfade.initial}
                    animate={contentCrossfade.animate}
                    exit={contentCrossfade.exit}
                    transition={contentCrossfadeConfig}
                    className="max-w-4xl mx-auto"
                  >
                    <CastTab projectId={project.id} characters={project.characters} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="studio" className="mt-0 p-6" key="studio">
                  <motion.div
                    initial={contentCrossfade.initial}
                    animate={contentCrossfade.animate}
                    exit={contentCrossfade.exit}
                    transition={contentCrossfadeConfig}
                    className="h-full"
                  >
                    <StudioTab
                      projectId={project.id}
                      chapter={activeChapter}
                      projectStatus={project.status}
                    />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Chapter Dialog */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSaveChapter}>
            <DialogHeader>
              <DialogTitle>{editingChapter ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
              <DialogDescription>
                {editingChapter ? "Update the chapter title or text." : "Add a new chapter to your project."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="chapter-title">Chapter Title</Label>
                <Input
                  id="chapter-title"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Chapter title"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter-text">Chapter Text</Label>
                <Textarea
                  id="chapter-text"
                  value={chapterText}
                  onChange={(e) => setChapterText(e.target.value)}
                  placeholder="Paste chapter text here..."
                  className="min-h-[300px] font-mono text-sm"
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
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? "Saving..." : editingChapter ? "Save Changes" : "Add Chapter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
