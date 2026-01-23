'use client';

import { useEffect } from 'react';
import { incrementView } from '@/server/actions/view';

interface ViewTrackerProps {
  videoId: string;
}

/**
 * Client component that tracks video views
 * Fires once when video page loads
 */
export function ViewTracker({ videoId }: ViewTrackerProps) {
  useEffect(() => {
    // Track view after 3 seconds (user actually watching)
    const timer = setTimeout(() => {
      incrementView(videoId).catch((err) => {
        console.error('Failed to track view:', err);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [videoId]);

  return null; // This component renders nothing
}
