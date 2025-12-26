import { z } from "zod";

export const emotionEnum = z.enum([
    "neutral",
    "happy",
    "sad",
    "angry",
    "tense",
    "excited",
    "whisper",
    "shout",
    "curious",
    "nervous",
    "calm",
    "playful",
    "thoughtful",
]);

export const blockKindEnum = z.enum(["narration", "dialogue"]);

export const characterSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export const textBlockSchema = z.object({
    idx: z.number().int().min(0),
    kind: blockKindEnum,
    speaker: z.string().min(1),
    text: z.string().min(1),
    emotion: emotionEnum.optional().default("neutral"),
});

export const analysisResultSchema = z.object({
    characters: z.array(characterSchema),
    blocks: z.array(textBlockSchema),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type CharacterData = z.infer<typeof characterSchema>;
export type TextBlockData = z.infer<typeof textBlockSchema>;

