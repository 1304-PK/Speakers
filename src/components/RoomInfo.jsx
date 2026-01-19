import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/RoomInfo.css'

function RoomInfo({ roomCode, userCount, isHost }) {
  const navigate = useNavigate()

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      navigate('/')
    }
  }

  return (
    <div className="room-info">
      <div className="room-info-left">
        <h2 className="room-title">Speakers</h2>
        <div className="room-code-display">
          <span className="room-code-label">Room Code:</span>
          <span className="room-code-value">{roomCode}</span>
        </div>
      </div>
      <div className="room-info-right">
        <div className="room-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-value">{userCount}</span>
          </div>
          {isHost && (
            <span className="host-badge">Host</span>
          )}
        </div>
        <button className="btn-leave" onClick={handleLeave}>
          Leave Room
        </button>
      </div>
    </div>
  )
}

export default RoomInfo
