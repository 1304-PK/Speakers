import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import '../styles/VideoPlayer.css'

const VideoPlayer = forwardRef(({ videoId, isPlaying, currentTime, onTimeUpdate }, ref) => {
  const playerRef = React.useRef(null)
  const containerRef = React.useRef(null)
  const syncIntervalRef = React.useRef(null)
  const isSeekingRef = React.useRef(false)
  const [apiReady, setApiReady] = useState(false)

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true)
    }

    // Load the API script if not already loaded
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }
  }, [])

  // Initialize player when API is ready and we have a videoId
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current || playerRef.current) return

    const playerId = `youtube-player-${Date.now()}`
    containerRef.current.innerHTML = `<div id="${playerId}"></div>`

    playerRef.current = new window.YT.Player(playerId, {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        enablejsapi: 1
      },
      events: {
        onReady: (event) => {
          if (currentTime > 0) {
            event.target.seekTo(currentTime, true)
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startSync()
          } else {
            stopSync()
          }
        }
      }
    })

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.error('Error destroying player:', e)
        }
        playerRef.current = null
      }
    }
  }, [apiReady, videoId])

  // Handle video ID changes
  useEffect(() => {
    if (playerRef.current && videoId) {
      try {
        playerRef.current.loadVideoById(videoId)
        if (currentTime > 0) {
          setTimeout(() => {
            playerRef.current.seekTo(currentTime, true)
          }, 500)
        }
      } catch (e) {
        console.error('Error loading video:', e)
      }
    }
  }, [videoId])

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return

    try {
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    } catch (e) {
      console.error('Error controlling playback:', e)
    }
  }, [isPlaying])

  const startSync = () => {
    if (syncIntervalRef.current) return
    
    syncIntervalRef.current = setInterval(() => {
      if (playerRef.current && !isSeekingRef.current) {
        try {
          const time = playerRef.current.getCurrentTime()
          if (time !== null && !isNaN(time)) {
            onTimeUpdate(time)
          }
        } catch (e) {
          // Player might not be ready
        }
      }
    }, 1000)
  }

  const stopSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
    }
  }

  useImperativeHandle(ref, () => ({
    play: (time) => {
      if (playerRef.current) {
        try {
          if (time !== undefined && time !== null) {
            playerRef.current.seekTo(time, true)
            setTimeout(() => {
              playerRef.current.playVideo()
            }, 100)
          } else {
            playerRef.current.playVideo()
          }
        } catch (e) {
          console.error('Error playing video:', e)
        }
      }
    },
    pause: (time) => {
      if (playerRef.current) {
        try {
          if (time !== undefined && time !== null) {
            playerRef.current.seekTo(time, true)
            setTimeout(() => {
              playerRef.current.pauseVideo()
            }, 100)
          } else {
            playerRef.current.pauseVideo()
          }
        } catch (e) {
          console.error('Error pausing video:', e)
        }
      }
    },
    seek: (time) => {
      if (playerRef.current) {
        try {
          isSeekingRef.current = true
          playerRef.current.seekTo(time, true)
          setTimeout(() => {
            isSeekingRef.current = false
          }, 500)
        } catch (e) {
          console.error('Error seeking video:', e)
          isSeekingRef.current = false
        }
      }
    }
  }))

  useEffect(() => {
    return () => {
      stopSync()
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    }
  }, [])

  if (!videoId) {
    return (
      <div className="video-placeholder">
        <div className="placeholder-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <p>No video loaded</p>
          <p className="placeholder-hint">Host can add a YouTube video to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="video-player-container">
      <div ref={containerRef} className="youtube-player"></div>
    </div>
  )
})

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
