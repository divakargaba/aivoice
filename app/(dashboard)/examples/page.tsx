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
        subtitle="Explore sample projects to see how AI Voice works"
      />

      <BentoGrid columns={2}>
        {examples.map((example, index) => (
          <BentoCard key={index} size="lg">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{example.title}</h3>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
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
                <Button className="gradient-primary border-0 gap-2" disabled>
                  Use as Template
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </BentoCard>
        ))}
      </BentoGrid>

      <div className="card-premium-lg p-8 text-center space-y-4">
        <h3 className="text-xl font-bold">Want to see it in action?</h3>
        <p className="text-muted-foreground">
          Create your own project to experience the full workflow
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="gradient-primary border-0 gap-2">
            Create Your First Project
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

