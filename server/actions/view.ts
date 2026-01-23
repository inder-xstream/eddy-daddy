'use server';

import { redis, viewRateLimiter } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { createHash } from 'crypto';

interface ViewResponse {
  success: boolean;
  viewCount?: number;
  error?: string;
}

/**
 * Increment view count for a video
 * Fire-and-forget with rate limiting by IP
 */
export async function incrementView(videoId: string): Promise<ViewResponse> {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Hash IP for privacy
    const ipHash = createHash('sha256').update(clientIp).digest('hex');

    // Rate limit: max 5 views per IP per minute
    const { success: rateLimitOk } = await viewRateLimiter.limit(ipHash);
    
    if (!rateLimitOk) {
      console.log(`View rate limit exceeded for IP hash: ${ipHash.substring(0, 8)}...`);
      return {
        success: false,
        error: 'Rate limit exceeded',
      };
    }

    // Verify video exists and is published
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, status: true, viewsCount: true },
    });

    if (!video) {
      return {
        success: false,
        error: 'Video not found',
      };
    }

    if (video.status !== 'PUBLISHED') {
      return {
        success: false,
        error: 'Video not published',
      };
    }

    // Redis keys
    const viewCountKey = `video:${videoId}:view_count`;
    const uniqueViewKey = `video:${videoId}:viewed:${ipHash}`;

    // Check if this IP already viewed today (deduplication)
    const alreadyViewed = await redis.exists(uniqueViewKey);

    if (alreadyViewed) {
      // Return current count without incrementing
      const currentCount = await redis.get<number>(viewCountKey);
      return {
        success: true,
        viewCount: currentCount || video.viewsCount,
      };
    }

    // Mark this IP as having viewed (24-hour expiry)
    await redis.set(uniqueViewKey, '1', { ex: 86400 });

    // Increment view counter
    const newCount = await redis.incr(viewCountKey);

    // Set expiry on count key (30 days)
    await redis.expire(viewCountKey, 86400 * 30);

    // Async: Record detailed analytics in DB (fire and forget)
    recordViewAnalytics(videoId, ipHash, clientIp, headersList).catch((err) =>
      console.error('View analytics recording failed:', err)
    );

    return {
      success: true,
      viewCount: newCount,
    };
  } catch (error) {
    console.error('Increment view error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to increment view',
    };
  }
}

/**
 * Get current view count for a video
 */
export async function getViewCount(videoId: string): Promise<number> {
  try {
    // Try Redis first
    const viewCountKey = `video:${videoId}:view_count`;
    const redisCount = await redis.get<number>(viewCountKey);

    if (redisCount !== null) {
      return redisCount;
    }

    // Fallback to DB
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { viewsCount: true },
    });

    return video?.viewsCount || 0;
  } catch (error) {
    console.error('Get view count error:', error);
    return 0;
  }
}

/**
 * Record detailed view analytics in database
 * Called asynchronously after Redis increment
 */
async function recordViewAnalytics(
  videoId: string,
  ipHash: string,
  clientIp: string,
  headersList: Headers
): Promise<void> {
  try {
    const userAgent = headersList.get('user-agent') || undefined;
    const country = headersList.get('cf-ipcountry') || undefined; // Cloudflare header

    // Check if we should record this view in DB
    // (e.g., sample 10% of views to reduce DB writes)
    const shouldRecord = Math.random() < 0.1; // 10% sampling

    if (!shouldRecord) {
      return;
    }

    await prisma.videoView.create({
      data: {
        videoId,
        ipHash,
        userAgent,
        country,
        userId: undefined, // Could link to session user if available
      },
    });
  } catch (error) {
    // Don't throw - this is best-effort analytics
    console.error('Record view analytics error:', error);
  }
}

/**
 * Batch get view counts for multiple videos
 * Efficient for feed/homepage
 */
export async function getViewCounts(
  videoIds: string[]
): Promise<Record<string, number>> {
  try {
    // Batch fetch from Redis
    const pipeline = redis.pipeline();
    videoIds.forEach((id) => {
      pipeline.get(`video:${id}:view_count`);
    });

    const results = await pipeline.exec<(number | null)[]>();

    // Build result map
    const viewCounts: Record<string, number> = {};
    videoIds.forEach((id, index) => {
      const count = results[index];
      viewCounts[id] = count ?? 0;
    });

    // Fallback to DB for any missing values
    const missingIds = videoIds.filter((id) => viewCounts[id] === 0);
    if (missingIds.length > 0) {
      const videos = await prisma.video.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, viewsCount: true },
      });

      videos.forEach((video) => {
        viewCounts[video.id] = video.viewsCount;
      });
    }

    return viewCounts;
  } catch (error) {
    console.error('Batch get view counts error:', error);
    return {};
  }
}
