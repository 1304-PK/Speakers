# Quick Setup Guide

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:6000`
   - Frontend dev server on `http://localhost:5000`

3. **Open your browser:**
   Navigate to `http://localhost:5000`

## How It Works

### For Hosts:
1. Click "Generate Room" to create a new room
2. Share the 6-character room code with others
3. Click "+ Add Video" and paste a YouTube URL
4. Use play/pause controls - all users sync automatically

### For Users:
1. Click "Enter Code"
2. Enter the room code from the host
3. Watch videos in perfect sync with everyone else

## Features

✅ Real-time video synchronization  
✅ YouTube video support  
✅ Video queue management  
✅ Room code system  
✅ User count display  
✅ Responsive design  
✅ Beautiful UI with vanilla CSS  

## Troubleshooting

- **Port already in use**: Change ports in `vite.config.js` (frontend) and `server.js` (backend)
- **Socket connection errors**: Make sure both servers are running
- **YouTube videos not loading**: Check your internet connection and YouTube API availability
