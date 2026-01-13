import { PageHeader } from "@/components/ui-kit/page-header";
import { BentoGrid, BentoCard } from "@/components/ui-kit/bento-grid";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ExamplesPage() {
  const examples = [
    {
      title: "Sample Fiction Novel",
      description: "A short excerpt demonstrating multi-character dialogue and narration",
      genre: "Fiction",
      characters: 3,
    },
    {
      title: "Non-Fiction Sample",
      description: "A non-fiction excerpt showing clear narration and emphasis",
      genre: "Non-Fiction",
      characters: 1,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Example Projects"
        subtitle="Explore sample projects to see how it works"
      />

      <BentoGrid columns={2}>
        {examples.map((example, index) => (
          <BentoCard key={index} size="lg">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-title text-foreground">{example.title}</h3>
                  <p className="text-body text-muted-foreground">{example.description}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{example.genre}</span>
                <span>•</span>
                <span>{example.characters} {example.characters === 1 ? "character" : "characters"}</span>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="gap-2" disabled>
                  <Play className="h-4 w-4" />
                  Preview
                </Button>
                <Button className="gap-2" disabled>
                  Use as Template
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </BentoCard>
        ))}
      </BentoGrid>

      <div className="surface-elevated p-12 text-center space-y-4">
        <h3 className="text-headline text-foreground">Want to see it in action?</h3>
        <p className="text-body text-muted-foreground">
          Create your own project to experience the full workflow
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="gap-2">
            Create Your First Project
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
