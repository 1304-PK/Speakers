import React, { useState } from 'react'
import '../styles/HostControls.css'

function HostControls({ onAddVideo, onPlay, onPause, onSeek, isPlaying, currentTime }) {
  const [videoUrl, setVideoUrl] = useState('')
  const [showInput, setShowInput] = useState(false)

  const handleAddVideo = (e) => {
    e.preventDefault()
    if (videoUrl.trim()) {
      onAddVideo(videoUrl.trim())
      setVideoUrl('')
      setShowInput(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="host-controls">
      <div className="controls-top">
        {!showInput ? (
          <button 
            className="btn-add-video"
            onClick={() => setShowInput(true)}
          >
            + Add Video
          </button>
        ) : (
          <form className="video-input-form" onSubmit={handleAddVideo}>
            <input
              type="text"
              className="video-url-input"
              placeholder="Paste YouTube URL here"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-submit">Add</button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => {
                setShowInput(false)
                setVideoUrl('')
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      <div className="playback-controls">
        <button
          className="control-btn"
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
        <div className="time-display">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  )
}

export default HostControls
