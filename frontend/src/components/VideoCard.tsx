import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetUserProfile } from '../hooks/useQueries';
import type { VideoMeta } from '../hooks/useQueries';
import ActionButtons from './ActionButtons';
import CommentsPanel from './CommentsPanel';
import { formatDuration } from '../utils/videoValidation';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoCardProps {
  video: VideoMeta;
  isActive: boolean;
}

export default function VideoCard({ video, isActive }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const navigate = useNavigate();

  const uploaderStr = video.uploader.toString();
  const { data: uploaderProfile } = useGetUserProfile(uploaderStr);
  const displayName = uploaderProfile?.username ?? uploaderStr.slice(0, 8) + '...';
  const avatarUrl = uploaderProfile?.avatarUrl ?? '';

  // Auto-play/pause based on active state
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  }, [isActive]);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }

    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 800);
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }, []);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 video-overlay-gradient pointer-events-none" />

      {/* Play/Pause icon flash */}
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center animate-fade-in">
            {playing ? (
              <Pause className="w-10 h-10 text-white" />
            ) : (
              <Play className="w-10 h-10 text-white fill-white" />
            )}
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        {/* Duration badge */}
        <div className="px-2 py-0.5 rounded-full bg-black/50 text-white text-xs font-medium">
          {formatDuration(Number(video.duration))}
        </div>
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom info overlay */}
      <div className="absolute bottom-0 left-0 right-16 p-4 z-10">
        {/* Uploader info */}
        <button
          onClick={() => navigate({ to: '/profile/$principal', params: { principal: uploaderStr } })}
          className="flex items-center gap-2 mb-2 group"
        >
          <Avatar className="w-9 h-9 border-2 border-white/50">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-vibe text-white text-xs font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm drop-shadow group-hover:text-vibe transition-colors">
            @{displayName}
          </span>
        </button>

        {/* Title */}
        <h3 className="text-white font-bold text-sm leading-tight mb-1 drop-shadow line-clamp-2">
          {video.title}
        </h3>

        {/* Description */}
        {video.description && (
          <p className="text-white/80 text-xs leading-snug drop-shadow line-clamp-2">
            {video.description}
          </p>
        )}
      </div>

      {/* Action buttons - right side */}
      <div className="absolute right-2 bottom-16 z-10">
        <ActionButtons
          video={video}
          onCommentClick={() => setShowComments(true)}
        />
      </div>

      {/* Comments panel */}
      <CommentsPanel
        videoId={video.id}
        commentCount={video.commentCount}
        open={showComments}
        onClose={() => setShowComments(false)}
      />
    </div>
  );
}
