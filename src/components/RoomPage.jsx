import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import VideoPlayer from './VideoPlayer'
import HostControls from './HostControls'
import VideoQueue from './VideoQueue'
import RoomInfo from './RoomInfo'
import '../styles/RoomPage.css'

function RoomPage() {
  const { roomCode } = useParams()
  const navigate = useNavigate()
  const [socket, setSocket] = useState(null)
  const [isHost, setIsHost] = useState(false)
  const [videoId, setVideoId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [queue, setQueue] = useState([])
  const [userCount, setUserCount] = useState(1)
  const [isConnected, setIsConnected] = useState(false)
  const playerRef = useRef(null)

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6001'
    const newSocket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('✅ Connected to server')
      // Try to join room once connected
      newSocket.emit('join-room', { roomCode })
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
    })

    // Try to join room immediately (in case already connected)
    if (newSocket.connected) {
      newSocket.emit('join-room', { roomCode })
    }

    newSocket.on('room-joined', ({ isHost: host, videoId: vidId, isPlaying: playing, currentTime: time, queue: videoQueue }) => {
      setIsHost(host)
      setIsConnected(true)
      setVideoId(vidId)
      setIsPlaying(playing)
      setCurrentTime(time)
      setQueue(videoQueue)
    })

    newSocket.on('host-transferred', ({ roomCode }) => {
      setIsHost(true)
      console.log('You are now the host of this room')
    })

    newSocket.on('join-error', ({ message }) => {
      alert(message)
      navigate('/')
    })

    newSocket.on('room-closed', () => {
      alert('Room closed by host')
      navigate('/')
    })

    newSocket.on('user-joined', ({ userCount: count }) => {
      setUserCount(count)
    })

    newSocket.on('user-left', ({ userCount: count }) => {
      setUserCount(count)
    })

    newSocket.on('video-changed', ({ videoId: vidId, queue: videoQueue }) => {
      setVideoId(vidId)
      setQueue(videoQueue)
      setIsPlaying(false)
      setCurrentTime(0)
    })

    newSocket.on('video-play', ({ currentTime: time }) => {
      setIsPlaying(true)
      if (playerRef.current) {
        playerRef.current.play(time)
      }
    })

    newSocket.on('video-pause', ({ currentTime: time }) => {
      setIsPlaying(false)
      if (playerRef.current) {
        playerRef.current.pause(time)
      }
    })

    newSocket.on('video-seek', ({ time }) => {
      setCurrentTime(time)
      if (playerRef.current) {
        playerRef.current.seek(time)
      }
    })

    newSocket.on('queue-updated', ({ queue: videoQueue }) => {
      setQueue(videoQueue)
    })

    // Handle sync updates from server (heartbeat)
    newSocket.on('sync-update', ({ time: serverTime }) => {
      if (playerRef.current) {
        const localTime = playerRef.current.getCurrentTime()
        const drift = Math.abs(localTime - serverTime)

        // If drift is > 2 seconds, auto-seek to catch up
        if (drift > 2) {
          console.log(`Syncing: drift of ${drift.toFixed(2)}s detected`)
          playerRef.current.seek(serverTime)
        }
      }
    })

    return () => {
      newSocket.disconnect()
    }
  }, [roomCode, navigate])

  const handleAddVideo = (videoUrl) => {
    if (socket && isHost) {
      socket.emit('add-video', { roomCode, videoUrl })
    }
  }

  const handlePlay = () => {
    if (socket && isHost) {
      socket.emit('play-video', { roomCode })
    }
  }

  const handlePause = () => {
    if (socket && isHost) {
      socket.emit('pause-video', { roomCode })
    }
  }

  const handleSeek = (time) => {
    if (socket && isHost) {
      socket.emit('seek-video', { roomCode, time })
    }
  }

  const handleTimeUpdate = (time) => {
    // Only host sends time updates
    if (socket && isHost) {
      socket.emit('time-update', { roomCode, time })
    }
    // We don't update local state here to avoid jitter loop for host
    // setCurrentTime(time) 
  }

  const handleVideoChange = (newVideoId) => {
    if (socket && isHost) {
      socket.emit('change-video', { roomCode, videoId: newVideoId })
    }
  }

  if (!isConnected) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to room...</p>
      </div>
    )
  }

  return (
    <div className="room-container">
      <RoomInfo roomCode={roomCode} userCount={userCount} isHost={isHost} />

      <div className="room-main">
        <div className="video-section">
          <VideoPlayer
            ref={playerRef}
            videoId={videoId}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
          />

          {isHost && (
            <HostControls
              onAddVideo={handleAddVideo}
              onPlay={handlePlay}
              onPause={handlePause}
              onSeek={handleSeek}
              isPlaying={isPlaying}
              currentTime={currentTime}
            />
          )}
        </div>

        <VideoQueue
          queue={queue}
          currentVideoId={videoId}
          isHost={isHost}
          onVideoChange={handleVideoChange}
        />
      </div>
    </div>
  )
}

export default RoomPage
