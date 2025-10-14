import { Redis } from '@upstash/redis';

// Don't throw during import - let it be null if vars are missing
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient: Redis | null = null;

// Initialize only if credentials exist
if (url && token) {
  redisClient = new Redis({ url, token });
} else {
  console.warn('⚠️ Upstash Redis credentials not found. Redis features will be disabled.');
}

// Helper to ensure Redis is available
function ensureRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis client is not initialized. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
  }
  return redisClient;
}

export { redisClient };

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!redisClient) {
    console.warn('Redis not available, skipping rate limit');
    return { allowed: true, remaining: limit };
  }

  try {
    const key = `ratelimit:${identifier}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    return {
      allowed: current <= limit,
      remaining,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: limit }; // Fail open
  }
}

export async function invalidateCourseCache(tier?: string) {
  if (!redisClient) {
    console.warn('Redis not available, skipping cache invalidation');
    return;
  }

  try {
    if (tier) {
      await redisClient.del(`courses:list:${tier}`);
    } else {
      await redisClient.del('courses:list:basics');
      await redisClient.del('courses:list:intermediate');
      await redisClient.del('courses:list:advanced');
    }
  } catch (error) {
    console.error('Cache invalidation failed:', error);
  }
}