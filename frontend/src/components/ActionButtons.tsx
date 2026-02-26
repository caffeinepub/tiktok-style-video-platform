import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, UserPlus, UserCheck } from 'lucide-react';
import { useLikeVideo, useFollow } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AuthGuard from './AuthGuard';
import { formatCount } from '../utils/videoValidation';
import type { VideoMeta } from '../hooks/useQueries';

interface ActionButtonsProps {
  video: VideoMeta;
  onCommentClick: () => void;
  isFollowing?: boolean;
}

export default function ActionButtons({ video, onCommentClick, isFollowing = false }: ActionButtonsProps) {
  const { identity } = useInternetIdentity();
  const likeVideo = useLikeVideo();
  const followUser = useFollow();
  const [liked, setLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(Number(video.likeCount));
  const [following, setFollowing] = useState(isFollowing);

  const handleLike = async () => {
    if (!identity || liked) return;
    setLiked(true);
    setLocalLikeCount((c) => c + 1);
    try {
      await likeVideo.mutateAsync(video.id);
    } catch {
      setLiked(false);
      setLocalLikeCount((c) => c - 1);
    }
  };

  const handleFollow = async () => {
    if (!identity || following) return;
    setFollowing(true);
    try {
      await followUser.mutateAsync(video.uploader.toString());
    } catch {
      setFollowing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: video.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 action-btn-shadow">
      {/* Like */}
      <AuthGuard action="like this video">
        <button
          onClick={handleLike}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${liked ? 'text-vibe' : 'text-white'}`}
          disabled={likeVideo.isPending}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${liked ? 'bg-vibe/20' : 'bg-black/30'}`}>
            <Heart
              className={`w-6 h-6 transition-all ${liked ? 'fill-vibe text-vibe animate-heart-pop' : 'text-white'}`}
            />
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">{formatCount(localLikeCount)}</span>
        </button>
      </AuthGuard>

      {/* Comment */}
      <button
        onClick={onCommentClick}
        className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
      >
        <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-semibold text-white drop-shadow">{formatCount(video.commentCount)}</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 text-white transition-transform active:scale-90"
      >
        <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-semibold text-white drop-shadow">Share</span>
      </button>

      {/* Follow */}
      <AuthGuard action="follow this creator">
        <button
          onClick={handleFollow}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${following ? 'text-vibe' : 'text-white'}`}
          disabled={followUser.isPending}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${following ? 'bg-vibe/20' : 'bg-black/30'}`}>
            {following ? (
              <UserCheck className="w-6 h-6 text-vibe" />
            ) : (
              <UserPlus className="w-6 h-6 text-white" />
            )}
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">{following ? 'Following' : 'Follow'}</span>
        </button>
      </AuthGuard>
    </div>
  );
}
