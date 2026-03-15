/**
 * Input sanitization — prevents XSS, SQL injection, and invalid data from being stored.
 * Every user input passes through these functions before storage.
 */

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const ENTITY_REGEX = /[&<>"'`/]/g;

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char);
}

export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return escapeHtml(input.trim());
}

export function sanitizeMessageContent(content) {
  if (typeof content !== 'string') return '';
  let cleaned = content.trim();
  if (cleaned.length === 0) return '';
  if (cleaned.length > 4000) cleaned = cleaned.slice(0, 4000);
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
  return cleaned;
}

export function sanitizeDisplayName(name) {
  if (typeof name !== 'string') return '';
  return escapeHtml(name.trim().slice(0, 64));
}

export function sanitizeBio(bio) {
  if (typeof bio !== 'string') return '';
  return escapeHtml(bio.trim().slice(0, 500));
}

export function sanitizeUsername(username) {
  if (typeof username !== 'string') return '';
  return username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 32);
}

export function sanitizeServerName(name) {
  if (typeof name !== 'string') return '';
  return escapeHtml(name.trim().slice(0, 100));
}

export function sanitizeChannelName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').slice(0, 100);
}

export function validateUrl(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url) {
  if (!validateUrl(url)) return '';
  return url.trim();
}

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = Array.isArray(value)
        ? value.map(v => typeof v === 'string' ? sanitizeText(v) : sanitizeObject(v))
        : sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function validatePassword(password) {
  if (typeof password !== 'string') return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (password.length > 128) return { valid: false, message: 'Password is too long' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  return { valid: true };
}
