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
  Circle
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
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(-1);
  const [quality, setQuality] = useState('Auto');

  // Fallbacks for missing data
  const safePoster = poster || '';
  const safeTitle = title || 'Untitled Video';

  // Always resolve src and poster to full URLs
  const resolvedSrc = getS3Url(src);
  const resolvedPoster = getS3Url(safePoster);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      if (isPlaying) {
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

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleLoadStart = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
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

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    video.currentTime = time;
    setCurrentTime(time);
  }, [duration]);

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

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div 
        ref={containerRef}
        className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ${
          isTheaterMode ? 'mx-0 max-w-none' : ''
        }`}
        onDoubleClick={toggleFullscreen}
      >
        {/* Ambient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-pulse" />
        
        {/* Video Element */}
        <video
          ref={videoRef}
          src={resolvedSrc}
          poster={resolvedPoster}
          className="w-full h-auto max-h-[70vh] object-cover"
          onClick={togglePlay}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        />

        {/* Loading Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="relative">
              <Circle className="w-12 h-12 text-white/30 animate-pulse" />
              <div className="absolute inset-0 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Center Play Button */}
        {!isPlaying && !isBuffering && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={togglePlay}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-6 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
              <Play className="w-16 h-16 text-white ml-2" fill="white" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-white text-xl font-bold">{safeTitle}</h1>
              <div className="flex items-center space-x-3">
                <button
                  onClick={enterPictureInPicture}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <PictureInPicture className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
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
                className="h-2 bg-white/20 rounded-full cursor-pointer group hover:h-3 transition-all duration-200"
                onClick={handleSeek}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setHoverProgress(pos * 100);
                }}
                onMouseLeave={() => setHoverProgress(-1)}
              >
                {/* Progress Fill */}
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative overflow-hidden"
                  style={{ width: `${progressPercentage}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
                
                {/* Progress Handle */}
                <div 
                  className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${progressPercentage}%`, marginLeft: '-8px' }}
                />

                {/* Hover Preview */}
                {hoverProgress >= 0 && (
                  <div 
                    className="absolute top-1/2 w-1 h-6 bg-white/50 transform -translate-y-1/2 transition-all duration-100"
                    style={{ left: `${hoverProgress}%` }}
                  />
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
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="bg-white/10 backdrop-blur-lg text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </button>
                
                <button
                  onClick={() => skip(10)}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-3 group">
                  <button
                    onClick={toggleMute}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  <div className="w-0 group-hover:w-24 overflow-hidden transition-all duration-300">
                    <div 
                      className="h-1 bg-white/20 rounded-full cursor-pointer"
                      onClick={handleVolumeChange}
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
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-lg rounded-lg p-3 min-w-[200px] border border-white/10">
                      {/* Playback Speed */}
                      <div className="mb-4">
                        <h3 className="text-white text-sm font-medium mb-2">Playback Speed</h3>
                        <div className="grid grid-cols-3 gap-1">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                playbackRate === rate 
                                  ? 'bg-purple-500 text-white' 
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
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
                              className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                                quality === qual 
                                  ? 'bg-purple-500 text-white' 
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
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
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
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
