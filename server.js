const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store rooms: { roomCode: { hostId, videoId, isPlaying, currentTime, queue, users, deleteTimer } }
const rooms = new Map();

// Generate random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Extract YouTube video ID from URL
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Create a new room
  socket.on('create-room', () => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, {
      hostId: socket.id,
      videoId: null,
      isPlaying: false,
      currentTime: 0,
      queue: [],
      users: new Set([socket.id])
    });

    socket.join(roomCode);
    socket.emit('room-created', { roomCode, isHost: true });
    console.log(`Room created: ${roomCode} by ${socket.id}`);
  });

  // Join an existing room
  socket.on('join-room', ({ roomCode }) => {
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit('join-error', { message: 'Room not found' });
      return;
    }

    // Cancel deletion timer if room was scheduled to be deleted
    if (room.deleteTimer) {
      clearTimeout(room.deleteTimer);
      room.deleteTimer = null;
    }

    socket.join(roomCode);
    room.users.add(socket.id);

    // Check if current host is still connected, if not, make this user the host
    const currentHostSocket = io.sockets.sockets.get(room.hostId);
    if (!currentHostSocket || !room.users.has(room.hostId)) {
      room.hostId = socket.id;
      console.log(`Host reassigned in room ${roomCode} to ${socket.id}`);
    }

    // Send current room state to the new user
    socket.emit('room-joined', {
      roomCode,
      isHost: socket.id === room.hostId,
      videoId: room.videoId,
      isPlaying: room.isPlaying,
      currentTime: room.currentTime,
      queue: room.queue
    });

    // Notify others that a user joined
    io.to(roomCode).emit('user-joined', {
      userId: socket.id,
      userCount: room.users.size
    });

    console.log(`User ${socket.id} joined room ${roomCode}`);
  });

  // Host adds a video
  socket.on('add-video', ({ roomCode, videoUrl }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      socket.emit('video-error', { message: 'Invalid YouTube URL' });
      return;
    }

    const videoData = { id: videoId, url: videoUrl };

    if (!room.videoId) {
      // No current video, set it as current
      room.videoId = videoId;
      io.to(roomCode).emit('video-changed', { videoId, queue: room.queue });
    } else {
      // Add to queue
      room.queue.push(videoData);
      io.to(roomCode).emit('queue-updated', { queue: room.queue });
    }
  });

  // Host plays video
  socket.on('play-video', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.isPlaying = true;
    io.to(roomCode).emit('video-play', { currentTime: room.currentTime });
  });

  // Host pauses video
  socket.on('pause-video', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.isPlaying = false;
    io.to(roomCode).emit('video-pause', { currentTime: room.currentTime });
  });

  // Host seeks video
  socket.on('seek-video', ({ roomCode, time }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    room.currentTime = time;
    io.to(roomCode).emit('video-seek', { time });
  });

  // Host updates current time (for sync)
  socket.on('time-update', ({ roomCode, time }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    room.currentTime = time;
    // Broadcast time to other users for drift correction
    socket.to(roomCode).emit('sync-update', { time });
  });

  // Host changes video
  socket.on('change-video', ({ roomCode, videoId }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;

    // Remove the video from queue if it exists there
    room.queue = room.queue.filter(video => video.id !== videoId);

    room.videoId = videoId;
    room.currentTime = 0;
    room.isPlaying = false;
    io.to(roomCode).emit('video-changed', { videoId, queue: room.queue });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Find and remove user from rooms
    for (const [roomCode, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        const wasHost = room.hostId === socket.id;
        room.users.delete(socket.id);

        // If host left, transfer host to first user or schedule room deletion if empty
        if (wasHost) {
          if (room.users.size > 0) {
            // Transfer host to first remaining user
            const newHostId = Array.from(room.users)[0];
            room.hostId = newHostId;
            io.to(newHostId).emit('host-transferred', { roomCode });
            io.to(roomCode).emit('user-left', {
              userId: socket.id,
              userCount: room.users.size
            });
            console.log(`Host transferred in room ${roomCode} from ${socket.id} to ${newHostId}`);
          } else {
            // Room is empty, schedule deletion after 5 seconds (in case user reconnects)
            if (room.deleteTimer) {
              clearTimeout(room.deleteTimer);
            }
            room.deleteTimer = setTimeout(() => {
              if (rooms.get(roomCode) && rooms.get(roomCode).users.size === 0) {
                io.to(roomCode).emit('room-closed');
                rooms.delete(roomCode);
                console.log(`Room ${roomCode} closed (empty after timeout)`);
              }
            }, 5000);
          }
        } else {
          io.to(roomCode).emit('user-left', {
            userId: socket.id,
            userCount: room.users.size
          });
        }
        break;
      }
    }
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 6001;

// Handle server errors (like port already in use)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error('Please either:');
    console.error('  1. Stop the process using port ' + PORT);
    console.error('  2. Or set a different PORT environment variable\n');
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
