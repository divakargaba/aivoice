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
import { Badge } from "@/components/ui/badge";
import { setVoiceAssignment } from "@/actions/characters";
import { toast } from "sonner";
import { User, Mic2, CheckCircle2, Play, Search } from "lucide-react";
import { motion } from "framer-motion";
import { contentCrossfade, contentCrossfadeConfig } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
  const [searchQuery, setSearchQuery] = useState("");

  const handleVoiceChange = (characterId: string, voiceId: string) => {
    const voice = VOICE_OPTIONS.find((v) => v.id === voiceId);
    if (!voice) return;

    startTransition(async () => {
      try {
        await setVoiceAssignment(characterId, voice.provider, voice.id);
        toast.success("Voice assigned");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to assign voice"
        );
      }
    });
  };

  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (char.description && char.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (characters.length === 0) {
    return (
      <motion.div
        initial={contentCrossfade.initial}
        animate={contentCrossfade.animate}
        exit={contentCrossfade.exit}
        transition={contentCrossfadeConfig}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <User className="mb-4 h-12 w-12 text-[rgb(var(--text-muted))]" />
        <h2 className="text-title mb-2">No characters found</h2>
        <p className="text-body text-[rgb(var(--text-secondary))] max-w-md">
          Run analysis on your manuscript to detect characters.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={contentCrossfade.initial}
      animate={contentCrossfade.animate}
      exit={contentCrossfade.exit}
      transition={contentCrossfadeConfig}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-headline mb-2">Cast</h2>
            <p className="text-body text-[rgb(var(--text-secondary))]">
              Assign voices to characters detected in your manuscript
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
            <span>{characters.length} {characters.length === 1 ? "character" : "characters"}</span>
            <span>•</span>
            <span>{characters.filter((c) => c.voiceAssignments.length > 0).length} assigned</span>
          </div>
        </div>
        {characters.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[rgb(var(--text-muted))]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-elevated))] text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] focus:ring-offset-2 focus:ring-offset-[rgb(var(--bg-base))]"
            />
          </div>
        )}
      </div>

      {/* Characters List */}
      <div className="flex-1 overflow-y-auto scrollbar-custom space-y-3">
        {filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[rgb(var(--text-secondary))]">No characters match your search</p>
          </div>
        ) : (
          filteredCharacters.map((character, index) => {
            const currentVoice = character.voiceAssignments[0];
            const currentVoiceOption = currentVoice
              ? VOICE_OPTIONS.find(
                  (v) =>
                    v.provider === currentVoice.provider &&
                    v.id === currentVoice.voiceId
                )
              : null;

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-[rgb(var(--border-base))] bg-[rgb(var(--bg-surface))] p-6 hover:bg-[rgb(var(--bg-elevated))] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--bg-elevated))]">
                    <User className="h-6 w-6 text-[rgb(var(--accent))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-1">
                          {character.name}
                        </h3>
                        {character.description && (
                          <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2">
                            {character.description}
                          </p>
                        )}
                      </div>
                      {currentVoiceOption && (
                        <Badge variant="default" className="shrink-0">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Assigned
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={currentVoiceOption?.id || ""}
                        onValueChange={(value) => handleVoiceChange(character.id, value)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          {VOICE_OPTIONS.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center gap-2">
                                <Mic2 className="h-4 w-4 text-[rgb(var(--text-muted))]" />
                                {voice.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {currentVoiceOption && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Preview voice functionality could go here
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
