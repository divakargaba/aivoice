# Director Notes Feature

## Overview
Added per-block director notes to give you fine-grained control over audio generation.

## How It Works

### 1. **UI (Studio Tab)**
- Each text block has a "Director Notes" textarea
- Add custom notes like:
  - "speak slowly and mysteriously"
  - "emphasize the word 'danger'"
  - "whisper this line"
  - "pause before speaking"
- Click "Save Notes" to persist to the database

### 2. **Storage**
- Director notes are stored in `text_blocks.meta.director_notes`
- Emotion (from AI analysis) is stored in `text_blocks.meta.emotion`
- Both are preserved and can be updated independently

### 3. **Audio Generation**
When generating/regenerating audio, the system:

1. **Extracts guidance** from:
   - `meta.emotion` (from AI analysis)
   - `meta.director_notes` (your custom notes)

2. **Adjusts ElevenLabs voice settings** based on keywords:
   
   **Emotion-based adjustments:**
   - `excited`, `happy`, `angry` → Lower stability (more variable), higher similarity
   - `sad`, `whisper`, `calm` → Higher stability (more stable), lower similarity
   - `tense`, `nervous` → Moderate variability
   
   **Director notes keywords:**
   - `slow`, `calm`, `steady` → Higher stability (more controlled)
   - `fast`, `excited`, `energetic` → Lower stability, higher expressiveness
   - `whisper`, `quiet`, `soft` → Very stable, lower similarity
   - `loud`, `shout`, `yell` → Low stability, very high similarity
   - `dramatic`, `theatrical` → High expressiveness
   - `monotone`, `flat`, `boring` → Maximum stability, minimal expressiveness

3. **Generates with optimized settings**:
   - The text remains unchanged (no prefixes that would be spoken)
   - Voice parameters are tuned based on your notes
   - ElevenLabs AI applies the adjusted voice characteristics

## Technical Details

### Voice Settings Mapping

The system intelligently maps your director notes to ElevenLabs voice parameters:

- **Stability** (0.0-1.0): Controls consistency vs. variability
  - Low (0.3-0.4): Energetic, expressive, variable delivery
  - Medium (0.5): Balanced, natural speech
  - High (0.7-0.8): Controlled, steady, monotone

- **Similarity Boost** (0.0-1.0): Controls voice character matching
  - Low (0.5-0.6): Softer, quieter delivery
  - Medium (0.75): Natural voice character
  - High (0.8-0.9): Strong, loud, emphasized delivery

## Usage Example

**Original text block:**
> "I can't believe we made it."

**Add director notes:**
> "speak with relief, almost crying, slow and emotional"

**What happens:**
- System detects keywords: "slow" → higher stability
- Emotion from AI: `happy` → more expressive
- Voice settings adjusted: `stability=0.6, similarity_boost=0.75`
- Audio generated with these optimized parameters
- Result: Slower, more emotional delivery without changing the words

## Supported Keywords

Use these keywords in your director notes for best results:

### Pacing
- `slow`, `slowly`, `calm`, `steady` → More controlled delivery
- `fast`, `quickly`, `rapid`, `rushed` → More energetic delivery

### Volume/Intensity
- `whisper`, `quiet`, `soft` → Gentle, subdued delivery
- `loud`, `shout`, `yell` → Strong, emphasized delivery

### Style
- `dramatic`, `theatrical` → High expressiveness
- `monotone`, `flat`, `boring` → Minimal variation
- `excited`, `energetic` → Variable, lively delivery

### Emotion Enhancements
- Combine with AI-detected emotions for best results
- Example: AI detects "sad" + your note "speak very slowly" = perfectly tuned sadness

## Technical Details

### Files Modified
- `components/studio-tab.tsx` - Added Director Notes UI
- `actions/audio.ts` - Added `saveDirectorNotes()` and updated generation to use notes
- `lib/elevenlabs.ts` - Added `prepareTextWithGuidance()` function
- `db/schema.ts` - Already had `meta` JSONB field

### API
```typescript
// Save director notes
await saveDirectorNotes(projectId, textBlockId, "your notes here");

// Generate audio (automatically includes emotion + notes)
await regenerateBlockAudio(projectId, textBlockId);
```

## Tips

1. **Be specific**: "speak quietly" is better than "quiet"
2. **Emphasize words**: "emphasize the word 'never'" works well
3. **Combine with emotion**: Emotion from AI + your notes = best results
4. **Iterate**: Regenerate blocks to fine-tune the delivery
5. **Keep it natural**: The AI understands natural language instructions

## Future Enhancements
- Voice settings per block (stability, similarity)
- Preset director note templates
- Bulk apply notes to multiple blocks
- Preview different interpretations
