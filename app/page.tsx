import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic2, Sparkles, Zap } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mic2 className="h-6 w-6" />
            <span className="text-xl font-bold">AI Voice</span>
          </div>
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-32">
          <div className="flex items-center gap-2 rounded-full border bg-secondary px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4" />
            <span className="text-muted-foreground">Powered by AI</span>
          </div>
          
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Create stunning AI voices for your projects
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Transform your content with natural-sounding AI voices. Perfect for
              podcasts, videos, audiobooks, and more.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Generate high-quality voice content in seconds
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mic2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Natural Voices</h3>
              <p className="text-sm text-muted-foreground">
                Choose from dozens of realistic AI voices
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Easy to Use</h3>
              <p className="text-sm text-muted-foreground">
                Simple interface designed for creators
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © 2025 AI Voice. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

