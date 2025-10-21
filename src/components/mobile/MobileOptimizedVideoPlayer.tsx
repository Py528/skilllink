'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, Download, Share, Heart, Bookmark,
  SkipBack, SkipForward
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
// import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileVideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  className?: string;
}

export const MobileOptimizedVideoPlayer: React.FC<MobileVideoPlayerProps> = ({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  onLike,
  onBookmark,
  onShare,
  onDownload,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  // const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    // setTouchEnd({
    //   x: e.changedTouches[0].clientX,
    //   y: e.changedTouches[0].clientY,
    //   time: Date.now()
    // });

    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 300) {
      if (deltaX > 50) {
        // Swipe right - seek forward
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.currentTime + 10,
            videoRef.current.duration
          );
        }
      } else if (deltaX < -50) {
        // Swipe left - seek backward
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(
            videoRef.current.currentTime - 10,
            0
          );
        }
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaTime < 300) {
      if (deltaY > 50) {
        // Swipe down - volume down
        setVolume(prev => Math.max(0, prev - 0.1));
      } else if (deltaY < -50) {
        // Swipe up - volume up
        setVolume(prev => Math.min(1, prev + 0.1));
      }
    } else if (deltaTime < 200) {
      // Tap - toggle play/pause
      togglePlayPause();
    }

    setTouchStart(null);
    // setTouchEnd(null);
  }, [touchStart, togglePlayPause]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onProgress?.(videoRef.current.currentTime);
    }
  }, [onProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
    if (videoRef.current) {
      videoRef.current.volume = value[0];
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
    onLike?.();
  }, [isLiked, onLike]);

  const handleBookmark = useCallback(() => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.();
  }, [isBookmarked, onBookmark]);

  // Auto-hide controls on mobile
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  return (
    <div className={cn('relative w-full bg-black rounded-lg overflow-hidden', className)}>
      <div
        className="relative w-full aspect-video"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowControls(!showControls)}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            setIsPlaying(false);
            onComplete?.();
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={() => setVolume(videoRef.current?.volume || 0)}
        />

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile-Optimized Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="text-white hover:bg-white/20"
                  >
                    <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className="text-white hover:bg-white/20"
                  >
                    <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-blue-500 text-blue-500')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4" />
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
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-white text-xs">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                        }
                      }}
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
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = Math.min(
                            videoRef.current.duration,
                            videoRef.current.currentTime + 10
                          );
                        }
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-4 w-4" />
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
                      <Slider
                        value={[volume]}
                        max={1}
                        step={0.1}
                        onValueChange={handleVolumeChange}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-[200px]"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-white text-sm font-medium">Playback Speed</label>
                  <div className="flex space-x-1 mt-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <Button
                        key={rate}
                        variant={playbackRate === rate ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePlaybackRateChange(rate)}
                        className="text-xs"
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    className="flex-1 text-white border-white/20 hover:bg-white/20"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShare}
                    className="flex-1 text-white border-white/20 hover:bg-white/20"
                  >
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileOptimizedVideoPlayer;
