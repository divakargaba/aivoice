"use client";

import { BookOpen, Mic2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";

export default function ExamplesPage() {
  const examples = [
    {
      title: "Fiction",
      description: "Multi-character dialogue with distinct voices",
      genre: "Fiction",
      characters: 3,
      voices: "Rachel, Josh, Emily",
    },
    {
      title: "Non-Fiction",
      description: "Clear narration with emphasis control",
      genre: "Non-Fiction",
      characters: 1,
      voices: "Antoni",
    },
    {
      title: "Children's",
      description: "Distinct character voices for young listeners",
      genre: "Children's",
      characters: 2,
      voices: "Sarah, Drew",
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
          <h1 className="text-headline mb-4">Examples</h1>
          <p className="text-body-large text-[rgb(var(--text-secondary))]">
            Sample projects demonstrating different use cases.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="pb-8 border-b border-[rgb(var(--border-base))]"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="h-10 w-10 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-[rgb(var(--accent))]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-1">
                    {example.title}
                  </h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">
                    {example.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[rgb(var(--text-muted))]">
                <span>{example.genre}</span>
                <span>•</span>
                <span>
                  {example.characters}{" "}
                  {example.characters === 1 ? "character" : "characters"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mic2 className="h-3 w-3" />
                  {example.voices}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
          className="text-center space-y-6 pt-8 border-t border-[rgb(var(--border-base))]"
        >
          <div>
            <h2 className="text-title mb-3">Create your own</h2>
            <p className="text-body text-[rgb(var(--text-secondary))] max-w-xl mx-auto">
              Start a new project to begin building your audiobook.
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="lg">
              Create project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
