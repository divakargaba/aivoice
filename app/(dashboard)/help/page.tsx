"use client";

import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  BookOpen,
  Mic2,
  FileText,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";

export default function HelpPage() {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-12">
        <div>
          <h1 className="text-headline mb-2">Help & Guides</h1>
          <p className="text-body text-[rgb(var(--text-secondary))]">
            Everything you need to know to create professional audiobooks
          </p>
        </div>

        {/* Workflow */}
        <div className="rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
              <FileText className="h-6 w-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-title">Workflow</h2>
              <p className="text-body text-[rgb(var(--text-secondary))] mt-1">
                The process for creating audiobooks
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: 1, icon: FileText, label: "Upload", desc: "Add your manuscript" },
              { step: 2, icon: BookOpen, label: "Review", desc: "Check characters" },
              { step: 3, icon: Mic2, label: "Assign", desc: "Choose voices" },
              { step: 4, icon: FileText, label: "Generate", desc: "Create audio" },
              { step: 5, icon: CheckCircle2, label: "Export", desc: "Download files" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="text-center space-y-3"
                >
                  <div className="h-12 w-12 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-[rgb(var(--accent))]" />
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{item.label}</p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-[rgb(var(--border-base))]">
            <Link href="/dashboard">
              <Button>
                Go to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div>
            <h2 className="text-title mb-2">Frequently Asked Questions</h2>
            <p className="text-body text-[rgb(var(--text-secondary))]">
              Common questions about creating audiobooks
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                question: "How does character detection work?",
                answer:
                  "The system identifies dialogue patterns by analyzing quotation marks, dialogue tags, and context. Characters are detected from your formatting.",
              },
              {
                question: "What are director notes?",
                answer:
                  "Director notes let you control how each line sounds without changing the words. Try phrases like 'whisper', 'speak slowly', or 'emphasize danger'.",
              },
              {
                question: "Can I change voices after assigning?",
                answer:
                  "Yes. Go back to the Cast tab and select a different voice. You'll need to regenerate audio for changes to take effect.",
              },
              {
                question: "How long does generation take?",
                answer:
                  "A typical chapter with 50-100 blocks takes 5-10 minutes. Longer chapters may take 15-20 minutes. You can see progress in real-time.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-6 space-y-3"
              >
                <h3 className="text-base font-medium text-[rgb(var(--text-primary))] flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[rgb(var(--accent))] shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          className="rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-8 space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[rgb(var(--bg-elevated))] flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-[rgb(var(--accent))]" />
            </div>
            <h2 className="text-title">Tips & Best Practices</h2>
          </div>
          <div className="space-y-4">
            {[
              "Use clear dialogue tags like 'John said' to help identify characters",
              "Preview voices on the Voices page before assigning them",
              "Add director notes to important lines for emphasis",
              "Generate one chapter at a time for better control",
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[rgb(var(--accent))] shrink-0 mt-0.5" />
                <p className="text-sm text-[rgb(var(--text-secondary))]">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
