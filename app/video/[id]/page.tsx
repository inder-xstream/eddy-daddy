import { prisma } from '@/lib/prisma';
import { VideoPlayer } from '@/components/video/video-player';
import { LikeButton } from '@/components/video/like-button';
import { ViewTracker } from '@/components/video/view-tracker';
import CommentSection from '@/components/comments/comment-section';
import { getLikeStatus } from '@/server/actions/engagement';
import { getViewCount } from '@/server/actions/view';
import { getComments } from '@/server/actions/comment';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth-helper';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: video.title,
    description: video.description || 'Watch this video on XStream',
  };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const session = await auth();

  // Fetch video with creator info and related videos
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          _count: {
            select: {
              subscribers: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!video) {
    notFound();
  }

  // Check if video is published or belongs to current user
  if (video.status !== 'PUBLISHED' && video.userId !== session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Video Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This video is still being processed or is not available.
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Fetch like status and view count from Redis
  const { isLiked, likeCount } = await getLikeStatus(video.id);
  const viewCount = await getViewCount(video.id);

  // Fetch initial comments (top-level only, 10 at a time)
  const commentsResult = await getComments({
    videoId: video.id,
    parentId: null,
    limit: 10,
  });

  const initialComments = commentsResult.success ? commentsResult.comments || [] : [];
  const initialNextCursor = commentsResult.success ? commentsResult.nextCursor || null : null;

  // Fetch related videos
  const relatedVideos = await prisma.video.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: video.id },
      OR: [
        { userId: video.userId },
        // Could add tag-based recommendations here
      ],
    },
    include: {
      user: {
        select: {
          username: true,
          avatarUrl: true,
        },
      },
    },
    take: 6,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* View Tracker - fires after 3 seconds */}
      <ViewTracker videoId={video.id} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Video Player */}
            {video.hlsUrl ? (
              <VideoPlayer
                hlsUrl={video.hlsUrl}
                thumbnailUrl={video.thumbnailUrl}
                title={video.title}
              />
            ) : (
              <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">
                    Video is being processed...
                  </p>
                </div>
              </div>
            )}

            {/* Video Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {video.title}
              </h1>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatNumber(viewCount)} views</span>
                  <span>•</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Like Button with Redis-backed counting */}
                  <LikeButton
                    videoId={video.id}
                    initialLiked={isLiked}
                    initialCount={likeCount}
                  />
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <Link href={`/channel/${video.user.username}`}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-lg font-bold cursor-pointer hover:scale-105 transition-transform">
                      {video.user.username[0].toUpperCase()}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/channel/${video.user.username}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {video.user.username}
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(video.user._count.subscribers)} subscribers
                    </p>
                  </div>
                </div>

                {session?.user?.id !== video.userId && (
                  <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                )}
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <CommentSection
                videoId={video.id}
                initialComments={initialComments}
                initialNextCursor={initialNextCursor}
              />
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Related Videos
            </h2>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <Link
                  key={relatedVideo.id}
                  href={`/video/${relatedVideo.id}`}
                  className="flex gap-3 group"
                >
                  <div className="relative w-40 aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {relatedVideo.thumbnailUrl ? (
                      <img
                        src={relatedVideo.thumbnailUrl}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        </svg>
                      </div>
                    )}
                    {relatedVideo.duration && (
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
                        {Math.floor(relatedVideo.duration / 60)}:
                        {(relatedVideo.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm mb-1">
                      {relatedVideo.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {relatedVideo.user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatNumber(relatedVideo.viewsCount)} views
                    </p>
                  </div>
                </Link>
              ))}

              {relatedVideos.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  No related videos
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
