"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";
import { FileText, Users, Mic2, ArrowRight, CheckCircle2 } from "lucide-react";

export function LandingPageContent() {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="min-h-screen bg-background"
    >
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-14 items-center justify-between">
            <span className="text-lg font-semibold text-foreground">
              Audiobook Studio
            </span>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Get started
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 border-b border-border">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-hero mb-4">
              Create multi-character audiobooks
            </h1>
            <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform manuscripts into professional audiobooks with distinct character voices and controlled delivery.
            </p>
            <div className="flex items-center justify-center gap-3">
              <SignUpButton mode="modal">
                <Button size="lg">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg">
                  Learn more
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-b border-border">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Character Detection",
                description: "Automatically identifies speakers and dialogue from manuscript formatting.",
              },
              {
                icon: Users,
                title: "Voice Assignment",
                description: "Assign distinct voices to each character from a professional library.",
              },
              {
                icon: Mic2,
                title: "Director Notes",
                description: "Control delivery, pace, and emotion with simple text instructions.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-border bg-card p-6"
                >
                  <div className="h-10 w-10 rounded-lg bg-surface-2 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-title mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16 px-6 border-b border-border">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-headline mb-3">How it works</h2>
            <p className="text-body text-muted-foreground">
              A straightforward workflow from manuscript to finished audiobook.
            </p>
          </motion.div>
          <div className="space-y-4">
            {[
              { step: 1, title: "Upload manuscript", description: "Paste your text. The system analyzes structure and dialogue." },
              { step: 2, title: "Review characters", description: "Check detected characters and verify dialogue assignments." },
              { step: 3, title: "Assign voices", description: "Browse the voice library and assign distinct voices to each character." },
              { step: 4, title: "Generate audio", description: "Create professional audio with character-specific voices and delivery control." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-2 text-sm font-semibold text-primary">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="border border-border bg-card p-10"
          >
            <h2 className="text-headline mb-3">Ready to start?</h2>
            <p className="text-body text-muted-foreground mb-6">
              Create your first project and begin building your audiobook.
            </p>
            <SignUpButton mode="modal">
              <Button size="lg">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              © 2024 Audiobook Studio
            </span>
            <div className="flex items-center gap-6">
              <Link href="/help" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
