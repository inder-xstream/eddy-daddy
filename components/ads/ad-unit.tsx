'use client';

import { useEffect, useRef, useState } from 'react';
import { adConfig, cn } from '@/lib/ads';

interface AdUnitProps {
  zoneId?: string; // e.g., '1234567'
  width: number;
  height: number;
  className?: string;
  network?: 'exoclick' | 'trafficjunky'; // Future-proof
  fallbackText?: string; // Shown when ads are disabled (optional)
}

export function AdUnit({
  zoneId,
  width,
  height,
  className,
  network = 'exoclick',
  fallbackText,
}: AdUnitProps) {
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If ads are disabled globally OR no zone ID is provided for this slot
  if (!adConfig.isEnabled || !zoneId) {
    return (
      <div
        style={{ width, height }}
        className={cn(
          'bg-gray-100 dark:bg-dark-800 flex items-center justify-center text-xs text-gray-400 overflow-hidden',
          className
        )}
      >
        {fallbackText ? (
          <span className="opacity-50 font-mono text-[10px] uppercase tracking-wider text-center px-2">
            {fallbackText}
          </span>
        ) : null}
      </div>
    );
  }

  // Only render ad script on the client
  if (!isClient) {
     return (
        <div style={{ width, height }} className={cn('bg-transparent', className)} />
     );
  }

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className={cn('relative overflow-hidden mx-auto', className)}
    >
      {/* ExoClick Implementation Example */}
      {network === 'exoclick' && (
        <iframe
            src={`https://syndication.exoclick.com/ads-iframe-display.php?idzone=${zoneId}&size=${width}x${height}`}
            width={width}
            height={height}
            scrolling="no"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="border-0"
            title="Advertisement"
            loading="lazy"
        />
      )}
      
      {/* Add other networks here (TrafficJunky, etc.) */}
    </div>
  );
}
