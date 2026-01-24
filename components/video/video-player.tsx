'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  vastTagUrl?: string;
  previewUrl?: string | null;
}

interface QualityLevel {
  height: number;
  levelIndex: number; // -1 for Auto
  label: string; 
}

// Playback speeds array
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function VideoPlayer({ hlsUrl, thumbnailUrl, title, vastTagUrl, previewUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Menus State
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Ad State
  const [error, setError] = useState<string | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-container')) {
        setShowQualityMenu(false);
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleVolume();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted]); // Dependencies for toggle functions

  // Setup HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true, 
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((level, index) => ({
          height: level.height,
          levelIndex: index,
          label: `${level.height}p`,
        }));
        // Sort specifically: High to Low
        levels.sort((a, b) => b.height - a.height);
        
        // Add Auto option
        setQualities([{ height: 0, levelIndex: -1, label: 'Auto' }, ...levels]);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        // Only handle fatal errors differently if needed, simple logging for now
        if (data.fatal) {
           setError('Stream error');
           hls.destroy();
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari Native HLS
      video.src = hlsUrl;
    }
  }, [hlsUrl]);

  // Handle Quality Change
  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Video Events
  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) setDuration(videoRef.current.duration);
      
      if (videoRef.current.buffered.length > 0) {
        setBuffered((videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / videoRef.current.duration) * 100);
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleVolume = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      setVolume(videoRef.current.muted ? 0 : videoRef.current.volume || 1);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
       videoRef.current.volume = val;
       videoRef.current.muted = val === 0;
       setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      onDoubleClick={() => toggleFullscreen()} // Double click to fullscreen
    >
      <video
        ref={videoRef}
        className="w-full h-full cursor-pointer"
        onClick={togglePlay}
        poster={thumbnailUrl || undefined}
        onTimeUpdate={onTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
      />
      
      {/* Loading / Buffering could go here */}

      {/* ERROR */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
           <p className="text-white bg-red-600/80 px-4 py-2 rounded">{error}</p>
        </div>
      )}

      {/* BIG PLAY BUTTON (Overlay) */}
      {!isPlaying && !error && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 bg-xred-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
             <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      {/* CUSTOM CONTROLS */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 z-20 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="w-full h-1.5 bg-gray-600 cursor-pointer rounded-full mb-4 relative hover:h-2.5 transition-all group/progress"
          onClick={handleSeek}
        >
            <div 
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full" 
              style={{ width: `${buffered}%` }} 
            />
            <div 
              className="absolute top-0 left-0 h-full bg-xred-600 rounded-full relative" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
               <div className="absolute right-0 -top-1 w-3 h-3 bg-xred-600 rounded-full opacity-0 group-hover/progress:opacity-100 shadow transform scale-150" />
            </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button onClick={togglePlay} className="text-white hover:text-xred-500 transition-colors" title={isPlaying ? "Pause (k)" : "Play (k)"}>
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

             {/* Skip Buttons */}
            <button onClick={() => skip(-10)} className="text-white hover:text-gray-300 hidden sm:block" title="Rewind 10s (Left Arrow)">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.5 8h-6.75M8 6l-2.25 2L8 10M12.5 16h6.75M16 14l2.25 2L16 18" transform="scale(-1, 1) translate(-24, 0)" /><text x="8" y="15" fontSize="8" fill="currentColor" textAnchor="middle">-10</text></svg>
            </button>
            <button onClick={() => skip(10)} className="text-white hover:text-gray-300 hidden sm:block" title="Forward 10s (Right Arrow)">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.5 8h6.75M16 6l2.25 2L16 10M11.5 16h-6.75M8 14l-2.25 2L8 18" /><text x="16" y="15" fontSize="8" fill="currentColor" textAnchor="middle">10</text></svg>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
               <button onClick={toggleVolume} className="text-white hover:text-gray-300" title={isMuted ? "Unmute (m)" : "Mute (m)"}>
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  )}
               </button>
               <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-0 overflow-hidden group-hover/volume:w-20 transition-all h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer accent-xred-600"
               />
            </div>

            {/* Time */}
            <div className="text-white text-sm">
               {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Speed Selector */}
             <div className="relative menu-container">
               <button 
                  onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                  className="text-white hover:text-xred-500 text-sm font-semibold w-8 text-center"
                  title="Playback Speed"
               >
                  {playbackSpeed}x
               </button>
               {showSpeedMenu && (
                 <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-gray-700 rounded-lg overflow-hidden min-w-[80px] shadow-xl z-30">
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                         key={speed}
                         onClick={() => handleSpeedChange(speed)}
                         className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${playbackSpeed === speed ? 'text-xred-500 font-bold' : 'text-gray-300'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                 </div>
               )}
             </div>

             {/* Quality Selector */}
             {qualities.length > 0 && (
               <div className="relative menu-container">
                 <button 
                    onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                    className="flex items-center gap-1 text-white hover:text-xred-500 text-sm font-semibold border border-white/20 px-2 py-0.5 rounded"
                    title="Quality"
                 >
                    {currentQuality === -1 ? 'Auto' : qualities.find(q => q.levelIndex === currentQuality)?.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </button>
                 
                 {showQualityMenu && (
                   <div className="absolute bottom-full right-0 mb-2 bg-black/90 border border-gray-700 rounded-lg overflow-hidden min-w-[120px] shadow-xl z-30">
                      {qualities.map((q) => (
                        <button
                           key={q.levelIndex}
                           onClick={() => handleQualityChange(q.levelIndex)}
                           className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${currentQuality === q.levelIndex ? 'text-xred-500 font-bold' : 'text-gray-300'}`}
                        >
                          {q.label}
                        </button>
                      ))}
                   </div>
                 )}
               </div>
             )}

             {/* Fullscreen */}
             <button onClick={toggleFullscreen} className="text-white hover:text-xred-500 transition-colors" title="Fullscreen (f)">
               {isFullscreen ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5z"/></svg>
               ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
               )}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
