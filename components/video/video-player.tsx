'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  vastTagUrl?: string;
}

export function VideoPlayer({ hlsUrl, thumbnailUrl, title, vastTagUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdPlaying, setIsAdPlaying] = useState(!!vastTagUrl);
  const [adTimeLeft, setAdTimeLeft] = useState(15);
  const [canSkip, setCanSkip] = useState(false);

  // Handle Ad Logic
  useEffect(() => {
    if (!vastTagUrl) {
      setIsAdPlaying(false);
      return;
    }

    // In a real VAST implementation, we would fetch the XML here, parse it,
    // find the MediaFile, TrackingEvents, etc.
    // For this MVP, we simulate the ad experience.
    
    // Auto-disable ad if no vastTagUrl
    setIsAdPlaying(true);

    const timer = setInterval(() => {
      setAdTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAdEnd();
          return 0;
        }
        if (prev <= 10) setCanSkip(true); // Allow skip after 5s (15-10)
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [vastTagUrl]);

  const handleAdEnd = () => {
    setIsAdPlaying(false);
    // Auto-play content after ad
    if (videoRef.current) {
        // slight delay to ensure DOM update
        setTimeout(() => videoRef.current?.play().catch(() => {}), 100);
    }
  };

  const handleSkipAd = () => {
    handleAdEnd();
  };

  // Handle Main Content HLS
  useEffect(() => {
    if (isAdPlaying) return; 

    // Reset video state when switching to content
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true, // Low latency for better engagement
        backBufferLength: 90,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Video manifest loaded');
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - Failed to load video');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - Failed to decode video');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error - Cannot play video');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
    } else {
      setError('HLS is not supported in your browser');
    }
  }, [hlsUrl, isAdPlaying]); // Re-run when ad finishes

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      
      {/* AD OVERLAY / PLAYER */}
      {isAdPlaying && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
            {/* Mock Ad Player */}
            <div className="w-full h-full relative bg-black">
                {/* Placeholder for actual Ad Video */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center">
                        <p className="text-white text-lg font-bold mb-2">Advertisement</p>
                        <p className="text-gray-400 text-sm">Your content will begin shortly...</p>
                        {/* Simulating a video playing */}
                        <div className="mt-8 flex justify-center">
                             <div className="w-16 h-16 border-4 border-xred-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>

                {/* Ad Controls */}
                <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2">
                    <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                        Ad ends in {adTimeLeft}s
                    </div>
                    {canSkip && (
                        <button 
                            onClick={handleSkipAd}
                            className="bg-black/70 hover:bg-black/90 text-white px-6 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors border border-white/20"
                        >
                            Skip Ad
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </button>
                    )}
                </div>

                <div className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                    AD
                </div>
                
                {/* Debug Info about VAST */}
                <div className="absolute bottom-4 left-4 text-xs text-gray-500 max-w-xs truncate hidden">
                    VAST Source: {vastTagUrl}
                </div>
            </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls={!isAdPlaying}
        playsInline
        poster={thumbnailUrl || undefined}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label={title}
      >
        Your browser does not support video playback.
      </video>

      {error && !isAdPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center p-6">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-white font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
