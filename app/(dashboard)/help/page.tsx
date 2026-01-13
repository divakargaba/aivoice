import { PageHeader } from "@/components/ui-kit/page-header";
import { BentoGrid, BentoCard } from "@/components/ui-kit/bento-grid";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  BookOpen, 
  Mic2, 
  FileText, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help & Guides"
        subtitle="Everything you need to know to create professional audiobooks"
      />

      {/* Quick Start */}
      <BentoGrid columns={1}>
        <BentoCard size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-headline text-foreground">Quick Start Guide</h2>
                <p className="text-body text-muted-foreground">Get your first audiobook created in minutes</p>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: 1, icon: FileText, label: "Upload", desc: "Add your manuscript" },
                { step: 2, icon: Sparkles, label: "Review", desc: "Check characters" },
                { step: 3, icon: Mic2, label: "Assign", desc: "Choose voices" },
                { step: 4, icon: Sparkles, label: "Generate", desc: "Create audio" },
                { step: 5, icon: CheckCircle2, label: "Export", desc: "Download files" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="text-center space-y-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border">
              <Link href="/dashboard">
                <Button className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* FAQs */}
      <div className="space-y-4">
        <div>
          <h2 className="text-headline text-foreground">Frequently Asked Questions</h2>
          <p className="text-body text-muted-foreground mt-1">
            Common questions about creating audiobooks
          </p>
        </div>
        <BentoGrid columns={2}>
          {[
            {
              question: "How does character detection work?",
              answer: "Our system analyzes your text to find dialogue patterns. It identifies when different characters are speaking by looking for quotation marks, dialogue tags, and context clues.",
            },
            {
              question: "What are director notes?",
              answer: "Director notes let you control how each line sounds without changing the words. Try phrases like 'whisper', 'speak slowly', or 'emphasize danger'.",
            },
            {
              question: "Can I change voices after assigning?",
              answer: "Yes! Go back to the Cast tab and select a different voice. You'll need to regenerate audio for changes to take effect.",
            },
            {
              question: "How long does generation take?",
              answer: "A typical chapter with 50-100 blocks takes 5-10 minutes. Longer chapters may take 15-20 minutes. You can see progress in real-time.",
            },
          ].map((faq, index) => (
            <BentoCard key={index} size="md">
              <div className="space-y-2">
                <h3 className="text-title text-foreground flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  {faq.question}
                </h3>
                <p className="text-body text-muted-foreground">{faq.answer}</p>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </div>

      {/* Tips */}
      <BentoCard size="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-headline text-foreground">Tips & Best Practices</h2>
          </div>
          <div className="space-y-4">
            {[
              "Use clear dialogue tags like 'John said' to help identify characters",
              "Preview voices on the Voices page before assigning them",
              "Add director notes to important lines for emphasis",
              "Generate one chapter at a time for better control",
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-body text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </BentoCard>
    </div>
  );
}
