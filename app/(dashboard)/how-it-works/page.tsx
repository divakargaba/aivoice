"use client";

import { Button } from "@/components/ui/button";
import { FileText, Users, Mic2, Download, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "Upload your manuscript",
      description:
        "Paste your text or upload a file. The system identifies characters and dialogue from your formatting.",
    },
    {
      number: 2,
      icon: Users,
      title: "Review characters",
      description:
        "Check detected characters, then assign a distinct voice to each from the voice library.",
    },
    {
      number: 3,
      icon: Mic2,
      title: "Assign voices",
      description:
        "Browse the voice library and assign voices to characters. Preview before deciding.",
    },
    {
      number: 4,
      icon: Download,
      title: "Generate and export",
      description:
        "Create audio for your manuscript. Each character speaks with their assigned voice. Download as high-quality MP3 files.",
    },
  ];

  const features = [
    {
      title: "Character detection",
      description: "Identifies speakers and dialogue in your manuscript",
    },
    {
      title: "50+ voices",
      description: "Choose from a diverse collection of voices",
    },
    {
      title: "Director notes",
      description: "Control delivery with simple instructions",
    },
    {
      title: "Multiple chapters",
      description: "Organize your audiobook into chapters",
    },
    {
      title: "High-quality audio",
      description: "Export professional-grade MP3 files",
    },
    {
      title: "Edit and regenerate",
      description: "Make changes and regenerate audio as needed",
    },
  ];

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-16">
        <div>
          <h1 className="text-headline mb-4">How it works</h1>
          <p className="text-body-large text-[rgb(var(--text-secondary))]">
            The workflow for creating audiobooks.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-start gap-6 pb-8 border-b border-[rgb(var(--border-base))] last:border-0"
              >
                <div className="h-12 w-12 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-[rgb(var(--accent))]" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-[rgb(var(--accent))] bg-[rgb(var(--bg-elevated))] px-2 py-0.5 rounded">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-body text-[rgb(var(--text-secondary))] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features */}
        <div className="space-y-8">
          <div>
            <h2 className="text-title mb-2">Capabilities</h2>
            <p className="text-body text-[rgb(var(--text-secondary))]">
              What you can do with the platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 + index * 0.03 }}
                className="pb-6 border-b border-[rgb(var(--border-base))]"
              >
                <h3 className="text-base font-medium text-[rgb(var(--text-primary))] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.4 }}
          className="text-center space-y-6 pt-8 border-t border-[rgb(var(--border-base))]"
        >
          <div>
            <h2 className="text-title mb-3">Ready to start?</h2>
            <p className="text-body text-[rgb(var(--text-secondary))] max-w-xl mx-auto">
              Create your first project and begin building your audiobook.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg">
                Create project
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="ghost">
                View help
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
