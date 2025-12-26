import { relations } from "drizzle-orm";
import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    pgEnum,
    jsonb,
} from "drizzle-orm/pg-core";

// Enums
export const projectStatusEnum = pgEnum("project_status", [
    "draft",
    "analyzing",
    "ready",
    "generating",
    "published",
]);

export const textBlockKindEnum = pgEnum("text_block_kind", [
    "narration",
    "dialogue",
]);

// Tables
export const users = pgTable("users", {
    id: text("id").primaryKey(), // Clerk user ID
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: projectStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chapters = pgTable("chapters", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    idx: integer("idx").notNull(),
    title: text("title").notNull(),
    rawText: text("raw_text"),
});

export const characters = pgTable("characters", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
});

export const voiceAssignments = pgTable("voice_assignments", {
    id: uuid("id").defaultRandom().primaryKey(),
    characterId: uuid("character_id")
        .notNull()
        .references(() => characters.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    voiceId: text("voice_id").notNull(),
    settings: jsonb("settings"),
});

export const textBlocks = pgTable("text_blocks", {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id")
        .notNull()
        .references(() => chapters.id, { onDelete: "cascade" }),
    idx: integer("idx").notNull(),
    kind: textBlockKindEnum("kind").notNull(),
    speakerCharacterId: uuid("speaker_character_id").references(
        () => characters.id,
        { onDelete: "set null" }
    ),
    text: text("text").notNull(),
    meta: jsonb("meta"),
});

export const audioSegments = pgTable("audio_segments", {
    id: uuid("id").defaultRandom().primaryKey(),
    textBlockId: uuid("text_block_id")
        .notNull()
        .unique()
        .references(() => textBlocks.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    voiceId: text("voice_id").notNull(),
    audioUrl: text("audio_url").notNull(),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    user: one(users, {
        fields: [projects.userId],
        references: [users.id],
    }),
    chapters: many(chapters),
    characters: many(characters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
    project: one(projects, {
        fields: [chapters.projectId],
        references: [projects.id],
    }),
    textBlocks: many(textBlocks),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
    project: one(projects, {
        fields: [characters.projectId],
        references: [projects.id],
    }),
    voiceAssignments: many(voiceAssignments),
    textBlocks: many(textBlocks),
}));

export const voiceAssignmentsRelations = relations(
    voiceAssignments,
    ({ one }) => ({
        character: one(characters, {
            fields: [voiceAssignments.characterId],
            references: [characters.id],
        }),
    })
);

export const textBlocksRelations = relations(textBlocks, ({ one }) => ({
    chapter: one(chapters, {
        fields: [textBlocks.chapterId],
        references: [chapters.id],
    }),
    speakerCharacter: one(characters, {
        fields: [textBlocks.speakerCharacterId],
        references: [characters.id],
    }),
    audioSegment: one(audioSegments, {
        fields: [textBlocks.id],
        references: [audioSegments.textBlockId],
    }),
}));

export const audioSegmentsRelations = relations(audioSegments, ({ one }) => ({
    textBlock: one(textBlocks, {
        fields: [audioSegments.textBlockId],
        references: [textBlocks.id],
    }),
}));

