"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, FileText } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createProject } from "@/actions/projects";
import { createChapter } from "@/actions/chapters";
import { toast } from "sonner";

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [pastedText, setPastedText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const validTypes = ["text/plain", "text/markdown"];
            const validExtensions = [".txt", ".md"];
            const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf("."));

            if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
                toast.error("Please upload a .txt or .md file.");
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Please enter a project title");
            return;
        }

        let manuscriptText = pastedText.trim();

        // If file is selected, read it
        if (file) {
            try {
                manuscriptText = await file.text();
            } catch (error) {
                toast.error("Failed to read file");
                return;
            }
        }

        if (!manuscriptText) {
            toast.error("Please provide manuscript text or upload a file");
            return;
        }

        startTransition(async () => {
            try {
                // Create project
                const project = await createProject(title.trim());

                // Create first chapter with the manuscript text
                await createChapter(
                    project.id,
                    "Chapter 1",
                    manuscriptText
                );

                toast.success("Project created successfully!");
                setOpen(false);

                // Reset form
                setTitle("");
                setPastedText("");
                setFile(null);

                // Navigate to project page
                router.push(`/project/${project.id}`);
            } catch (error) {
                console.error("Failed to create project:", error);
                toast.error(
                    error instanceof Error ? error.message : "Failed to create project"
                );
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                        <DialogDescription>
                            Add your manuscript to get started. You can paste text directly or upload a file.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Title Input */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input
                                id="title"
                                placeholder="My Audiobook"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isPending}
                            />
                        </div>

                        {/* Manuscript Input */}
                        <div className="space-y-2">
                            <Label>Manuscript</Label>
                            <Tabs defaultValue="paste" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="paste">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Paste Text
                                    </TabsTrigger>
                                    <TabsTrigger value="upload">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload File
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="paste" className="space-y-2">
                                    <Textarea
                                        placeholder="Paste your manuscript text here..."
                                        value={pastedText}
                                        onChange={(e) => setPastedText(e.target.value)}
                                        disabled={isPending}
                                        className="min-h-[200px] font-mono text-sm"
                                    />
                                </TabsContent>

                                <TabsContent value="upload" className="space-y-2">
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="file-upload"
                                            className={`flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${isPending ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    {file ? (
                                                        <span className="font-medium">{file.name}</span>
                                                    ) : (
                                                        <>
                                                            <span className="font-medium">Click to upload</span> or drag and drop
                                                        </>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    .TXT or .MD files only
                                                </p>
                                            </div>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                className="hidden"
                                                accept=".txt,.md,text/plain,text/markdown"
                                                onChange={handleFileChange}
                                                disabled={isPending}
                                            />
                                        </label>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
