# Speakers - Synchronized Video Room Platform

A web application that allows users to create or join rooms to watch YouTube videos together in perfect synchronization. Perfect for those who want to share audio/video experiences without physical speakers.

## Features

- **Generate Room**: Hosts can create a room with a unique 6-character code
- **Join Room**: Users can enter a code to join an existing room
- **Synchronized Playback**: When the host plays/pauses/seeks, all users' videos sync automatically
- **YouTube Integration**: Easy YouTube video embedding and playback
- **Video Queue**: Host can add multiple videos to a queue
- **Real-time Updates**: See who's in the room and get instant sync updates

## Tech Stack

- **Frontend**: React with JSX and Vanilla CSS
- **Backend**: Node.js with Express and Socket.io
- **Build Tool**: Vite
- **Real-time**: Socket.io for WebSocket communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

This will start both the backend server (port 6000) and frontend dev server (port 5000).

3. Open [http://localhost:5000](http://localhost:5000) in your browser

## How to Use

### As a Host:

1. Click **"Generate Room"** on the landing page
2. You'll be redirected to your room with a unique code
3. Share the room code with others
4. Click **"+ Add Video"** and paste a YouTube URL
5. Control playback - all users will sync automatically

### As a User:

1. Click **"Enter Code"** on the landing page
2. Enter the 6-character room code provided by the host
3. Watch videos in perfect sync with the host
4. Videos will automatically play/pause/seek when the host controls them

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── LandingPage.jsx  # Landing page with Generate/Enter Code
│   │   ├── RoomPage.jsx     # Main room component
│   │   ├── VideoPlayer.jsx  # YouTube video player
│   │   ├── HostControls.jsx # Host controls (add video, play/pause)
│   │   ├── VideoQueue.jsx   # Video queue display
│   │   └── RoomInfo.jsx     # Room info header
│   ├── styles/              # Vanilla CSS files
│   ├── App.jsx              # Main app component with routing
│   └── main.jsx             # Entry point
├── server.js                # Socket.io server
├── index.html               # HTML entry point
└── package.json             # Dependencies
```

## Architecture

- **Frontend**: React SPA with client-side routing
- **Backend**: Express server with Socket.io for real-time communication
- **Room Management**: Server-side room state management
- **Synchronization**: Real-time event broadcasting via WebSockets

## License

MIT
