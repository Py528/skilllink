"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl?: string
  videoS3Key?: string
  posterUrl?: string
  thumbnailUrl?: string
}

// S3 bucket configuration
const S3_BUCKET_URL = 'https://course-skilllearn.s3.us-east-1.amazonaws.com'

export function VideoPlayer({ videoUrl, videoS3Key, posterUrl, thumbnailUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Construct the final video URL
  const finalVideoUrl = (() => {
    if (videoUrl) {
      // If it's already a full URL, use it as is
      if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
        console.log('Using full URL:', videoUrl)
        return videoUrl
      }
      // If it's a relative path (like videos/filename.mp4), construct the full S3 URL
      if (videoUrl.startsWith('videos/')) {
        const fullUrl = `${S3_BUCKET_URL}/${videoUrl}`
        console.log('Constructed S3 URL from videos/ path:', fullUrl)
        return fullUrl
      }
      // If it's just a filename, assume it's in the videos folder
      const fullUrl = `${S3_BUCKET_URL}/videos/${videoUrl}`
      console.log('Constructed S3 URL from filename:', fullUrl)
      return fullUrl
    }
    if (videoS3Key) {
      const fullUrl = `${S3_BUCKET_URL}/${videoS3Key}`
      console.log('Using S3 key:', fullUrl)
      return fullUrl
    }
    console.log('No video URL provided')
    return null
  })()
  
  // Get video MIME type based on file extension
  const getVideoType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp4':
        return 'video/mp4'
      case 'webm':
        return 'video/webm'
      case 'ogg':
        return 'video/ogg'
      case 'mov':
        return 'video/quicktime'
      default:
        return 'video/mp4'
    }
  }
  
  const videoType = finalVideoUrl ? getVideoType(finalVideoUrl) : 'video/mp4'
  
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => {
      setDuration(video.duration)
      setIsLoading(false)
      setError(null)
    }
    const handleEnded = () => setIsPlaying(false)
    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
    }
    const handleCanPlay = () => {
      setIsLoading(false)
      setError(null)
    }
    const handleError = (e: Event) => {
      setIsLoading(false)
      setError('Failed to load video')
      console.error('Video error:', e)
    }
    
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [finalVideoUrl])

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 2000)
    }

    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false)
      }
    }

    const videoContainer = videoRef.current?.parentElement
    if (videoContainer) {
      videoContainer.addEventListener('mousemove', handleMouseMove)
      videoContainer.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (videoContainer) {
        videoContainer.removeEventListener('mousemove', handleMouseMove)
        videoContainer.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])
  
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    
    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((err) => {
        console.error('Error playing video:', err)
        setError('Failed to play video')
      })
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleTimeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }
  
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    
    video.volume = value[0]
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }
  
  // Default poster image
  const defaultPoster = "https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  
  // Construct the poster URL with S3 bucket support
  const getPosterUrl = () => {
    if (thumbnailUrl) {
      // If it's already a full URL, use it as is
      if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
        console.log('Using full thumbnail URL:', thumbnailUrl)
        return thumbnailUrl
      }
      // If it's a relative path, construct the full S3 URL
      if (thumbnailUrl.startsWith('thumbnails/') || thumbnailUrl.startsWith('images/')) {
        const fullUrl = `${S3_BUCKET_URL}/${thumbnailUrl}`
        console.log('Constructed S3 thumbnail URL from path:', fullUrl)
        return fullUrl
      }
      // If it's just a filename, assume it's in the thumbnails folder
      const fullUrl = `${S3_BUCKET_URL}/thumbnails/${thumbnailUrl}`
      console.log('Constructed S3 thumbnail URL from filename:', fullUrl)
      return fullUrl
    }
    if (posterUrl) {
      console.log('Using poster URL:', posterUrl)
      return posterUrl
    }
    console.log('Using default poster')
    return defaultPoster
  }
  
  const finalPosterUrl = getPosterUrl()
  
  return (
    <motion.div 
      className="rounded-md overflow-hidden bg-black relative group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onDoubleClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="w-full aspect-video cursor-pointer"
        poster={finalPosterUrl}
        onClick={togglePlay}
        preload="metadata"
        crossOrigin="anonymous"
      >
        {finalVideoUrl ? (
          <source src={finalVideoUrl} type={videoType} />
        ) : null}
        Your browser does not support the video tag.
      </video>

      <AnimatePresence>
        {isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="text-center text-white">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-sm">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Please check your internet connection</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showControls && !error && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
                  whileHover={{ height: '0.5rem' }}
                  transition={{ duration: 0.2 }}
                >
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleTimeChange}
                    className="cursor-pointer"
                  />
                </motion.div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20 rounded-full h-8 w-8" 
                      onClick={togglePlay}
                      disabled={!finalVideoUrl}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                  </motion.div>
                  
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-white/20 rounded-full h-8 w-8" 
                        onClick={toggleMute}
                        disabled={!finalVideoUrl}
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </Button>
                    </motion.div>
                    <motion.div 
                      className="w-20"
                      whileHover={{ width: '6rem' }}
                      transition={{ duration: 0.2 }}
                    >
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="cursor-pointer"
                        disabled={!finalVideoUrl}
                      />
                    </motion.div>
                  </div>
                  
                  <motion.span 
                    className="text-xs text-white/90"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {formatTime(currentTime)} / {formatTime(duration || 0)}
                  </motion.span>
                </div>
                
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                    disabled={!finalVideoUrl}
                  >
                    <Maximize size={16} />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPlaying && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center"
            onClick={togglePlay}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white/20 rounded-full p-4 backdrop-blur-sm cursor-pointer"
            >
              <Play className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}