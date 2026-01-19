# Speakers Website - Architecture Plan

## Overview
A synchronized video room platform where hosts can create rooms and users join via codes. All users watch YouTube videos in perfect sync.

## Architecture

### Frontend (React + JSX + Vanilla CSS)
1. **Landing Page** (`/`)
   - Generate button (creates room, generates code)
   - Enter Code button (opens modal to join room)
   - Clean, modern UI

2. **Room Page** (`/room/:roomCode`)
   - Video player (YouTube embed)
   - Host controls (add video, play/pause, seek)
   - Video queue (list of videos)
   - User count display
   - Room code display

### Backend (Node.js + Socket.io)
1. **Socket.io Server**
   - Room management (create/join/leave)
   - Video state synchronization
   - Real-time event broadcasting

2. **Room State Management**
   - Current video ID
   - Playback state (playing/paused)
   - Current time
   - Video queue
   - Host socket ID

### Key Features
- **Room Generation**: 6-digit alphanumeric codes
- **Real-time Sync**: Play/pause/seek events sync instantly
- **YouTube Integration**: Extract video ID from URLs
- **Queue Management**: Host can add multiple videos
- **Auto-sync**: Users joining mid-video sync to current time

### Component Structure
```
App
├── LandingPage
│   ├── GenerateButton
│   └── EnterCodeModal
└── RoomPage
    ├── VideoPlayer
    ├── HostControls
    ├── VideoQueue
    └── RoomInfo
```

### Data Flow
1. Host creates room → Server generates code → Redirects to room
2. User enters code → Server validates → Joins room → Syncs to current state
3. Host plays video → Socket event → All clients play simultaneously
4. Host seeks → Socket event → All clients seek to same time
