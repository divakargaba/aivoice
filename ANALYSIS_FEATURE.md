# AI Analysis Feature

This feature uses OpenAI's GPT-4 to analyze manuscript text and extract characters, dialogue, and narrative blocks.

## How It Works

### 1. Analysis Process

When you click "Run Analysis" on a chapter:

1. **Status Update**: Project status changes to "analyzing"
2. **AI Call**: Sends chapter text to GPT-4o-mini with structured prompt
3. **JSON Response**: AI returns structured JSON with characters and text blocks
4. **Validation**: Response validated with Zod schemas
5. **Database Updates**:
   - Upserts characters (creates new or updates existing)
   - Creates text_blocks with proper ordering
   - Links dialogue blocks to characters
   - Stores emotion metadata
6. **Status Update**: Project status changes to "ready"

### 2. What Gets Extracted

**Characters:**
```json
{
  "name": "John Smith",
  "description": "The protagonist, a detective"
}
```

**Text Blocks:**
```json
{
  "idx": 0,
  "kind": "narration" | "dialogue",
  "speaker": "Narrator" | "Character Name",
  "text": "The actual text content",
  "emotion": "neutral" | "happy" | "sad" | "angry" | "tense" | "excited" | "whisper" | "shout"
}
```

### 3. Database Schema

**Characters Table:**
- Stores unique characters per project
- Includes optional description
- Used for voice assignment

**Text Blocks Table:**
- Sequential blocks (idx) within each chapter
- Kind: narration or dialogue
- Speaker character ID (null for narration)
- Emotion metadata stored in JSONB

## Setup

### 1. Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add to `.env.local`:

```env
OPENAI_API_KEY=sk-proj-your_actual_key_here
```

### 2. Install Dependencies

```bash
npm install
```

## Usage

### From the UI

1. Create a project with manuscript text
2. Go to the project page
3. Click "Manuscript" tab
4. Click "Run Analysis" button
5. Wait for analysis to complete (toast notification)
6. Check "Cast" tab to see extracted characters

### Programmatically

```typescript
import { runAnalysis } from "@/actions/analysis";

const result = await runAnalysis(projectId, chapterId);
// Returns: { success: true, charactersFound: 3, blocksCreated: 45 }
```

## Prompt Engineering

The system uses a carefully crafted prompt (`lib/analysis-prompt.ts`) that:

- Forces JSON-only output (no markdown)
- Uses `response_format: { type: "json_object" }` for guaranteed JSON
- Provides clear structure and examples
- Defines all valid options for enums
- Temperature set to 0.3 for consistent results

## Error Handling

The system handles errors gracefully:

- **Invalid JSON**: Catches parse errors and reverts status
- **Missing API Key**: Throws error on initialization
- **Network Issues**: Catches and displays to user
- **Validation Errors**: Logs full response for debugging
- **Ownership Checks**: Verifies user owns project before analysis

## Validation

Uses Zod schemas (`lib/analysis-schema.ts`) to validate:

- Character names are non-empty strings
- Block indices are positive integers
- Kind is either "narration" or "dialogue"
- Emotions are from the allowed list
- All required fields are present

## Re-Analysis

Running analysis on the same chapter:
- Deletes existing text_blocks for that chapter
- Updates character descriptions if changed
- Creates new text_blocks with fresh analysis
- Preserves characters (upserts, doesn't duplicate)

## Cost Optimization

- Uses **gpt-4o-mini** instead of gpt-4 (98% cheaper)
- Temperature 0.3 (balances quality and cost)
- Processes one chapter at a time
- Caches results in database

## Future Improvements

- [ ] Batch processing for multiple chapters
- [ ] Support for chapter splitting (long texts)
- [ ] Custom emotion sets per genre
- [ ] Voice tone/style extraction
- [ ] Scene detection and breaks
- [ ] Character relationship mapping

