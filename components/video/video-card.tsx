'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface VideoCardProps {
  video: {
    id: string;
    bunnyVideoId: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    duration: number | null;
    viewsCount: number;
    createdAt: Date;
    orientation?: string | null;
    user: {
      username: string;
      avatarUrl: string | null;
    };
  };
}

const BUNNY_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE || 'vz-xxxxx.b-cdn.net';

export function VideoCard({ video }: VideoCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  // Generate preview URL from Bunny CDN
  const getPreviewUrl = () => {
    // If we are here, we are hovering and haven't errored yet, so try the preview URL
    return `https://${BUNNY_PULL_ZONE}/${video.bunnyVideoId}/preview.webp`;
  };

  const getThumbnailUrl = () => {
    return video.thumbnailUrl || `https://${BUNNY_PULL_ZONE}/${video.bunnyVideoId}/thumbnail.jpg`;
  };

  return (
    <Link
      href={`/video/${video.id}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Thumbnail with Hover Preview */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
        {isHovering && !previewError ? (
          <Image
            src={getPreviewUrl()}
            alt={video.title}
            fill
            className="object-cover"
            onError={() => setPreviewError(true)}
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <Image
            src={getThumbnailUrl()}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Play icon overlay */}
        {!isHovering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <svg
              className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        
        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Orientation Badge */}
        {video.orientation && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600/90 text-white text-xs font-medium rounded">
            {video.orientation}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {video.title}
        </h3>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {video.user.username[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {video.user.username}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatViews(video.viewsCount)} views</span>
          <span>•</span>
          <span>{formatTimeAgo(video.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
