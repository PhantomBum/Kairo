/**
 * Upload utilities — proper Supabase paths, size limits, validation
 * avatars/[userId]/avatar.[ext], servers/[serverId]/icon.[ext], etc.
 */
import { supabase } from '@/api/supabaseClient';
import { validateFile } from '@/lib/security/fileValidator';

const BUCKET = 'uploads';
const AVATAR_LIMIT_FREE = 8 * 1024 * 1024;  // 8MB
const AVATAR_LIMIT_ELITE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function getExt(file) {
  const ext = (file.name?.split('.').pop() || 'png').toLowerCase().replace(/jpeg/, 'jpg');
  return ALLOWED_IMAGE_EXT.includes(ext) ? ext : 'png';
}

export async function uploadAvatar(file, userId, { isElite = false } = {}) {
  if (!file || !(file instanceof File)) throw new Error('Invalid file');
  const limit = isElite ? AVATAR_LIMIT_ELITE : AVATAR_LIMIT_FREE;
  if (file.size > limit) throw new Error(`File too large. Max ${limit / 1024 / 1024}MB for ${isElite ? 'Elite' : 'free'} users.`);
  const ext = getExt(file);
  if (!ALLOWED_IMAGE_EXT.includes(ext)) throw new Error('Only JPG, PNG, GIF, WebP allowed.');
  const path = `avatars/${userId}/avatar.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadServerIcon(file, serverId, { isElite = false } = {}) {
  if (!file || !(file instanceof File)) throw new Error('Invalid file');
  const limit = isElite ? AVATAR_LIMIT_ELITE : AVATAR_LIMIT_FREE;
  if (file.size > limit) throw new Error(`File too large. Max ${limit / 1024 / 1024}MB.`);
  const ext = getExt(file);
  if (!ALLOWED_IMAGE_EXT.includes(ext)) throw new Error('Only JPG, PNG, GIF, WebP allowed.');
  const path = `servers/${serverId}/icon.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadBanner(file, { userId, serverId }, { isElite = false } = {}) {
  if (!file || !(file instanceof File)) throw new Error('Invalid file');
  const limit = isElite ? AVATAR_LIMIT_ELITE : AVATAR_LIMIT_FREE;
  if (file.size > limit) throw new Error(`File too large. Max ${limit / 1024 / 1024}MB.`);
  const ext = getExt(file);
  if (!ALLOWED_IMAGE_EXT.includes(ext)) throw new Error('Only JPG, PNG, GIF, WebP allowed.');
  const folder = userId ? `users/${userId}` : `servers/${serverId}`;
  const path = `${folder}/banner.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadMessageAttachment(file, { isElite = false, isLite = false } = {}) {
  const validation = await validateFile(file, { isElite, isLite });
  if (!validation.valid) throw new Error(validation.errors[0]);
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
  const path = `attachments/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return {
    url: urlData.publicUrl,
    filename: file.name,
    content_type: file.type,
    size: file.size,
  };
}
