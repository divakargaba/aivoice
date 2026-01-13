"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui-kit/page-header";
import { VoiceCard } from "@/components/ui-kit/voice-card";
import { BentoGrid } from "@/components/ui-kit/bento-grid";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Mic2 } from "lucide-react";
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

const DEFAULT_PREVIEW_TEXT = "Hello, this is a preview of how this voice sounds.";

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

    const handlePreview = async (voiceId: string) => {
        const voice = voices.find(v => v.voice_id === voiceId);
        if (!voice) return;

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
        <div className="space-y-8">
            <PageHeader
                title="Browse Voices"
                subtitle="Preview and explore available voices for your audiobook"
            />

            {/* Search & Preview Controls */}
            <div className="surface p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, style, or category..."
                            className="pl-9"
                        />
                    </div>
                    <Input
                        value={previewText}
                        onChange={(e) => setPreviewText(e.target.value)}
                        placeholder="Preview text (optional)"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    Change the preview text to hear how each voice sounds with your own words
                </p>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="surface p-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading voices...</p>
                    </div>
                </div>
            ) : filteredVoices.length === 0 ? (
                <div className="surface-elevated">
                    <EmptyState
                        icon={<Mic2 className="h-12 w-12 text-muted-foreground" />}
                        title="No voices found"
                        description="Try adjusting your search to find voices that match your criteria."
                        helpLink="/help"
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {filteredVoices.length} {filteredVoices.length === 1 ? "voice" : "voices"} available
                        </p>
                    </div>
                    <BentoGrid columns={3}>
                        {filteredVoices.map((voice) => (
                            <VoiceCard
                                key={voice.voice_id}
                                id={voice.voice_id}
                                name={voice.name}
                                description={voice.description}
                                category={voice.category}
                                gender={voice.labels?.gender}
                                age={voice.labels?.age}
                                accent={voice.labels?.accent}
                                onPreview={handlePreview}
                            />
                        ))}
                    </BentoGrid>
                </>
            )}
        </div>
    );
}
