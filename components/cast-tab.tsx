"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { BentoGrid, BentoCard } from "@/components/ui-kit/bento-grid";
import { User, Mic2, HelpCircle, Sparkles } from "lucide-react";
import { setVoiceAssignment } from "@/actions/characters";
import { toast } from "sonner";
import Link from "next/link";

interface VoiceAssignment {
    id: string;
    provider: string;
    voiceId: string;
    settings: any;
}

interface Character {
    id: string;
    name: string;
    description: string | null;
    voiceAssignments: VoiceAssignment[];
}

interface CastTabProps {
    projectId: string;
    characters: Character[];
}

// Real ElevenLabs voice IDs (free tier voices)
const VOICE_OPTIONS = [
    { provider: "elevenlabs", id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel - Calm Female" },
    { provider: "elevenlabs", id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh - Deep Male" },
    { provider: "elevenlabs", id: "LcfcDJNUP1GQjkzn1xUU", name: "Emily - Warm Female" },
    { provider: "elevenlabs", id: "ErXwobaYiN019PkySvjV", name: "Antoni - Well-Rounded Male" },
    { provider: "elevenlabs", id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah - Soft Female" },
    { provider: "elevenlabs", id: "29vD33N1CtxCmqQRPOHJ", name: "Drew - Well-Rounded Male" },
    { provider: "elevenlabs", id: "AZnzlk1XvdvUeBnXmlld", name: "Domi - Strong Female" },
    { provider: "elevenlabs", id: "2EiwWnXFnvU5JabPnv8n", name: "Clyde - War Veteran Male" },
];

export function CastTab({ projectId, characters }: CastTabProps) {
    const [isPending, startTransition] = useTransition();

    // Separate narrator from other characters
    const narratorChar = characters.find((c) => c.name === "Narrator");
    const otherCharacters = characters.filter((c) => c.name !== "Narrator");

    const [selectedVoices, setSelectedVoices] = useState<Record<string, string>>(
        () => {
            const initial: Record<string, string> = {};
            characters.forEach((char) => {
                if (char.voiceAssignments[0]) {
                    const va = char.voiceAssignments[0];
                    initial[char.id] = `${va.provider}_${va.voiceId}`;
                }
            });
            return initial;
        }
    );

    const handleVoiceChange = (characterId: string, value: string) => {
        setSelectedVoices((prev) => ({ ...prev, [characterId]: value }));

        const [provider, voiceId] = value.split("_");

        startTransition(async () => {
            try {
                await setVoiceAssignment(characterId, provider, voiceId);
                toast.success("Voice assigned");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to save voice assignment"
                );
            }
        });
    };

    const allCharacters = [
        ...(narratorChar ? [{ ...narratorChar, isNarrator: true }] : []),
        ...otherCharacters.map((c) => ({ ...c, isNarrator: false })),
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-headline text-foreground">Assign Voices</h2>
                    <p className="text-body text-muted-foreground mt-1">
                        Choose a voice for each character in your audiobook
                    </p>
                </div>
                {allCharacters.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                        {allCharacters.length} {allCharacters.length === 1 ? "character" : "characters"}
                    </div>
                )}
            </div>

            {otherCharacters.length === 0 && !narratorChar ? (
                <div className="surface-elevated">
                    <EmptyState
                        icon={<User className="h-12 w-12 text-muted-foreground" />}
                        title="No characters detected yet"
                        description="Review your manuscript in the Manuscript tab to automatically detect all characters and their dialogue."
                        primaryAction={{
                            label: "Go to Manuscript Tab",
                            onClick: () => {}
                        }}
                        secondaryAction={{
                            label: "Browse Voices",
                            href: "/voices"
                        }}
                        helpLink="/help"
                    />
                </div>
            ) : (
                <BentoGrid columns={2}>
                    {allCharacters.map((character) => (
                        <BentoCard key={character.id} size="md" className={character.isNarrator ? "ring-2 ring-primary/30" : ""}>
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {character.isNarrator && (
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="h-4 w-4 text-primary" />
                                                </div>
                                            )}
                                            <h3 className="text-title text-foreground">{character.name}</h3>
                                            {character.isNarrator && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        {character.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {character.description}
                                            </p>
                                        )}
                                        {character.isNarrator && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Used for all narration and unassigned dialogue
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Voice Selection */}
                                <div className="space-y-3 pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Voice</label>
                                        <Link href="/voices" className="text-muted-foreground hover:text-foreground">
                                            <HelpCircle className="h-4 w-4" />
                                        </Link>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Preview voices on the Voices page before assigning
                                    </p>
                                    <Select
                                        value={selectedVoices[character.id] || ""}
                                        onValueChange={(value) =>
                                            handleVoiceChange(character.id, value)
                                        }
                                        disabled={isPending}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a voice..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VOICE_OPTIONS.map((voice) => (
                                                <SelectItem
                                                    key={`${voice.provider}_${voice.id}`}
                                                    value={`${voice.provider}_${voice.id}`}
                                                >
                                                    {voice.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedVoices[character.id] && (
                                        <div className="flex items-center gap-2 text-xs text-primary">
                                            <Sparkles className="h-3 w-3" />
                                            <span>Voice assigned</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </BentoCard>
                    ))}
                </BentoGrid>
            )}

            {/* Helper Card */}
            {allCharacters.length > 0 && (
                <div className="surface p-6">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Mic2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-title text-foreground mb-2">Need More Voices?</h3>
                            <p className="text-body text-muted-foreground mb-4">
                                Browse our full library of 50+ voices with previews on the Voices page.
                            </p>
                            <Link href="/voices">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Mic2 className="h-4 w-4" />
                                    Browse All Voices
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
