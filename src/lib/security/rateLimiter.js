/**
 * Client-side rate limiter with per-action, per-user enforcement.
 * Acts as a first defense layer. Server-side Postgres functions provide the true enforcement.
 */

const buckets = new Map();

const LIMITS = {
  login:          { max: 5,   windowMs: 15 * 60 * 1000 },
  message:        { max: 5,   windowMs: 5 * 1000 },
  api:            { max: 100, windowMs: 60 * 1000 },
  file_upload:    { max: 10,  windowMs: 60 * 1000 },
  friend_request: { max: 10,  windowMs: 60 * 60 * 1000 },
  reaction:       { max: 20,  windowMs: 10 * 1000 },
  profile_update: { max: 5,   windowMs: 60 * 1000 },
  server_create:  { max: 3,   windowMs: 60 * 60 * 1000 },
};

const MESSAGES = {
  login:          'Too many login attempts. Take a breather and try again in 15 minutes.',
  message:        'Slow down a little — you\'re sending messages too fast.',
  api:            'Slow down a little. Try again in a few seconds.',
  file_upload:    'That\'s a lot of uploads! Wait a minute and try again.',
  friend_request: 'You\'ve sent a lot of friend requests. Take a break and try again soon.',
  reaction:       'Slow down with the reactions! Try again in a moment.',
  profile_update: 'Slow down with the updates. Try again in a few seconds.',
  server_create:  'You\'ve been busy! Wait a bit before creating another server.',
};

function getBucketKey(action, userId) {
  return `${action}:${userId || 'anon'}`;
}

function cleanBucket(bucket, windowMs) {
  const now = Date.now();
  const cutoff = now - windowMs;
  while (bucket.length > 0 && bucket[0] < cutoff) {
    bucket.shift();
  }
}

export function checkRateLimit(action, userId) {
  const config = LIMITS[action];
  if (!config) return { allowed: true };

  const key = getBucketKey(action, userId);
  if (!buckets.has(key)) buckets.set(key, []);

  const bucket = buckets.get(key);
  cleanBucket(bucket, config.windowMs);

  if (bucket.length >= config.max) {
    const oldestTs = bucket[0];
    const retryAfterMs = config.windowMs - (Date.now() - oldestTs);
    return {
      allowed: false,
      message: MESSAGES[action] || 'Slow down a little. Try again in a few seconds.',
      retryAfterMs,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
    };
  }

  bucket.push(Date.now());
  return { allowed: true };
}

export function getRateLimitConfig(action) {
  return LIMITS[action] || null;
}

export function resetRateLimit(action, userId) {
  const key = getBucketKey(action, userId);
  buckets.delete(key);
}

export function getRemainingAttempts(action, userId) {
  const config = LIMITS[action];
  if (!config) return Infinity;

  const key = getBucketKey(action, userId);
  if (!buckets.has(key)) return config.max;

  const bucket = buckets.get(key);
  cleanBucket(bucket, config.windowMs);
  return Math.max(0, config.max - bucket.length);
}
