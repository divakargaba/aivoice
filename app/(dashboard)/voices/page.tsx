"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Play, Pause, Mic2, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { pageTransition, pageTransitionConfig } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
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

  const categories = useMemo(() => {
    const cats = new Set<string>();
    voices.forEach((voice) => {
      if (voice.labels?.category) cats.add(voice.labels.category);
      if (voice.category) cats.add(voice.category);
    });
    return Array.from(cats).sort();
  }, [voices]);

  const genders = useMemo(() => {
    const gens = new Set<string>();
    voices.forEach((voice) => {
      if (voice.labels?.gender) gens.add(voice.labels.gender);
    });
    return Array.from(gens).sort();
  }, [voices]);

  const filteredVoices = useMemo(() => {
    let filtered = voices;

    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      filtered = filtered.filter((voice) =>
        `${voice.name} ${voice.description || ""} ${voice.category || ""}`
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (voice) =>
          voice.labels?.category === filterCategory ||
          voice.category === filterCategory
      );
    }

    if (filterGender !== "all") {
      filtered = filtered.filter((voice) => voice.labels?.gender === filterGender);
    }

    return filtered;
  }, [voices, query, filterCategory, filterGender]);

  const handlePreview = async (voiceId: string) => {
    const voice = voices.find((v) => v.voice_id === voiceId);
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

  const hasActiveFilters = filterCategory !== "all" || filterGender !== "all" || query;

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={pageTransitionConfig}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-headline mb-1">Voice Library</h1>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Browse and preview professional voices
            </p>
          </div>
          <div className="text-sm text-[rgb(var(--text-secondary))]">
            {filteredVoices.length} {filteredVoices.length === 1 ? "voice" : "voices"}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgb(var(--text-muted))]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              placeholder="Preview text..."
              className="h-9 text-sm"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {genders.map((gen) => (
                  <SelectItem key={gen} value={gen}>
                    {gen}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[rgb(var(--text-secondary))]">Filters:</span>
              {filterCategory !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {filterCategory}
                  <button
                    onClick={() => setFilterCategory("all")}
                    className="ml-1.5 hover:text-[rgb(var(--text-primary))]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterGender !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {filterGender}
                  <button
                    onClick={() => setFilterGender("all")}
                    className="ml-1.5 hover:text-[rgb(var(--text-primary))]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {query && (
                <Badge variant="secondary" className="text-xs">
                  "{query}"
                  <button
                    onClick={() => setQuery("")}
                    className="ml-1.5 hover:text-[rgb(var(--text-primary))]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Voices Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--accent))] mb-3" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">Loading voices...</p>
          </div>
        ) : filteredVoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <Mic2 className="h-10 w-10 text-[rgb(var(--text-muted))] mb-3" />
            <h3 className="text-title mb-2">No voices found</h3>
            <p className="text-sm text-[rgb(var(--text-secondary))] max-w-md mb-4">
              Try adjusting your filters or search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterCategory("all");
                setFilterGender("all");
                setQuery("");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))]">
            <div className="border-b border-[rgb(var(--border-base))] px-4 py-2.5">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                <div className="col-span-4">Voice</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Gender</div>
                <div className="col-span-1"></div>
              </div>
            </div>
            <div className="divide-y divide-[rgb(var(--border-base))]">
              {filteredVoices.map((voice, index) => (
                <motion.div
                  key={voice.voice_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[rgb(var(--bg-elevated))] transition-colors items-center"
                >
                  <div className="col-span-4">
                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {voice.name}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-sm text-[rgb(var(--text-secondary))] line-clamp-1">
                      {voice.description || "—"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    {voice.labels?.category || voice.category ? (
                      <Badge variant="outline" className="text-xs">
                        {voice.labels?.category || voice.category}
                      </Badge>
                    ) : (
                      <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    {voice.labels?.gender ? (
                      <Badge variant="outline" className="text-xs">
                        {voice.labels.gender}
                      </Badge>
                    ) : (
                      <span className="text-xs text-[rgb(var(--text-muted))]">—</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(voice.voice_id)}
                      className="h-8 w-8 p-0"
                    >
                      {playingVoiceId === voice.voice_id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
