'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward, 
  Settings, 
  MonitorSpeaker, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Bookmark
} from 'lucide-react';
import { getSignedVideoUrl } from '@/lib/courseUtils';
import { Button } from '@/components/ui/button';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { VideoPlayerFallback } from './video-player-fallback';
import './video-player.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Core video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  
  // Video bookmarks
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  // Get signed URL for video
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // Local progress persistence
  const storageKey = React.useMemo(() => {
    // Use src as stable key; if signed, prefer original src to avoid expiring URLs
    return `video-progress:${src}`;
  }, [src]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setShowFallback(false);
        const url = await getSignedVideoUrl(src);
        if (url) {
          setSignedUrl(url);
        } else {
          setError('Failed to load video URL');
          setShowFallback(true);
        }
      } catch (err) {
        setError('Failed to load video');
        setShowFallback(true);
        console.error('Error fetching signed URL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (src) {
      fetchSignedUrl();
    }
  }, [src]);

  // Retry function for fallback
  const handleRetry = async () => {
    setShowFallback(false);
    setError(null);
    setIsLoading(true);
    
    try {
      const url = await getSignedVideoUrl(src);
      if (url) {
        setSignedUrl(url);
        setShowFallback(false);
      } else {
        setShowFallback(true);
      }
    } catch (err) {
      setShowFallback(true);
      console.error('Retry failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, showControls]);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekTo(Math.max(0, playedSeconds - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seekTo(Math.min(duration, playedSeconds + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyC':
          e.preventDefault();
          setShowSettings(!showSettings);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, playedSeconds, duration, volume, showSettings, seekTo, toggleFullscreen, toggleMute, togglePlayPause]);

  // Mouse movement detection
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const addBookmark = useCallback(() => {
    const newBookmark = playedSeconds;
    setBookmarks(prev => [...prev, newBookmark].sort((a, b) => a - b));
    enhancedToast.success(`Bookmark added at ${formatTime(newBookmark)}`);
  }, [playedSeconds, formatTime]);

  const handleProgress = useCallback((state: { played: number; playedSeconds: number }) => {
    setPlayed(state.played);
    setPlayedSeconds(state.playedSeconds);
  }, []);

  const handleDuration = useCallback((duration: number) => {
    setDuration(duration);
  }, []);

  const handleReady = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    setError('Failed to load video');
    setIsLoading(false);
    console.error('Video player error:', error);
  }, []);

  // Resume from last saved position when player is ready and URL available
  useEffect(() => {
    if (!signedUrl || !playerRef.current) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedSeconds = parseFloat(saved);
        if (!Number.isNaN(savedSeconds) && savedSeconds > 0) {
          // Seek slightly earlier to provide context
          const resumeAt = Math.max(0, savedSeconds - 2);
          playerRef.current.seekTo(resumeAt);
        }
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedUrl]);

  // Persist progress periodically (every ~5s) and on unmount
  const lastSavedRef = useRef<number>(0);
  useEffect(() => {
    if (!duration) return;
    const shouldSave = Math.floor(playedSeconds) % 5 === 0 && Math.floor(playedSeconds) !== Math.floor(lastSavedRef.current);
    if (shouldSave) {
      try {
        localStorage.setItem(storageKey, String(playedSeconds));
        lastSavedRef.current = playedSeconds;
      } catch {
        // ignore storage errors
      }
    }
  }, [playedSeconds, duration, storageKey]);

  useEffect(() => {
    return () => {
      try {
        if (playedSeconds > 0) {
          localStorage.setItem(storageKey, String(playedSeconds));
        }
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !signedUrl) {
    // Show fallback component when S3/Supabase is not available
    if (showFallback) {
      return (
        <VideoPlayerFallback 
          src={src} 
          title={title} 
          onRetry={handleRetry}
        />
      );
    }
    
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-white text-sm">{error || 'Video not available'}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={signedUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={isMuted ? 0 : volume}
        playbackRate={playbackRate}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onReady={handleReady}
        onError={handleError}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
            },
          },
        }}
      />

      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
            {bookmarks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="text-white hover:bg-white/20"
              >
                <Bookmark className="w-4 h-4" />
                <span className="ml-1">{bookmarks.length}</span>
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCaptions(!showCaptions)}
              className="text-white hover:bg-white/20"
            >
              <MonitorSpeaker className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlayPause}
            className="text-white hover:bg-white/20 rounded-full w-16 h-16"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-white h-1 rounded-full transition-all duration-200"
                style={{ width: `${played * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-white text-xs">
              <span>{formatTime(playedSeconds)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => seekTo(Math.max(0, playedSeconds - 10))}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => seekTo(Math.min(duration, playedSeconds + 10))}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={addBookmark}
                className="text-white hover:bg-white/20"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-20">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
