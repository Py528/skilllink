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
  PictureInPicture, 
  MonitorSpeaker, 
  Loader2, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { getSignedVideoUrl } from '@/lib/courseUtils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import './video-player.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  poster,
  title
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Core video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [quality, setQuality] = useState('Auto');
  
  // UI state
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isVolumeHovering, setIsVolumeHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Loading and error state
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fallbacks for missing data
  const safePoster = poster || '';
  const safeTitle = title || 'Untitled Video';

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get signed URL for video
  useEffect(() => {
    const loadSignedUrl = async () => {
      if (!src) {
        setVideoError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setVideoError(false);

      try {
        console.log('Getting signed URL for video:', src);
        const url = await getSignedVideoUrl(src);
        
        if (url) {
          console.log('Successfully got signed URL:', url);
          setSignedUrl(url);
          setIsLoading(false);
        } else {
          console.error('Failed to get signed URL for video');
          setVideoError(true);
          setIsLoading(false);
          toast.error('Failed to load video. Please try again.');
        }
      } catch (error) {
        console.error('Error getting signed URL:', error);
        setVideoError(true);
        setIsLoading(false);
        toast.error('Error loading video. Please check your connection.');
      }
    };

    loadSignedUrl();
  }, [src]);

  // Improved controls auto-hide logic
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    
    if (isPlaying && !showSettings) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, isMobile ? 2000 : 3000);
    }
  }, [isPlaying, showSettings, isMobile]);

  // Controls auto-hide with proper mobile handling
  useEffect(() => {
    const handleMouseMove = () => resetControlsTimeout();
    const handleTouchStart = () => resetControlsTimeout();
    const container = containerRef.current;
    
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleTouchStart);
    }
    
    resetControlsTimeout();
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [resetControlsTimeout]);

  // ReactPlayer event handlers
  const handleReady = () => {
    console.log('Player ready');
    setIsLoading(false);
  };

  const handleStart = () => {
    console.log('Video started');
    setIsPlaying(true);
    resetControlsTimeout();
  };

  const handlePlay = () => {
    console.log('Video playing');
    setIsPlaying(true);
    resetControlsTimeout();
  };

  const handlePause = () => {
    console.log('Video paused');
    setIsPlaying(false);
  };

  // Throttle progress updates for better performance
  const progressUpdateRef = useRef<number | null>(null);
  
  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    // Cancel previous frame if it exists
    if (progressUpdateRef.current) {
      cancelAnimationFrame(progressUpdateRef.current);
    }
    
    // Use requestAnimationFrame for smooth progress updates
    progressUpdateRef.current = requestAnimationFrame(() => {
      setPlayed(state.played);
      setPlayedSeconds(state.playedSeconds);
    });
  };

  const handleDuration = (duration: number) => {
    console.log('Video duration:', duration);
    setDuration(duration);
  };

  const handleError = (error: Error) => {
    console.error('Video error:', error);
    setVideoError(true);
    setIsLoading(false);
    toast.error('Video failed to load. Please try again.');
  };

  const handleSeek = (seconds: number) => {
    setPlayedSeconds(seconds);
    resetControlsTimeout();
  };

  // Control functions
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let clientX: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = e.clientX;
    } else {
      return;
    }
    const pos = (clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {
        toast.error('Fullscreen not supported');
      });
    } else {
      document.exitFullscreen().catch(() => {
        toast.error('Failed to exit fullscreen');
      });
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + seconds);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const changePlaybackRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    toast.success(`Playback speed: ${rate}x`);
  }, []);

  const changeQuality = useCallback((newQuality: string) => {
    setQuality(newQuality);
    toast.success(`Quality: ${newQuality}`);
  }, []);

  const enterPictureInPicture = useCallback(async () => {
    const video = containerRef.current?.querySelector('video');
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      await video.requestPictureInPicture();
    } catch (error) {
      console.error('Failed to enter Picture-in-Picture mode:', error);
      toast.error('Picture-in-Picture not supported');
    }
  }, []);

  // Retry loading video
  const handleRetry = async () => {
    setIsRetrying(true);
    setVideoError(false);
    setIsLoading(true);
    
    try {
      const url = await getSignedVideoUrl(src);
      if (url) {
        setSignedUrl(url);
        setVideoError(false);
        toast.success('Video loaded successfully!');
      } else {
        setVideoError(true);
        toast.error('Unable to load video. Please check the file.');
      }
    } catch {
      setVideoError(true);
      toast.error('Failed to load video. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  // Force reload video with new signed URL
  const handleForceReload = async () => {
    setIsRetrying(true);
    setVideoError(false);
    setIsLoading(true);
    
    try {
      const url = await getSignedVideoUrl(src);
      if (url) {
        setSignedUrl(url);
        setVideoError(false);
        toast.success('Video reloaded successfully!');
      } else {
        setVideoError(true);
        toast.error('Unable to reload video.');
      }
    } catch {
      setVideoError(true);
      toast.error('Failed to reload video.');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = played * 100;
  const volumePercentage = isMuted ? 0 : volume * 100;

  // Improved keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs or when settings menu is open
      if (document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.tagName === 'BUTTON' ||
        showSettings
      )) return;

      // Only handle keys when video container has focus or no specific element is focused
      const container = containerRef.current;
      if (container && !container.contains(document.activeElement) && document.activeElement !== document.body) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Enter':
          e.preventDefault();
          if (document.activeElement === container) {
            togglePlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(v => Math.min(1, v + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(v => Math.max(0, v - 0.05));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (showSettings) {
            setShowSettings(false);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, toggleMute, toggleFullscreen, showSettings]);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (progressUpdateRef.current) {
        cancelAnimationFrame(progressUpdateRef.current);
      }
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center justify-center w-full h-[320px] bg-zinc-900 text-white rounded-2xl">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <div className="absolute inset-0 w-12 h-12 border-2 border-primary/20 rounded-full animate-pulse"></div>
            </div>
            <span className="font-semibold text-lg mb-2">Loading video...</span>
            <span className="text-sm text-muted-foreground text-center max-w-md px-4">
              Getting secure access to video content
            </span>
            <div className="mt-4 w-48 h-1 bg-zinc-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with improved mobile-friendly buttons
  if (videoError || !signedUrl) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center justify-center w-full h-[320px] bg-zinc-900 text-white rounded-2xl p-4 sm:p-6">
            <div className="relative mb-4 sm:mb-6">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400" />
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-2 border-red-400/20 rounded-full animate-ping"></div>
            </div>
            <h3 className="font-bold text-lg sm:text-xl mb-2 text-center">Video Unavailable</h3>
            <p className="text-xs sm:text-sm text-center max-w-md text-muted-foreground mb-4 sm:mb-6 px-2">
              {videoError 
                ? 'Unable to access video content. The file may be private or unavailable.'
                : 'No video URL provided.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center mb-4 sm:mb-6 w-full max-w-sm">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className="text-white border-white/20 hover:bg-white/10 transition-all duration-200 min-h-[44px] sm:min-h-[36px]"
              >
                {isRetrying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Try Again
              </Button>
              <Button
                onClick={handleForceReload}
                disabled={isRetrying}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className="text-white border-white/20 hover:bg-white/10 transition-all duration-200 min-h-[44px] sm:min-h-[36px]"
              >
                Reload Video
              </Button>
              {src && (
                <Button
                  onClick={() => {
                    window.open(src, '_blank');
                    toast.info('Opening video URL in new tab');
                  }}
                  variant="outline"
                  size={isMobile ? "default" : "sm"}
                  className="text-white border-white/20 hover:bg-white/10 transition-all duration-200 min-h-[44px] sm:min-h-[36px]"
                >
                  Open in Browser
                </Button>
              )}
            </div>
            {src && (
              <div className="mt-2 text-xs text-muted-foreground break-all max-w-full overflow-hidden text-ellipsis bg-zinc-800/50 p-2 rounded text-center">
                <strong>Source:</strong> {src}
              </div>
            )}
            <div className="mt-4 p-3 sm:p-4 bg-red-900/20 rounded-lg border border-red-500/30 max-w-lg">
              <p className="text-xs sm:text-sm text-red-300 mb-2 sm:mb-3">
                <strong>🔧 Troubleshooting:</strong>
              </p>
              <ul className="text-xs text-red-300 space-y-1 list-disc list-inside text-left">
                <li>Check AWS S3 permissions for video access</li>
                <li>Verify the video file exists in the S3 bucket</li>
                <li>Try refreshing the page or clearing browser cache</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div 
        ref={containerRef}
        className={`video-player-container relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
          isTheaterMode ? 'mx-0 max-w-none' : ''
        } group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400`}
        tabIndex={0}
        onDoubleClick={toggleFullscreen}
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
      >
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />
        
        {/* ReactPlayer with optimized settings for smooth playback */}
        <div className="relative w-full h-[320px]">
          <ReactPlayer
            ref={playerRef}
            url={signedUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            playbackRate={playbackRate}
            onReady={handleReady}
            onStart={handleStart}
            onPlay={handlePlay}
            onPause={handlePause}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onError={handleError}
            onSeek={handleSeek}
            // Performance optimizations
            pip={false}
            controls={false}
            light={false}
            loop={false}
            playsinline={true}
            preload="metadata"
            config={{
              file: {
                attributes: {
                  poster: safePoster,
                  crossOrigin: 'anonymous',
                  preload: 'metadata',
                  playsInline: true,
                  'webkit-playsinline': 'true',
                  style: {
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                  }
                },
                forceHLS: false,
                forceDASH: false,
                hlsOptions: {
                  enableWorker: true,
                  lowLatencyMode: true,
                  backBufferLength: 90
                }
              }
            }}
            style={{
              borderRadius: '1rem',
              overflow: 'hidden',
              // Hardware acceleration
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          />
        </div>
        
        {/* Center Play Button with improved mobile touch area */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <button
              type="button"
              className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px] p-3 sm:p-4"
              onClick={togglePlay}
              tabIndex={0}
              aria-label="Play video"
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && togglePlay()}
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white ml-1 sm:ml-2" fill="white" />
            </button>
          </div>
        )}
        
        {/* Controls Overlay with improved mobile handling */}
        <div 
          className={`controls-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } ${isMobile ? 'pointer-events-auto' : 'pointer-events-none group-hover:pointer-events-auto'}`}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-white text-lg sm:text-xl font-bold truncate max-w-[60vw]">{safeTitle}</h1>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={enterPictureInPicture}
                  className="control-button text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                  tabIndex={0}
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="control-button text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                  tabIndex={0}
                  aria-label="Theater mode"
                >
                  <MonitorSpeaker className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar with improved mobile handling */}
          <div className="absolute bottom-16 sm:bottom-20 left-3 right-3 sm:left-6 sm:right-6">
            <div className="relative">
              {/* Progress Track */}
              <div
                className="h-3 sm:h-2 md:h-2.5 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded-full cursor-pointer group transition-all duration-200 shadow-inner"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (playerRef.current) {
                    playerRef.current.seekTo(pos);
                  }
                }}
                tabIndex={0}
                aria-label="Seek bar"
              >
                {/* Progress Fill with hardware acceleration */}
                <div 
                  className="progress-fill h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full relative overflow-visible shadow-lg"
                  style={{ 
                    width: `${progressPercentage}%`
                  }}
                >
                  {/* Subtle Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                </div>
                {/* Progress Handle with smooth transitions */}
                <div 
                  className="progress-handle absolute top-1/2 w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white border-2 border-purple-400 shadow-lg scale-100 group-hover:scale-125 group-hover:opacity-100 opacity-0 focus:opacity-100 focus:scale-125 transition-all duration-200"
                  style={{ 
                    left: `${progressPercentage}%`, 
                    marginLeft: '-10px'
                  }}
                />
              </div>
              {/* Time Display */}
              <div className="flex justify-between mt-2 text-xs sm:text-sm text-white/80">
                <span>{formatTime(playedSeconds)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Controls with improved mobile layout */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => skip(-10)}
                  className="control-button text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                  tabIndex={0}
                  aria-label="Rewind 10 seconds"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="control-button bg-white/10 backdrop-blur-lg text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[48px] min-w-[48px] sm:min-h-[44px] sm:min-w-[44px]"
                  tabIndex={0}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button
                  onClick={() => skip(10)}
                  className="control-button text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                  tabIndex={0}
                  aria-label="Forward 10 seconds"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                {/* Volume Control with improved mobile handling */}
                <div className="flex items-center space-x-2 sm:space-x-3 group">
                  <button
                    onClick={toggleMute}
                    className="control-button text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
                    tabIndex={0}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div 
                    className={`transition-all duration-300 ${isVolumeHovering || isMobile ? 'w-20 sm:w-24' : 'w-0 sm:w-24'} overflow-hidden`}
                    onMouseEnter={() => setIsVolumeHovering(true)}
                    onMouseLeave={() => setIsVolumeHovering(false)}
                  >
                    <div 
                      className="h-2 bg-white/30 rounded-full cursor-pointer mt-1"
                      onClick={handleVolumeChange}
                      onTouchStart={handleVolumeChange}
                      tabIndex={0}
                      aria-label="Volume bar"
                    >
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-150"
                        style={{ width: `${volumePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Controls */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Settings Menu with improved mobile layout */}
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="control-button text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                    tabIndex={0}
                    aria-label="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-lg rounded-lg p-3 min-w-[200px] sm:min-w-[220px] border border-white/10 shadow-xl z-20">
                      {/* Playback Speed */}
                      <div className="mb-4">
                        <h3 className="text-white text-sm font-medium mb-2">Playback Speed</h3>
                        <div className="grid grid-cols-3 gap-1">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`px-2 py-1 text-xs rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[32px] ${
                                playbackRate === rate 
                                  ? 'bg-purple-500 text-white' 
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                              tabIndex={0}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Quality */}
                      <div>
                        <h3 className="text-white text-sm font-medium mb-2">Quality</h3>
                        <div className="space-y-1">
                          {['Auto', '1080p', '720p', '480p', '360p'].map((qual) => (
                            <button
                              key={qual}
                              onClick={() => changeQuality(qual)}
                              className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[32px] ${
                                quality === qual 
                                  ? 'bg-purple-500 text-white' 
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                              tabIndex={0}
                            >
                              {qual}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleFullscreen}
                  className="control-button text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                  tabIndex={0}
                  aria-label={document.fullscreenElement ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {document.fullscreenElement ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;