"use client";

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';
import { PauseCircle, PlayCircle, Maximize, Volume2, VolumeX, Check } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  onComplete: () => void;
}

export function VideoPlayer({ url, title, onComplete }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [completed, setCompleted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (playing) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const container = playerContainerRef.current;
    container?.addEventListener('mousemove', handleMouseMove);
    container?.addEventListener('mouseleave', () => setShowControls(false));
    
    return () => {
      container?.removeEventListener('mousemove', handleMouseMove);
      container?.removeEventListener('mouseleave', () => setShowControls(false));
      clearTimeout(timeout);
    };
  }, [playing]);
  
  const handlePlayPause = () => {
    setPlaying(!playing);
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setMuted(value[0] === 0);
  };
  
  const handleToggleMute = () => {
    setMuted(!muted);
  };
  
  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      
      // Mark as complete when 90% watched
      if (state.played > 0.9 && !completed) {
        setCompleted(true);
        onComplete();
      }
    }
  };
  
  const handleSeek = (value: number[]) => {
    setPlayed(value[0]);
  };
  
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };
  
  const handleSeekMouseUp = (value: number[]) => {
    setSeeking(false);
    playerRef.current?.seekTo(value[0]);
  };
  
  const handleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <div 
      ref={playerContainerRef}
      className="relative w-full h-full bg-black cursor-pointer"
      onClick={handlePlayPause}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        onProgress={handleProgress}
        onDuration={setDuration}
        progressInterval={500}
        style={{ position: 'absolute', top: 0, left: 0 }}
        config={{
          youtube: {
            playerVars: { modestbranding: 1 }
          }
        }}
      />
      
      {/* Overlay for controls */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls || !playing ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Title */}
        <div className="absolute top-4 left-4 right-4">
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
        
        {/* Completed indicator */}
        {completed && (
          <div className="absolute top-4 right-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-500 text-white rounded-full p-1"
            >
              <Check size={16} />
            </motion.div>
          </div>
        )}
        
        {/* Progress bar */}
        <div className="w-full mb-2">
          <Slider 
            value={[played]}
            min={0}
            max={1}
            step={0.001}
            onValueChange={handleSeek}
            onValueCommit={handleSeekMouseUp}
            onPointerDown={handleSeekMouseDown}
            className="cursor-pointer"
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="text-white hover:bg-white/10"
            >
              {playing ? <PauseCircle size={22} /> : <PlayCircle size={22} />}
            </Button>
            
            <div className="flex items-center space-x-2 w-32">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMute();
                }}
                className="text-white hover:bg-white/10"
              >
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </Button>
              <Slider 
                value={[muted ? 0 : volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
              />
            </div>
            
            <span className="text-white text-sm">
              {formatTime(played * duration)} / {formatTime(duration)}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreen();
            }}
            className="text-white hover:bg-white/10"
          >
            <Maximize size={18} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}