export interface VideoValidationResult {
  valid: boolean;
  error?: string;
  duration?: number;
}

export const MAX_DURATION_SECONDS = 600; // 10 minutes

export function validateVideoFile(file: File): Promise<VideoValidationResult> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      resolve({ valid: false, error: 'Please select a valid video file.' });
      return;
    }

    const maxSizeBytes = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSizeBytes) {
      resolve({ valid: false, error: 'File size must be under 500MB.' });
      return;
    }

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const duration = video.duration;

      if (!isFinite(duration) || duration <= 0) {
        resolve({ valid: false, error: 'Could not determine video duration.' });
        return;
      }

      if (duration > MAX_DURATION_SECONDS) {
        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        resolve({
          valid: false,
          error: `Video is ${mins}m ${secs}s long. Maximum allowed duration is 10 minutes (600 seconds).`,
        });
        return;
      }

      resolve({ valid: true, duration });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Could not read video file. Please try a different file.' });
    };

    video.src = url;
  });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatCount(n: bigint | number): string {
  const num = typeof n === 'bigint' ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;

  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString();
}
