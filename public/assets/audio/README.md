# 🎵 Reiki & Sage — Protocol Meditation Music Assets Guide

This directory contains high-quality background meditation music beds for all Crystal Healing Protocols in Reiki & Sage.

## Folder Structure

```
public/assets/audio/
├── README.md
└── protocols/
    ├── amethyst_meditation_music.mp3   (528Hz Violet Flame Ambient)
    ├── quartz_meditation_music.mp3     (432Hz Crystalline Matrix)
    ├── rose_meditation_music.mp3       (639Hz Heart-Sync Frequency)
    ├── lapis_meditation_music.mp3      (852Hz Third Eye Intuition)
    ├── citrine_meditation_music.mp3    (528Hz Solar Alchemy)
    ├── sage_meditation_music.mp3       (432Hz Ocean & Sacred Smoke)
    ├── reiki_meditation_music.mp3      (528Hz Universal Life Force)
    ├── celestial_meditation_music.mp3  (963Hz Cosmic Astral Soundscape)
    └── default_meditation_music.mp3    (Fallback Universal Bed)
```

## How to Add New Music Tracks

1. **Format**: Use high-quality compressed Web audio formats: `.mp3`, `.aac`, or `.ogg`.
2. **Naming**: Name the file according to protocol ID: `<protocol_id>_meditation_music.mp3` inside `public/assets/audio/protocols/`.
3. **Audio Guidelines**:
   - Sacred, calming, expansive pads, gentle drones, or Solfeggio acoustic frequencies.
   - Avoid aggressive drum beats, sharp transients, or prominent vocal tracks that compete with Carissa's voice.
   - Track duration: 5 to 10+ minutes (the player handles seamless looping for shorter files).
4. **Registration**:
   Update the protocol definition in `src/App.jsx`:
   ```js
   {
     id: 'new_protocol',
     name: 'New Crystal Protocol',
     audio: '/assets/audio/protocols/new_protocol_meditation_music.mp3',
     voice: '/assets/new_protocol_voice.mp3',
     ...
   }
   ```

## Fallback System

If an audio file is missing or fails to load, `DuckingAudioPlayer.jsx` automatically activates `ProtocolSoundEngine.js`, generating a 5-layer Web Audio Solfeggio drone bed (fundamental + harmonics + sub-bass + 6Hz theta binaural beats + pink noise ocean ambience) matching the protocol's Solfeggio frequency.
