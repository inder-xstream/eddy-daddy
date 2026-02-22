'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoPlayer } from './use-video-player';
import { VideoControls } from './video-controls';

interface VideoPlayerProps {
  hlsUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  vastTagUrl?: string;
  previewUrl?: string | null;
}

// ── VAST XML parser (lightweight, no SDK needed) ──────────────────────
function parseVastXml(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  // Try to find a MediaFile with video type
  const mediaFiles = doc.querySelectorAll('MediaFile');
  let videoUrl = '';
  let clickThrough = '';

  // Get click-through URL
  const clickEl = doc.querySelector('ClickThrough');
  if (clickEl?.textContent) {
    clickThrough = clickEl.textContent.trim();
  }

  // Pick the best media file (prefer mp4)
  for (const mf of Array.from(mediaFiles)) {
    const type = mf.getAttribute('type') || '';
    const url = mf.textContent?.trim() || '';
    if (type.includes('mp4') || type.includes('video')) {
      videoUrl = url;
      break;
    }
    if (!videoUrl && url) videoUrl = url;
  }

  // Collect impression pixels
  const impressions = Array.from(doc.querySelectorAll('Impression'))
    .map(el => el.textContent?.trim())
    .filter(Boolean) as string[];

  return { videoUrl, clickThrough, impressions };
}

