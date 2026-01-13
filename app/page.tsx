import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Headphones,
  FileText,
  Users,
  Download,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Headphones className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold">Audiobook Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/voices">
              <Button variant="ghost" size="sm">Voices</Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-display text-foreground">
            Turn your book into an audiobook
          </h1>

          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Create professional audiobooks with natural voices. 
            Upload your manuscript, choose voices for your characters, and export high-quality audio ready for publishing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Create your first audiobook
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline">
                Learn how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="surface p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-title text-foreground">Upload your manuscript</h3>
              <p className="text-body text-muted-foreground">
                Paste your text or upload a file. Our system automatically detects characters and dialogue, so you don't need to format anything.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="surface p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-title text-foreground">Choose voices</h3>
              <p className="text-body text-muted-foreground">
                Browse our library of natural voices and assign one to each character. Preview voices before you decide.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="surface p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-title text-foreground">Export and publish</h3>
              <p className="text-body text-muted-foreground">
                Download your finished audiobook as high-quality MP3 files. Ready to upload to Audible, Spotify, or any platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="container px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="surface-elevated p-12 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-headline text-foreground">How it works</h2>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                Creating an audiobook takes just a few simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {[
                { step: "1", label: "Upload", desc: "Add your manuscript" },
                { step: "2", label: "Review", desc: "Check characters" },
                { step: "3", label: "Assign", desc: "Choose voices" },
                { step: "4", label: "Generate", desc: "Create audio" },
                { step: "5", label: "Export", desc: "Download files" },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <span className="text-sm font-semibold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link href="/how-it-works">
                <Button variant="outline">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="surface-elevated p-12 text-center space-y-6">
            <h2 className="text-headline text-foreground">Ready to get started?</h2>
            <p className="text-body text-muted-foreground">
              Create your first audiobook in minutes. No technical skills required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Create your first audiobook
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/examples">
                <Button size="lg" variant="outline">
                  View examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
                <Headphones className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Audiobook Studio</p>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="/examples" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Examples
              </Link>
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
