import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Upstash Redis URL or token is not set in environment variables.');
}
export const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
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
}

export async function invalidateCourseCache(tier?: string) {
  if (tier) {
    await redisClient.del(`courses:list:${tier}`);
  } else {
    await redisClient.del('courses:list:basics');
    await redisClient.del('courses:list:intermediate');
    await redisClient.del('courses:list:advanced');
  }
}