export function VideoPlayer({ hlsUrl, thumbnailUrl, vastTagUrl }: VideoPlayerProps) {
  const player = useVideoPlayer({ hlsUrl });

  // ── Pre-roll ad state ───────────────────────────────────────────────
  const adVideoRef = useRef<HTMLVideoElement>(null);
  const [adState, setAdState] = useState<'loading' | 'playing' | 'done' | 'skippable' | 'error'>('loading');
  const [adVideoUrl, setAdVideoUrl] = useState('');
  const [adClickUrl, setAdClickUrl] = useState('');
  const [adTimeLeft, setAdTimeLeft] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const impressionsFired = useRef(false);
  const adImpressions = useRef<string[]>([]);
  const hasVast = !!(vastTagUrl && vastTagUrl.length > 0);

  // Fetch & parse VAST when component mounts
  useEffect(() => {
    if (!hasVast) {
      setAdState('done');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(vastTagUrl!, { cache: 'no-store' });
        const xml = await res.text();
        const { videoUrl, clickThrough, impressions } = parseVastXml(xml);

        if (cancelled) return;

        if (!videoUrl) {
          // No ad available in the VAST response — skip to content
          setAdState('done');
          return;
        }

        setAdVideoUrl(videoUrl);
        setAdClickUrl(clickThrough);
        adImpressions.current = impressions;
        setAdState('playing');
      } catch {
        if (!cancelled) setAdState('done'); // Fail silently → show content
      }
    })();

    return () => { cancelled = true; };
  }, [vastTagUrl, hasVast]);

  // Fire impression pixels once ad starts playing
  const fireImpressions = useCallback(() => {
    if (impressionsFired.current) return;
    impressionsFired.current = true;
    adImpressions.current.forEach(url => {
      new Image().src = url;
    });
  }, []);

  // Ad timer — update countdown & enable skip after 5s
  useEffect(() => {
    if (adState !== 'playing') return;
    const adVideo = adVideoRef.current;
    if (!adVideo) return;

    const onTimeUpdate = () => {
      const remaining = Math.max(0, Math.ceil(adVideo.duration - adVideo.currentTime));
      setAdTimeLeft(remaining);
      if (adVideo.currentTime >= 5) setCanSkip(true);
    };

    const onPlay = () => fireImpressions();
    const onEnded = () => setAdState('done');
    const onError = () => setAdState('done');

    adVideo.addEventListener('timeupdate', onTimeUpdate);
    adVideo.addEventListener('play', onPlay);
    adVideo.addEventListener('ended', onEnded);
    adVideo.addEventListener('error', onError);

    // Auto-play the ad
    adVideo.play().catch(() => setAdState('done'));

    return () => {
      adVideo.removeEventListener('timeupdate', onTimeUpdate);
      adVideo.removeEventListener('play', onPlay);
      adVideo.removeEventListener('ended', onEnded);
      adVideo.removeEventListener('error', onError);
    };
  }, [adState, fireImpressions]);

  const handleSkipAd = () => {
    if (adVideoRef.current) adVideoRef.current.pause();
    setAdState('done');
  };

  const handleAdClick = () => {
    if (adClickUrl) {
      window.open(adClickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // ── Show pre-roll overlay when ad is loading/playing ────────────────
  const showAd = adState === 'playing' || adState === 'loading';

  return (
    <div
      ref={player.containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group select-none"
      onMouseMove={player.handleMouseMove}
      onMouseLeave={() => player.handleMouseMove()}
      onDoubleClick={!showAd ? player.toggleFullscreen : undefined}
    >
      {/* ── Pre-roll Ad Overlay ──────────────────────────────────── */}
      {showAd && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          {adState === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/60 text-xs uppercase tracking-wider">Loading ad...</span>
            </div>
          )}
          {adState === 'playing' && adVideoUrl && (
            <>
              <video
                ref={adVideoRef}
                src={adVideoUrl}
                className="w-full h-full object-contain cursor-pointer"
                onClick={handleAdClick}
                playsInline
                muted={false}
              />
              {/* Ad badge + timer */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-50">
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                  AD
                </span>
                {adTimeLeft > 0 && (
                  <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {adTimeLeft}s
                  </span>
                )}
              </div>
              {/* Skip button */}
              {canSkip && (
                <button
                  onClick={handleSkipAd}
                  className="absolute bottom-16 right-3 z-50 bg-black/80 hover:bg-black text-white text-sm font-medium px-4 py-2 rounded border border-white/30 transition-colors"
                >
                  Skip Ad &raquo;
                </button>
              )}
              {/* Click-through hint */}
              {adClickUrl && (
                <div className="absolute bottom-3 left-3 z-50">
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">
                    Click video to visit advertiser
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Main Video ───────────────────────────────────────────── */}
      <video
        ref={player.videoRef}
        className="w-full h-full cursor-pointer"
        onClick={!showAd ? player.togglePlay : undefined}
        poster={thumbnailUrl || undefined}
        onTimeUpdate={player.onTimeUpdate}
        onPlay={() => player.setIsPlaying(true)}
        onPause={() => player.setIsPlaying(false)}
        onWaiting={() => player.setIsBuffering(true)}
        onCanPlay={() => player.setIsBuffering(false)}
        onPlaying={() => player.setIsBuffering(false)}
        playsInline
      />

      {/* Buffering Spinner */}
      {!showAd && player.isBuffering && player.isPlaying && !player.error && (
        <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error with Retry */}
      {player.error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 gap-4">
          <p className="text-white bg-red-600/80 px-4 py-2 rounded">{player.error}</p>
          <button
            onClick={player.handleRetry}
            className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Big Play Button Overlay */}
      {!showAd && !player.isPlaying && !player.error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={player.togglePlay}
        >
          <div className="w-16 h-16 bg-xred-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls (hidden during ad) */}
      {!showAd && (
        <VideoControls
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          isMuted={player.isMuted}
          isFullscreen={player.isFullscreen}
          showControls={player.showControls}
          buffered={player.buffered}
          playbackSpeed={player.playbackSpeed}
          qualities={player.qualities}
          currentQuality={player.currentQuality}
          showQualityMenu={player.showQualityMenu}
          showSpeedMenu={player.showSpeedMenu}
          progressBarRef={player.progressBarRef}
          togglePlay={player.togglePlay}
          toggleVolume={player.toggleVolume}
          handleVolumeChange={player.handleVolumeChange}
          handleSeek={player.handleSeek}
          toggleFullscreen={player.toggleFullscreen}
          handleQualityChange={player.handleQualityChange}
          handleSpeedChange={player.handleSpeedChange}
          skip={player.skip}
          setShowQualityMenu={player.setShowQualityMenu}
          setShowSpeedMenu={player.setShowSpeedMenu}
          formatTime={player.formatTime}
        />
      )}
    </div>
  );
}
