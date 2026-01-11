import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCard } from "@/components/ui-kit/bento-grid";
import {
  ArrowRight,
  Mic2,
  Sparkles,
  Zap,
  Users,
  Wand2,
  Download,
  Play,
  BookOpen,
  CheckCircle2
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Mic2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">AI Voice</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/voices">
              <Button variant="ghost" size="sm">Browse Voices</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="gradient-primary border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Powered by ElevenLabs & OpenAI</span>
          </div>

          <h1 className="text-hero gradient-text">
            Turn Your Book Into an Audiobook
          </h1>

          <p className="text-subhead text-muted-foreground max-w-2xl mx-auto">
            Create professional multi-character audiobooks with AI voices.
            No studio, no actors—just your manuscript and our AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gradient-primary border-0 gap-2 px-8">
                Create Your First Audiobook
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/voices">
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-5 w-5" />
                Preview Voices
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="container px-6 pb-20">
        <BentoGrid columns={3}>
          <BentoCard size="lg" span={2} className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-glow opacity-50" />
            <div className="relative space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Multi-Character Narration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically detect characters in your manuscript and assign unique voices to each one.
                Perfect for novels, fiction, and any story with dialogue.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>AI detects characters automatically</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>50+ professional voices to choose from</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Preview voices before assigning</span>
                </li>
              </ul>
            </div>
          </BentoCard>

          <BentoCard size="lg">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">
                Generate hours of audio in minutes. What takes weeks in a studio takes minutes with AI.
              </p>
              <div className="pt-4 border-t border-border">
                <p className="text-3xl font-bold text-accent">10x</p>
                <p className="text-sm text-muted-foreground">Faster than recording</p>
              </div>
            </div>
          </BentoCard>

          <BentoCard size="lg">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Wand2 className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold">Director Controls</h3>
              <p className="text-muted-foreground text-sm">
                Fine-tune every line with director notes. Control emotion, pace, and emphasis without changing words.
              </p>
            </div>
          </BentoCard>

          <BentoCard size="lg">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Natural Emotions</h3>
              <p className="text-muted-foreground text-sm">
                AI automatically detects emotions and adjusts voice delivery for authentic narration.
              </p>
            </div>
          </BentoCard>

          <BentoCard size="lg" span={2}>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">Ready to Publish</h3>
              <p className="text-muted-foreground leading-relaxed">
                Export high-quality MP3 files ready for Audible, Spotify, or any distribution platform.
                Your audiobook is production-ready.
              </p>
            </div>
          </BentoCard>
        </BentoGrid>
      </section>

      {/* CTA Section */}
      <section className="container px-6 pb-20">
        <div className="card-premium-lg p-12 text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-section">Ready to Create Your Audiobook?</h2>
          <p className="text-subhead text-muted-foreground">
            Join thousands of authors bringing their stories to life with AI
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="gradient-primary border-0 gap-2 px-8">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 AI Voice. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
              <Link href="/voices" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Voices
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
