import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, X } from 'lucide-react';
import { useGetComments } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import AuthGuard from './AuthGuard';
import { formatCount } from '../utils/videoValidation';

interface CommentsPanelProps {
  videoId: string;
  commentCount: bigint;
  open: boolean;
  onClose: () => void;
}

export default function CommentsPanel({ videoId, commentCount, open, onClose }: CommentsPanelProps) {
  const { data: comments, isLoading } = useGetComments(open ? videoId : null);
  const { identity } = useInternetIdentity();
  const backdropRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 z-30 animate-fade-in"
        onClick={onClose}
      />

      {/* Bottom drawer panel */}
      <div className="absolute bottom-0 left-0 right-0 z-40 flex flex-col rounded-t-2xl overflow-hidden bg-card border-t border-border animate-slide-up"
        style={{ maxHeight: '72%' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border/70" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-vibe" />
            <span className="font-display font-semibold text-foreground text-sm">
              {formatCount(commentCount)} Comments
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments list */}
        <ScrollArea className="flex-1 px-4 min-h-0">
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full bg-secondary flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 bg-secondary" />
                    <Skeleton className="h-3 w-full bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="divide-y divide-border/50 py-2">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          )}
        </ScrollArea>

        {/* Comment input - pinned to bottom */}
        <div className="flex-shrink-0 border-t border-border/50">
          {identity ? (
            <CommentInput videoId={videoId} />
          ) : (
            <AuthGuard action="post a comment">
              <div className="p-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Login to comment...</span>
                </div>
              </div>
            </AuthGuard>
          )}
        </div>
      </div>
    </>
  );
}
