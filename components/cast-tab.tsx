"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Play, User } from "lucide-react";
import { setVoiceAssignment } from "@/actions/characters";
import { toast } from "sonner";

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
            // Existing assignments
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
                toast.success("Voice assignment saved");
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Characters & Voice Cast</h2>
                <div className="text-sm text-muted-foreground">
                    {otherCharacters.length} character{otherCharacters.length !== 1 ? "s" : ""}{" "}
                    detected
                </div>
            </div>

            {otherCharacters.length === 0 && !narratorChar ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto">
                            <User className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="mt-6 text-lg font-semibold">No characters yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                            Run analysis on your manuscript to automatically detect characters
                            and dialogue.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {allCharacters.map((character) => (
                        <Card
                            key={character.id}
                            className={character.isNarrator ? "border-primary/50" : ""}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    {character.isNarrator && (
                                        <User className="h-4 w-4 text-primary" />
                                    )}
                                    {character.name}
                                </CardTitle>
                                {character.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {character.description}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
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
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="gap-2"
                                    >
                                        <Play className="h-3 w-3" />
                                        Preview
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

