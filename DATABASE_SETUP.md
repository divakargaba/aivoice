# Database Setup Guide

This project uses **Supabase Postgres** with **Drizzle ORM** for database management.

## Prerequisites

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your database connection string from Supabase dashboard

## Step 1: Add Database URL to Environment Variables

Add to your `.env.local` file:

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**How to find your DATABASE_URL:**
1. Go to your Supabase project dashboard
2. Click on "Project Settings" (gear icon)
3. Go to "Database" section
4. Find "Connection string" → "URI"
5. Copy the connection string (it will have your password masked - replace `[YOUR-PASSWORD]` with your actual password)

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Generate Migrations

Generate migration files from your schema:

```bash
npm run db:generate
```

This creates SQL migration files in `db/migrations/` based on your schema.

## Step 4: Run Migrations

Apply migrations to your database:

```bash
npm run db:migrate
```

This executes all pending migrations against your Supabase database.

## Database Schema

The database includes the following tables:

### Core Tables

**users** - Synced with Clerk authentication
- `id` (text, PK) - Clerk user ID
- `email` (text)
- `created_at` (timestamp)

**projects** - User projects
- `id` (uuid, PK)
- `user_id` (text, FK → users)
- `title` (text)
- `status` (enum: draft, analyzing, ready, generating, published)
- `created_at` (timestamp)

**chapters** - Project chapters
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `idx` (int) - Order index
- `title` (text)
- `raw_text` (text)

**characters** - Characters in projects
- `id` (uuid, PK)
- `project_id` (uuid, FK → projects)
- `name` (text)
- `description` (text, nullable)

**voice_assignments** - Voice settings per character
- `id` (uuid, PK)
- `character_id` (uuid, FK → characters)
- `provider` (text) - e.g., "elevenlabs", "openai"
- `voice_id` (text)
- `settings` (jsonb) - Provider-specific settings

**text_blocks** - Parsed text segments
- `id` (uuid, PK)
- `chapter_id` (uuid, FK → chapters)
- `idx` (int) - Order index
- `kind` (enum: narration, dialogue)
- `speaker_character_id` (uuid, FK → characters, nullable)
- `text` (text)
- `meta` (jsonb)

**audio_segments** - Generated audio
- `id` (uuid, PK)
- `text_block_id` (uuid, FK → text_blocks, unique)
- `provider` (text)
- `voice_id` (text)
- `audio_url` (text)
- `duration_ms` (int, nullable)
- `created_at` (timestamp)

## Available Scripts

```bash
# Generate migration files from schema
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema directly to database (for development)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Development Workflow

1. **Modify schema**: Edit `db/schema.ts`
2. **Generate migration**: Run `npm run db:generate`
3. **Apply migration**: Run `npm run db:migrate`

## Using the Database in Your Code

```typescript
import { db } from "@/db";
import { projects, chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

// Insert
await db.insert(projects).values({
  userId: "user_123",
  title: "My Project",
  status: "draft",
});

// Query
const userProjects = await db
  .select()
  .from(projects)
  .where(eq(projects.userId, "user_123"));

// Query with relations
const projectWithChapters = await db.query.projects.findFirst({
  where: eq(projects.id, projectId),
  with: {
    chapters: true,
    characters: true,
  },
});
```

## Troubleshooting

**Error: "DATABASE_URL environment variable is not set"**
- Make sure `.env.local` exists with `DATABASE_URL` set
- Restart your dev server after adding env variables

**Connection issues**
- Check your Supabase project is active
- Verify the connection string is correct
- Ensure your IP is allowed (Supabase → Project Settings → Database → Connection pooling)

**Migration conflicts**
- If you need to reset: delete files in `db/migrations/` and regenerate
- For production, always use migrations (never `db:push`)

