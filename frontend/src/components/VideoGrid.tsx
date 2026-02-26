import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { VideoMeta } from '../hooks/useQueries';
import { formatCount, formatDuration } from '../utils/videoValidation';
import { Play, Heart } from 'lucide-react';

interface VideoGridProps {
  videos: VideoMeta[];
  emptyMessage?: string;
}

export default function VideoGrid({ videos, emptyMessage = 'No videos yet' }: VideoGridProps) {
  const navigate = useNavigate();

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <img
          src="/assets/generated/empty-feed.dim_400x400.png"
          alt="No videos"
          className="w-32 h-32 object-contain mb-4 opacity-60"
        />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5">
      {videos.map((video) => (
        <button
          key={video.id}
          onClick={() => navigate({ to: '/', search: { videoId: video.id } })}
          className="relative aspect-[9/16] bg-secondary overflow-hidden group min-h-[44px]"
        >
          <video
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            preload="metadata"
            muted
          />
          <div className="absolute inset-0 bg-black/20 group-active:bg-black/10 transition-colors" />
          {/* Play overlay on hover/active */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-xs font-medium line-clamp-1 leading-tight">{video.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Heart className="w-3 h-3 text-vibe fill-vibe" />
              <span className="text-white/80 text-xs">{formatCount(video.likeCount)}</span>
              <span className="text-white/50 text-xs ml-auto">{formatDuration(Number(video.duration))}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
