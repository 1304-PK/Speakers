import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import '../styles/LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)
  const generatingRef = useRef(false)

  useEffect(() => {
    // Create socket connection
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6001'
    const socket = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })
    socketRef.current = socket

    // Handle connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server')
      setIsConnected(true)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      setIsConnected(false)
      setIsGenerating(false)
    })

    socket.on('disconnect', () => {
      console.log('⚠️ Disconnected from server')
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const handleGenerate = () => {
    const socket = socketRef.current

    if (!socket) {
      alert('Socket not initialized. Please refresh the page.')
      return
    }

    if (!socket.connected) {
      alert('Not connected to server. Please make sure the server is running on http://localhost:6001')
      return
    }

    setIsGenerating(true)
    generatingRef.current = true

    // Remove any existing listeners to avoid duplicates
    socket.off('room-created')

    socket.emit('create-room')

    const timeoutId = setTimeout(() => {
      if (generatingRef.current) {
        generatingRef.current = false
        setIsGenerating(false)
        alert('Failed to create room. Please try again.')
        socket.off('room-created')
      }
    }, 10000)

    socket.once('room-created', ({ roomCode }) => {
      clearTimeout(timeoutId)
      generatingRef.current = false
      setIsGenerating(false)
      navigate(`/room/${roomCode}`)
    })
  }

  const handleEnterCode = () => {
    if (roomCode.trim().length === 6) {
      navigate(`/room/${roomCode.toUpperCase()}`)
    } else {
      alert('Please enter a valid 6-character room code')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setRoomCode('')
  }

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Speakers</h1>
        <p className="landing-subtitle">Watch videos together in perfect sync</p>

        {!isConnected && (
          <div style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            ⚠️ Server not connected. Make sure the server is running on port 6001.
          </div>
        )}

        <div className="button-container">
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating || !isConnected}
          >
            {isGenerating ? 'Generating...' : 'Generate Room'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(true)}
          >
            Enter Code
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Enter Room Code</h2>
            <input
              type="text"
              className="code-input"
              placeholder="Enter 6-digit code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              maxLength={6}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={handleEnterCode}>
                Join Room
              </button>
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
