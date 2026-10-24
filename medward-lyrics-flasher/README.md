# Medward Lyrics Flasher

Lyrics projection app (Electron). Features:

- **Background**: solid color, a video file (optionally looping), or a live video source (camera / capture card / OBS Virtual Camera)
- **Color triggers**: 8 editable palette colors on keys `1`–`8`, fade time, tint over video, per-section colors, cycle-on-slide, and a `F` flash
- **Sections**: Verse, Refrain, Chorus, Bridge, plus custom sections; reorder / rename / recolor
- **Transitions**: fade, slides, zooms, blur, flip, rotate, bounce, drop, word-by-word, cut; adjustable duration
- **Fonts**: installed fonts, load any `.ttf/.otf/.woff` file, size, weight, outline, shadow, caps, alignment
- **Output screen**: opens on a second display fullscreen if present (double-click to toggle fullscreen)

Keys: `Space`/`→` next, `←` previous, `B` blank, `F` flash, `1`–`8` color triggers.

## Build the .exe

On Windows: install Node.js, then double-click `build-exe.bat` (or run `npm install && npm run dist`) → `dist/Medward-Lyrics-Flasher.exe` (portable, no install).


Dev run: `npm install && npm start`.
