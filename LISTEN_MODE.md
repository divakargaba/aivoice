# Listen Mode Feature

## Overview
Added sequential chapter playback and download capabilities to the Studio tab.

## Features

### 1. **Play Chapter Button**
- Located at the top of the text blocks list
- Plays all blocks with audio sequentially
- Auto-advances to the next block when audio ends
- Changes to "Pause" button during playback
- Shows toast notification when chapter completes

### 2. **Visual Feedback**
- **Selected block**: Blue border with light blue background
- **Currently playing block**: Green pulsing ring animation
- Blocks update in real-time as playback progresses

### 3. **Auto-Advance**
- Automatically plays the next block when current audio ends
- Seamless transitions between blocks
- Respects the original block order (by `idx`)
- Stops automatically at the end of the chapter

### 4. **Download Chapter ZIP**
- Downloads all audio segments as a ZIP file
- Includes:
  - **Audio files** named: `{idx:03d}_{speaker}_{emotion}.mp3`
    - Example: `000_Narrator_neutral.mp3`, `001_Alex_excited.mp3`
  - **README.md** with chapter info and playback order
  - **playlist.m3u** for easy sequential playback in media players
- Only downloads blocks that have generated audio

## How to Use

### **Playing a Chapter:**
1. Go to the **Studio** tab
2. Ensure some blocks have audio generated
3. Click **"Play Chapter"** at the top
4. The first block with audio will start playing
5. Watch the green pulsing ring highlight the current block
6. Audio auto-advances through all blocks
7. Click **"Pause"** to stop playback

### **Downloading a Chapter:**
1. Go to the **Studio** tab
2. Click **"Download"** button at the top
3. ZIP file downloads automatically
4. Extract and:
   - Read `README.md` for chapter info
   - Open `playlist.m3u` in VLC/iTunes for sequential playback
   - Or play individual MP3 files in order

## File Naming Convention

Audio files in the ZIP are named for easy sorting and identification:

```
000_Narrator_neutral.mp3       # Block 0, Narrator, neutral
001_Alex_curious.mp3           # Block 1, Alex, curious
002_Maya_thoughtful.mp3        # Block 2, Maya, thoughtful
003_Narrator.mp3               # Block 3, Narrator, no specific emotion
```

The three-digit index ensures proper alphabetical sorting.

## Technical Details

### **Playback State Management**
- `isPlaying`: Boolean - whether playback is active
- `currentPlayingBlockId`: String | null - ID of currently playing block
- `audioRef`: React ref to HTML audio element

### **Sequential Logic**
```typescript
// On audio end event
if (isPlaying) {
    const currentIndex = blocksWithAudio.findIndex(b => b.id === currentPlayingBlockId);
    if (currentIndex < blocksWithAudio.length - 1) {
        playNextBlock(); // Advance to next
    } else {
        stopPlayback(); // End of chapter
    }
}
```

### **Download Endpoint**
- **Route**: `/api/chapters/[id]/download`
- **Method**: GET
- **Auth**: Requires Clerk authentication
- **Package**: Uses `jszip` for ZIP generation
- **Compression**: DEFLATE level 6 (balanced)

### **ZIP Contents**
```
chapter-title/
├── README.md              # Chapter info and block list
├── playlist.m3u           # M3U playlist for media players
├── 000_Narrator.mp3       # Audio files in order
├── 001_Alex_excited.mp3
├── 002_Maya_calm.mp3
└── ...
```

## Files Modified

- `components/studio-tab.tsx` - Added playback UI and logic
- `app/api/chapters/[id]/download/route.ts` - New ZIP download endpoint
- `package.json` - Added `jszip` dependency

## Keyboard Shortcuts (Future Enhancement)

Potential additions:
- `Space` - Play/Pause
- `→` - Next block
- `←` - Previous block
- `Esc` - Stop playback

## Known Limitations

1. **Single chapter only**: Currently plays one chapter at a time
2. **No shuffle/repeat**: Plays in order only
3. **No speed control**: Plays at original speed
4. **Browser-dependent**: Audio format support varies by browser

## Future Enhancements

- Multi-chapter playlists
- Playback speed control (0.5x, 1x, 1.5x, 2x)
- Skip forward/backward 10 seconds
- Keyboard shortcuts
- Progress bar showing chapter completion
- Loop/repeat options
- Export to audiobook format (M4B)
