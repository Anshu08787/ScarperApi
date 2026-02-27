import { db } from './db';
import { apiKeys } from './db/schema';
import { eq } from 'drizzle-orm';

const YOUTUBE_REQUEST_LIMIT = 5;

interface YouTubeRequestCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  error?: string;
}

/**
 * Check if a YouTube API request is allowed for the given API key
 * YouTube endpoints are limited to 5 requests per key
 * Contact owner for access: hunternisha55@gmail.com | https://t.me/ScreenScapee
 */
export async function checkYouTubeRequestLimit(apiKey: string): Promise<YouTubeRequestCheck> {
  try {
    // Get the API key data
    const [keyData] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKey))
      .limit(1);

    if (!keyData) {
      return {
        allowed: false,
        remaining: 0,
        limit: YOUTUBE_REQUEST_LIMIT,
        error: 'Invalid API key'
      };
    }

    // Check YouTube request count
    const youtubeRequestCount = keyData.youtubeRequestCount || 0;
    const remaining = YOUTUBE_REQUEST_LIMIT - youtubeRequestCount;

    if (youtubeRequestCount >= YOUTUBE_REQUEST_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        limit: YOUTUBE_REQUEST_LIMIT,
        error: `YouTube API limit reached (${YOUTUBE_REQUEST_LIMIT} requests). Contact owner for access: hunternisha55@gmail.com | https://t.me/ScreenScapee`
      };
    }

    return {
      allowed: true,
      remaining,
      limit: YOUTUBE_REQUEST_LIMIT
    };
  } catch (error) {
    console.error('Error checking YouTube request limit:', error);
    return {
      allowed: false,
      remaining: 0,
      limit: YOUTUBE_REQUEST_LIMIT,
      error: 'Failed to check request limit'
    };
  }
}

/**
 * Increment the YouTube request count for an API key
 */
export async function incrementYouTubeRequestCount(apiKey: string): Promise<boolean> {
  try {
    const [keyData] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKey))
      .limit(1);

    if (!keyData) {
      return false;
    }

    const currentCount = keyData.youtubeRequestCount || 0;

    await db
      .update(apiKeys)
      .set({ 
        youtubeRequestCount: currentCount + 1,
        lastUsedAt: new Date()
      })
      .where(eq(apiKeys.key, apiKey));

    return true;
  } catch (error) {
    console.error('Error incrementing YouTube request count:', error);
    return false;
  }
}

/**
 * Get YouTube request stats for an API key
 */
export async function getYouTubeRequestStats(apiKey: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
} | null> {
  try {
    const [keyData] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, apiKey))
      .limit(1);

    if (!keyData) {
      return null;
    }

    const used = keyData.youtubeRequestCount || 0;
    const remaining = Math.max(0, YOUTUBE_REQUEST_LIMIT - used);

    return {
      used,
      limit: YOUTUBE_REQUEST_LIMIT,
      remaining
    };
  } catch (error) {
    console.error('Error getting YouTube request stats:', error);
    return null;
  }
}
