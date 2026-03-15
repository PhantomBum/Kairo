/**
 * Server-grade file validation — checks both extension and magic bytes.
 * Prevents attackers from spoofing file types by renaming extensions.
 */

const MAGIC_BYTES = {
  'image/jpeg':    [[0xFF, 0xD8, 0xFF]],
  'image/png':     [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif':     [[0x47, 0x49, 0x46, 0x38]],
  'image/webp':    [[0x52, 0x49, 0x46, 0x46]],
  'image/bmp':     [[0x42, 0x4D]],
  'image/svg+xml': [],
  'video/mp4':     [],
  'video/webm':    [[0x1A, 0x45, 0xDF, 0xA3]],
  'audio/mpeg':    [[0xFF, 0xFB], [0xFF, 0xF3], [0xFF, 0xF2], [0x49, 0x44, 0x33]],
  'audio/ogg':     [[0x4F, 0x67, 0x67, 0x53]],
  'audio/wav':     [[0x52, 0x49, 0x46, 0x46]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
};

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
  'mp4', 'webm', 'mov', 'avi',
  'mp3', 'ogg', 'wav', 'flac', 'aac',
  'pdf', 'txt', 'md', 'json', 'csv',
  'zip', 'tar', 'gz',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
]);

const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif',
  'vbs', 'vbe', 'js', 'jse', 'ws', 'wsf', 'wsc', 'wsh',
  'ps1', 'ps2', 'psc1', 'psc2', 'msh', 'msh1', 'msh2',
  'inf', 'reg', 'rgs', 'sct', 'shb', 'shs',
  'lnk', 'dll', 'sys', 'drv', 'cpl',
  'hta', 'html', 'htm',
  'php', 'asp', 'aspx', 'jsp',
]);

const SIZE_LIMITS = {
  free: 150 * 1024 * 1024,
  lite: 200 * 1024 * 1024,
  elite: 500 * 1024 * 1024,
};

function getExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

async function readMagicBytes(file, numBytes = 8) {
  const slice = file.slice(0, numBytes);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

function matchesMagicBytes(bytes, signatures) {
  if (!signatures || signatures.length === 0) return true;
  return signatures.some(sig =>
    sig.every((byte, i) => i < bytes.length && bytes[i] === byte)
  );
}

export async function validateFile(file, { isElite = false, isLite = false } = {}) {
  const errors = [];

  if (!file || !(file instanceof File || file instanceof Blob)) {
    return { valid: false, errors: ['Invalid file'] };
  }

  const maxSize = isElite ? SIZE_LIMITS.elite : isLite ? SIZE_LIMITS.lite : SIZE_LIMITS.free;
  if (file.size > maxSize) {
    const limitMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`That file is too big. Try something under ${limitMB}MB.`);
  }

  if (file.size === 0) {
    errors.push('That file appears to be empty.');
  }

  const ext = getExtension(file.name);

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    errors.push(`We can't accept .${ext} files for security reasons.`);
  }

  if (ext && !ALLOWED_EXTENSIONS.has(ext) && !DANGEROUS_EXTENSIONS.has(ext)) {
    errors.push(`We don't support .${ext} files yet. Try a different format.`);
  }

  if (file.type && MAGIC_BYTES[file.type]) {
    try {
      const bytes = await readMagicBytes(file);
      if (!matchesMagicBytes(bytes, MAGIC_BYTES[file.type])) {
        errors.push('File content doesn\'t match its type. The file may be corrupted or spoofed.');
      }
    } catch {}
  }

  if (file.type && file.type.startsWith('image/') && ext) {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    if (!imageExts.includes(ext)) {
      errors.push('File extension doesn\'t match image content type.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    metadata: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: ext,
    },
  };
}

export function getFileSizeLimit(isElite, isLite) {
  return isElite ? SIZE_LIMITS.elite : isLite ? SIZE_LIMITS.lite : SIZE_LIMITS.free;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
