"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { runAnalysis } from "@/actions/analysis";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RunAnalysisButtonProps {
  projectId: string;
  chapterId: string;
  disabled?: boolean;
  onComplete?: () => void;
  label?: string;
}

export function RunAnalysisButton({
  projectId,
  chapterId,
  disabled,
  onComplete,
  label = "Run analysis",
}: RunAnalysisButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAnalysis = () => {
    startTransition(async () => {
      try {
        toast.info("Starting analysis... This may take a moment.");

        const result = await runAnalysis(projectId, chapterId);

        toast.success(
          `Analysis complete. Found ${result.charactersFound} characters and created ${result.blocksCreated} text blocks.`
        );

        router.refresh();

        if (onComplete) {
          setTimeout(() => {
            onComplete();
          }, 500);
        }
      } catch (error) {
        console.error("Analysis failed:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to analyze chapter"
        );
      }
    });
  };

  return (
    <Button
      onClick={handleAnalysis}
      disabled={disabled || isPending}
      size="sm"
    >
      {isPending ? "Analyzing..." : label}
    </Button>
  );
}
