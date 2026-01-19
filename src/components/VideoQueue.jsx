import React from 'react'
import '../styles/VideoQueue.css'

function VideoQueue({ queue, currentVideoId, isHost, onVideoChange }) {
  if (queue.length === 0 && !currentVideoId) {
    return (
      <div className="video-queue">
        <h3>Video Queue</h3>
        <div className="queue-empty">
          <p>No videos in queue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="video-queue">
      <h3>Video Queue</h3>
      <div className="queue-list">
        {currentVideoId && (
          <div className="queue-item queue-item-current">
            <div className="queue-item-thumbnail">
              <img 
                src={`https://img.youtube.com/vi/${currentVideoId}/mqdefault.jpg`}
                alt="Current video"
              />
              <span className="queue-item-badge">Now Playing</span>
            </div>
            <div className="queue-item-info">
              <p className="queue-item-title">Current Video</p>
              <p className="queue-item-id">{currentVideoId}</p>
            </div>
          </div>
        )}
        
        {queue.map((video, index) => (
          <div key={index} className="queue-item">
            <div className="queue-item-thumbnail">
              <img 
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={`Video ${index + 1}`}
              />
              <span className="queue-item-number">{index + 1}</span>
            </div>
            <div className="queue-item-info">
              <p className="queue-item-title">Video {index + 1}</p>
              <p className="queue-item-id">{video.id}</p>
              {isHost && (
                <button
                  className="btn-play-next"
                  onClick={() => onVideoChange(video.id)}
                >
                  Play Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoQueue
