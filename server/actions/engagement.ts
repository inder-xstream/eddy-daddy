'use server';

import { prisma } from '@/lib/prisma';
import { redis, likeRateLimiter } from '@/lib/redis';
import { auth } from '@/lib/auth-helper';
import { revalidatePath } from 'next/cache';

interface LikeResponse {
  success: boolean;
  isLiked: boolean;
  likeCount: number;
  error?: string;
}

/**
 * Toggle like on a video with Redis fast path
 * Uses Redis for instant response and async DB sync
 */
export async function toggleLike(videoId: string): Promise<LikeResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Authentication required',
      };
    }

    const userId = session.user.id;

    // Rate limiting
    const { success: rateLimitOk } = await likeRateLimiter.limit(userId);
    if (!rateLimitOk) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Too many requests. Please slow down.',
      };
    }

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, likesCount: true, status: true },
    });

    if (!video) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Video not found',
      };
    }

    if (video.status !== 'PUBLISHED') {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'Cannot like unpublished video',
      };
    }

    // Redis keys
    const likesSetKey = `video:${videoId}:likes`;
    const likeCountKey = `video:${videoId}:like_count`;
    const userLikeKey = `user:${userId}:like:${videoId}`;

    // Check if user already liked this video (Redis fast path)
    const isMember = await redis.sismember(likesSetKey, userId);
    const isCurrentlyLiked = isMember === 1;

    let newLikedState: boolean;
    let newCount: number;

    if (isCurrentlyLiked) {
      // Unlike: Remove from set and decrement counter
      await redis.srem(likesSetKey, userId);
      await redis.del(userLikeKey);
      newCount = await redis.decr(likeCountKey);
      newLikedState = false;

      // Async DB sync (fire and forget)
      prisma.like
        .delete({
          where: {
            userId_videoId: {
              userId,
              videoId,
            },
          },
        })
        .catch((err) => console.error('DB unlike sync failed:', err));
    } else {
      // Like: Add to set and increment counter
      await redis.sadd(likesSetKey, userId);
      await redis.set(userLikeKey, '1', { ex: 86400 * 30 }); // 30 days TTL
      newCount = await redis.incr(likeCountKey);
      newLikedState = true;

      // Async DB sync (fire and forget)
      prisma.like
        .create({
          data: {
            userId,
            videoId,
          },
        })
        .catch((err) => console.error('DB like sync failed:', err));
    }

    // Set expiry on count key (30 days)
    await redis.expire(likeCountKey, 86400 * 30);

    // Revalidate video page and related pages
    revalidatePath(`/video/${videoId}`);
    revalidatePath('/');

    return {
      success: true,
      isLiked: newLikedState,
      likeCount: Math.max(0, newCount), // Ensure non-negative
    };
  } catch (error) {
    console.error('Toggle like error:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: error instanceof Error ? error.message : 'Failed to toggle like',
    };
  }
}

/**
 * Get like status for a video
 * Used for initial page load
 */
export async function getLikeStatus(videoId: string): Promise<{
  isLiked: boolean;
  likeCount: number;
}> {
  try {
    const session = await auth();

    // Try Redis first for real-time count
    const likeCountKey = `video:${videoId}:like_count`;
    let likeCount = await redis.get<number>(likeCountKey);

    // Fallback to DB if not in Redis
    if (likeCount === null) {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { likesCount: true },
      });
      likeCount = video?.likesCount || 0;
    }

    // Check if current user liked
    let isLiked = false;
    if (session?.user?.id) {
      const likesSetKey = `video:${videoId}:likes`;
      const isMember = await redis.sismember(likesSetKey, session.user.id);
      isLiked = isMember === 1;

      // Fallback to DB if not in Redis
      if (!isLiked) {
        const like = await prisma.like.findUnique({
          where: {
            userId_videoId: {
              userId: session.user.id,
              videoId,
            },
          },
        });
        isLiked = !!like;

        // Warm up Redis cache
        if (like) {
          await redis.sadd(likesSetKey, session.user.id);
        }
      }
    }

    return {
      isLiked,
      likeCount: likeCount || 0,
    };
  } catch (error) {
    console.error('Get like status error:', error);
    return {
      isLiked: false,
      likeCount: 0,
    };
  }
}

/**
 * Batch warm-up Redis cache for multiple videos
 * Call this on homepage/feed to prepare cache
 */
export async function warmupLikesCache(videoIds: string[]): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    // Batch fetch from DB
    const likes = await prisma.like.findMany({
      where: {
        userId: session.user.id,
        videoId: { in: videoIds },
      },
      select: { videoId: true },
    });

    // Warm up Redis
    const pipeline = redis.pipeline();
    likes.forEach((like) => {
      pipeline.sadd(`video:${like.videoId}:likes`, session.user.id);
    });
    await pipeline.exec();
  } catch (error) {
    console.error('Warmup likes cache error:', error);
  }
}
