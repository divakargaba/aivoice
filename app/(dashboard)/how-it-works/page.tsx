import { PageHeader } from "@/components/ui-kit/page-header";
import { BentoGrid, BentoCard } from "@/components/ui-kit/bento-grid";
import { Button } from "@/components/ui/button";
import { FileText, Users, Mic2, Download, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "Upload your manuscript",
      description: "Paste your text or upload a file. Our system automatically detects characters and dialogue, so you don't need to format anything special.",
    },
    {
      number: 2,
      icon: Users,
      title: "Review and assign voices",
      description: "Check the characters that were detected, then choose a unique voice for each character from our library of natural voices.",
    },
    {
      number: 3,
      icon: Mic2,
      title: "Generate audio",
      description: "Create professional audio for your entire manuscript. Each character speaks with their assigned voice, and narration flows naturally.",
    },
    {
      number: 4,
      icon: Download,
      title: "Export and publish",
      description: "Download your finished audiobook as high-quality MP3 files. Ready to upload to Audible, Spotify, or any platform you choose.",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="How It Works"
        subtitle="Creating an audiobook is simple and straightforward"
      />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <BentoCard key={step.number} size="lg">
              <div className="flex gap-6">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary">Step {step.number}</span>
                    <h3 className="text-title text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-body text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div>
          <h2 className="text-headline text-foreground">What You Can Do</h2>
          <p className="text-body text-muted-foreground mt-1">
            Features that make creating audiobooks easy
          </p>
        </div>
        <BentoGrid columns={3}>
          {[
            {
              title: "Automatic character detection",
              description: "Our system finds all characters in your manuscript automatically",
            },
            {
              title: "50+ natural voices",
              description: "Choose from a wide selection of professional voices",
            },
            {
              title: "Director notes",
              description: "Fine-tune how each line sounds with simple instructions",
            },
            {
              title: "Multiple chapters",
              description: "Organize your audiobook into chapters for better structure",
            },
            {
              title: "High-quality audio",
              description: "Export professional-grade MP3 files ready for publishing",
            },
            {
              title: "Easy editing",
              description: "Make changes anytime and regenerate audio as needed",
            },
          ].map((feature, index) => (
            <BentoCard key={index} size="md">
              <div className="space-y-2">
                <h3 className="text-title text-foreground">{feature.title}</h3>
                <p className="text-body text-muted-foreground">{feature.description}</p>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>

      {/* CTA */}
      <div className="surface-elevated p-12 text-center space-y-6">
        <h2 className="text-headline text-foreground">Ready to get started?</h2>
        <p className="text-body text-muted-foreground max-w-2xl mx-auto">
          Create your first audiobook in minutes. No technical skills required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Create Your First Project
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/help">
            <Button size="lg" variant="outline">
              View Help Guide
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

