'use client';

import React from 'react';

interface AdBannerProps {
  slotId: string;
  format: 'leaderboard' | 'rectangle' | 'native';
  className?: string;
}

export function AdBanner({ slotId, format, className = '' }: AdBannerProps) {
  // In a real implementation, you would load an external script here
  // typically driven by Google Ad Manager, ExoClick, TrafficJunky, etc.
  
  // Example dimensions
  const getDimensions = () => {
    switch (format) {
      case 'leaderboard': return 'w-[728px] h-[90px]';
      case 'rectangle': return 'w-[300px] h-[250px]';
      case 'native': return 'w-full aspect-video'; 
      default: return 'w-full h-full';
    }
  };

  const getLabel = () => {
    switch (format) {
       case 'leaderboard': return 'Ad Space (728x90)';
       case 'rectangle': return 'Ad Space (300x250)';
       case 'native': return 'Sponsored Content';
    }
  };

  return (
    <div className={`flex items-center justify-center bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 mx-auto overflow-hidden ${getDimensions()} ${className}`}>
      <div className="text-center p-4">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold block mb-1">Advertisement</span>
        <p className="text-sm text-gray-500 font-medium">{getLabel()}</p>
        <p className="text-xs text-gray-400 font-mono mt-1">{slotId}</p>
      </div>
    </div>
  );
}
