import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { getS3Url } from '@/lib/courseUtils';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(-1);
  const [quality, setQuality] = useState('Auto');
  // Error state for video loading
  const [videoError, setVideoError] = useState(false);
  // Drag-to-seek state
  const seekingRef = useRef(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Helper to get seek time from event
  const getSeekTimeFromEvent = (e: MouseEvent | TouchEvent) => {
    let clientX;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('clientX' in e) {
      clientX = e.clientX;
    } else {
      return null;
    }
    const seekBar = seekBarRef.current;
    if (!seekBar || !duration) return null;
    const rect = seekBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pos * duration;
  };

  // Global listeners for drag
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!seekingRef.current) return;
      const time = getSeekTimeFromEvent(e);
      if (time !== null && videoRef.current) {
        videoRef.current.currentTime = time;
        setSeekTime(time);
      }
    };
    const handleUp = (e: MouseEvent | TouchEvent) => {
      if (!seekingRef.current) return;
      const time = getSeekTimeFromEvent(e);
      if (time !== null && videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
      setIsSeeking(false);
      setSeekTime(null);
      seekingRef.current = false;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [duration]);

  // Start seeking
  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    seekingRef.current = true;
    setIsSeeking(true);
    const time = getSeekTimeFromEvent(e.nativeEvent || e);
    if (time !== null && videoRef.current) {
      videoRef.current.currentTime = time;
      setSeekTime(time);
    }
  };

  // Fallbacks for missing data
  const safePoster = poster || '';
  const safeTitle = title || 'Untitled Video';

  // Always resolve src and poster to full URLs
  const resolvedSrc = getS3Url(src);
  const resolvedPoster = getS3Url(safePoster);

  // Auto-hide controls (only on mobile)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const isMobile = window.innerWidth <= 768;
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      if (isPlaying && isMobile) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };
    const handleMouseMove = () => resetTimeout();
    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    resetTimeout();
    return () => {
      clearTimeout(timeout);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Video event handlers (remove buffering logic)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const changeQuality = useCallback((newQuality: string) => {
    setQuality(newQuality);
    // In a real implementation, you would switch video sources here
  }, []);

  const enterPictureInPicture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) return;

    try {
      await video.requestPictureInPicture();
    } catch (error) {
      console.error('Failed to enter Picture-in-Picture mode:', error);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = isMuted ? 0 : volume * 100;

  // Keyboard accessibility (must be after all callback definitions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          togglePlay();
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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skip, setVolume, toggleMute, toggleFullscreen]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
          isTheaterMode ? 'mx-0 max-w-none' : ''
        } group" tabIndex={0}`}
        onDoubleClick={toggleFullscreen}
      >
        {/* Ambient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-pulse pointer-events-none" />
        {/* Video Element */}
        {resolvedSrc && !videoError ? (
          <video
            ref={videoRef}
            src={resolvedSrc}
            poster={resolvedPoster}
            className={
              isFullscreen
                ? "w-full h-full object-contain bg-black"
                : "w-full h-[320px] max-w-2xl max-h-[320px] mx-auto object-contain bg-black"
            }
            onClick={togglePlay}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            onError={() => setVideoError(true)}
            tabIndex={-1}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-[300px] bg-zinc-900 text-white rounded-2xl">
            <span className="text-3xl mb-2">🚫</span>
            <span className="font-semibold">Video unavailable</span>
            <span className="text-xs mt-1">{videoError ? 'Failed to load video.' : 'No video URL provided.'}</span>
            <span className="text-xs mt-1 break-all">{resolvedSrc || '(empty URL)'}</span>
          </div>
        )}
        {/* Center Play Button: only the button area toggles play/pause */}
        {resolvedSrc && !videoError && !isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <button
              type="button"
              className="flex items-center justify-center bg-white/10 backdrop-blur-lg rounded-full p-4 md:p-6 hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg min-w-[56px] min-h-[56px] max-w-[80px] max-h-[80px] pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              onClick={togglePlay}
              tabIndex={0}
              aria-label="Play video"
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && togglePlay()}
            >
              <Play className="w-12 h-12 md:w-16 md:h-16 text-white ml-1 md:ml-2" fill="white" />
            </button>
          </div>
        )}
        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } pointer-events-none md:pointer-events-auto`}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-white text-xl font-bold truncate max-w-[60vw]">{safeTitle}</h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={enterPictureInPicture}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  tabIndex={0}
                  aria-label="Picture in Picture"
                >
                  <PictureInPicture className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  tabIndex={0}
                  aria-label="Theater mode"
                >
                  <MonitorSpeaker className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="absolute bottom-20 left-6 right-6">
            <div className="relative">
              {/* Progress Track */}
              <div
                id="seek-bar"
                ref={seekBarRef}
                className="h-2 md:h-2.5 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 rounded-full cursor-pointer group transition-all duration-200 shadow-inner"
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setHoverProgress(pos * 100);
                }}
                onMouseLeave={() => setHoverProgress(-1)}
                tabIndex={0}
                aria-label="Seek bar"
              >
                {/* Progress Fill */}
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-full relative overflow-visible shadow-lg transition-all duration-200"
                  style={{ width: `${((isSeeking && seekTime !== null) ? (seekTime / duration) * 100 : progressPercentage)}%`, boxShadow: '0 0 8px 2px rgba(168,85,247,0.3), 0 0 16px 4px rgba(236,72,153,0.15)' }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                {/* Progress Handle */}
                <div 
                  className="absolute top-1/2 w-4 h-4 md:w-5 md:h-5 bg-white border-2 border-purple-400 shadow-lg transform -translate-y-1/2 scale-100 group-hover:scale-125 group-hover:opacity-100 opacity-0 focus:opacity-100 focus:scale-125 transition-all duration-200"
                  style={{ left: `${((isSeeking && seekTime !== null) ? (seekTime / duration) * 100 : progressPercentage)}%`, marginLeft: '-10px', boxShadow: '0 0 8px 2px rgba(168,85,247,0.3)' }}
                />
                {/* Hover Preview Tooltip */}
                {(hoverProgress >= 0 || (isSeeking && seekTime !== null)) && (
                  <div
                    className="absolute -top-24 left-0 flex flex-col items-center pointer-events-none"
                    style={{ left: `calc(${(isSeeking && seekTime !== null) ? ((seekTime / duration) * 100) : hoverProgress}% - 32px)` }}
                  >
                    {/* Preview thumbnail */}
                    {resolvedPoster && (
                      <img
                        src={resolvedPoster}
                        alt="Preview"
                        className="w-16 h-10 object-cover rounded-md shadow border border-zinc-700 bg-zinc-900"
                        draggable={false}
                      />
                    )}
                    {/* Time tooltip */}
                    <div className="mt-1 px-2 py-0.5 bg-zinc-900/90 text-white text-xs rounded-md shadow border border-zinc-700 min-w-[36px] text-center">
                      {formatTime((isSeeking && seekTime !== null) ? seekTime! : ((hoverProgress / 100) * duration))}
                    </div>
                  </div>
                )}
              </div>
              {/* Time Display */}
              <div className="flex justify-between mt-2 text-sm text-white/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => skip(-10)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  tabIndex={0}
                  aria-label="Rewind 10 seconds"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="bg-white/10 backdrop-blur-lg text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  tabIndex={0}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                <button
                  onClick={() => skip(10)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  tabIndex={0}
                  aria-label="Forward 10 seconds"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                {/* Volume Control */}
                <div className="flex items-center space-x-3 group">
                  <button
                    onClick={toggleMute}
                    className="text-white/80 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    tabIndex={0}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <div className="w-24 transition-all duration-300">
                    <div 
                      className="h-2 bg-white/30 rounded-full cursor-pointer mt-1"
                      onClick={handleVolumeChange}
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
              <div className="flex items-center space-x-3">
                {/* Settings Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    tabIndex={0}
                    aria-label="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-lg rounded-lg p-3 min-w-[200px] border border-white/10 shadow-xl z-10">
                      {/* Playback Speed */}
                      <div className="mb-4">
                        <h3 className="text-white text-sm font-medium mb-2">Playback Speed</h3>
                        <div className="grid grid-cols-3 gap-1">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`px-2 py-1 text-xs rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
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
                              className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
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
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  tabIndex={0}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
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
