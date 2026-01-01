"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pause, Play, Search } from "lucide-react";
import { toast } from "sonner";

type VoiceLabelMap = Record<string, string>;

interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    category?: string;
    description?: string;
    preview_url?: string | null;
    labels?: VoiceLabelMap;
}

const DEFAULT_PREVIEW_TEXT =
    "The quick brown fox jumps over the lazy dog.";

export default function VoicesPage() {
    const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [previewText, setPreviewText] = useState(DEFAULT_PREVIEW_TEXT);
    const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const loadVoices = async () => {
            try {
                const response = await fetch("/api/voices");
                if (!response.ok) {
                    throw new Error("Failed to load voices");
                }
                const data = await response.json();
                setVoices(data.voices || []);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to load voices"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadVoices();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
            }
        };
    }, []);

    const filteredVoices = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return voices;
        return voices.filter((voice) =>
            `${voice.name} ${voice.description || ""} ${voice.category || ""}`
                .toLowerCase()
                .includes(normalizedQuery)
        );
    }, [voices, query]);

    const handlePreview = async (voice: ElevenLabsVoice) => {
        if (playingVoiceId === voice.voice_id) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }
            audioRef.current = null;
            setPlayingVoiceId(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }

        setPlayingVoiceId(voice.voice_id);

        try {
            const response = await fetch("/api/voices/preview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    voiceId: voice.voice_id,
                    text: previewText.trim() || DEFAULT_PREVIEW_TEXT,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate preview");
            }

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);
            audioRef.current = audio;
            audioUrlRef.current = url;

            audio.onended = () => {
                if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                    audioUrlRef.current = null;
                }
                audioRef.current = null;
                setPlayingVoiceId(null);
            };
            audio.onerror = () => {
                if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                    audioUrlRef.current = null;
                }
                audioRef.current = null;
                setPlayingVoiceId(null);
            };

            await audio.play();
        } catch (error) {
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }
            audioRef.current = null;
            setPlayingVoiceId(null);
            toast.error(
                error instanceof Error ? error.message : "Failed to play preview"
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Voices</h1>
                    <p className="mt-2 text-muted-foreground">
                        Browse and preview available ElevenLabs voices.
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-[1fr_260px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by name, style, or category"
                                className="pl-9"
                            />
                        </div>
                        <Input
                            value={previewText}
                            onChange={(event) => setPreviewText(event.target.value)}
                            placeholder="Preview text"
                        />
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="mt-3 text-sm text-muted-foreground">
                            Loading voices...
                        </p>
                    </CardContent>
                </Card>
            ) : filteredVoices.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-sm text-muted-foreground">
                        No voices match your search.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredVoices.map((voice) => (
                        <Card key={voice.voice_id}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>{voice.name}</span>
                                    {voice.category && (
                                        <Badge variant="secondary" className="capitalize">
                                            {voice.category}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {voice.description || "No description provided."}
                                </p>
                                {voice.labels && (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(voice.labels).map(([key, value]) => (
                                            <Badge key={key} variant="outline">
                                                {key}: {value}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => handlePreview(voice)}
                                >
                                    {playingVoiceId === voice.voice_id ? (
                                        <>
                                            <Pause className="h-4 w-4" />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4" />
                                            Preview
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
