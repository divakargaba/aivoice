# Server Actions

Secure server actions for managing projects and chapters. All actions automatically check Clerk authentication and verify user ownership.

## Projects Actions

### `createProject(title: string)`

Creates a new project for the authenticated user.

```typescript
import { createProject } from "@/actions/projects";

// In a Server Component or Server Action
const project = await createProject("My Audiobook Project");
```

### `listProjects()`

Lists all projects for the authenticated user, with chapters and characters.

```typescript
import { listProjects } from "@/actions/projects";

const projects = await listProjects();
// Returns: Array of projects with nested chapters and characters
```

### `getProject(projectId: string)`

Gets a single project with full details (chapters, characters, voice assignments).

```typescript
import { getProject } from "@/actions/projects";

const project = await getProject(projectId);
// Returns: Project with chapters and characters
// Throws error if project doesn't exist or user doesn't own it
```

### `updateProjectStatus(projectId: string, status: ProjectStatus)`

Updates a project's status. Status options: `"draft"`, `"analyzing"`, `"ready"`, `"generating"`, `"published"`.

```typescript
import { updateProjectStatus } from "@/actions/projects";

await updateProjectStatus(projectId, "ready");
```

### `deleteProject(projectId: string)`

Deletes a project (cascades to chapters, characters, etc.).

```typescript
import { deleteProject } from "@/actions/projects";

await deleteProject(projectId);
```

## Chapters Actions

### `createChapter(projectId: string, title: string, rawText?: string)`

Creates a new chapter in a project. Automatically assigns the next index.

```typescript
import { createChapter } from "@/actions/chapters";

const chapter = await createChapter(
  projectId,
  "Chapter 1: The Beginning",
  "Once upon a time..."
);
```

### `listChapters(projectId: string)`

Lists all chapters for a project with text blocks.

```typescript
import { listChapters } from "@/actions/chapters";

const chapters = await listChapters(projectId);
// Returns: Array of chapters ordered by idx
```

### `getChapter(chapterId: string)`

Gets a single chapter with full details (text blocks, audio segments).

```typescript
import { getChapter } from "@/actions/chapters";

const chapter = await getChapter(chapterId);
```

### `updateChapter(chapterId: string, data: { title?: string; rawText?: string })`

Updates chapter title and/or raw text.

```typescript
import { updateChapter } from "@/actions/chapters";

await updateChapter(chapterId, {
  title: "Updated Title",
  rawText: "New content...",
});
```

### `deleteChapter(chapterId: string)`

Deletes a chapter (cascades to text blocks and audio segments).

```typescript
import { deleteChapter } from "@/actions/chapters";

await deleteChapter(chapterId);
```

### `reorderChapters(projectId: string, chapterIds: string[])`

Reorders chapters by providing an array of chapter IDs in the desired order.

```typescript
import { reorderChapters } from "@/actions/chapters";

await reorderChapters(projectId, [chapterId3, chapterId1, chapterId2]);
```

## Security

All actions:
- ✅ Require Clerk authentication
- ✅ Verify user owns the resource
- ✅ Automatically create user record on first project creation
- ✅ Use Drizzle ORM with parameterized queries (SQL injection safe)
- ✅ Revalidate Next.js cache after mutations

## Error Handling

All actions throw errors for:
- Unauthenticated requests
- Unauthorized access (accessing someone else's project)
- Resource not found

Handle errors in your UI:

```typescript
try {
  const project = await getProject(projectId);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // Show error to user
  }
}
```

## Usage in Client Components

Use these actions with `useTransition` or in form actions:

```typescript
"use client";

import { createProject } from "@/actions/projects";
import { useTransition } from "react";

export function CreateProjectButton() {
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createProject("New Project");
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? "Creating..." : "Create Project"}
    </button>
  );
}
```

## Usage in Server Components

Call directly in Server Components:

```typescript
import { listProjects } from "@/actions/projects";

export default async function DashboardPage() {
  const projects = await listProjects();

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

