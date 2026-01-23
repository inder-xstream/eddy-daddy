import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing Upstash Redis credentials');
  }
  console.warn('⚠️ Upstash Redis not configured - likes/views will be disabled');
}

export const redis = new Redis({
  url: UPSTASH_URL || 'http://localhost:6379',
  token: UPSTASH_TOKEN || 'dev-token',
});

// Rate limiter for view counting (max 5 views per IP per minute)
export const viewRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ratelimit:view',
});

// Rate limiter for likes (max 10 toggles per user per minute)
export const likeRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:like',
});
