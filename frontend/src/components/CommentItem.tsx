import React from 'react';
import type { Comment } from '../backend';
import { useGetUserProfile } from '../hooks/useQueries';
import { formatTimestamp } from '../utils/videoValidation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const authorStr = comment.author.toString();
  const { data: profile } = useGetUserProfile(authorStr);

  const displayName = profile?.username ?? authorStr.slice(0, 8) + '...';
  const avatarUrl = profile?.avatarUrl ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex gap-3 py-3">
      <Avatar className="w-8 h-8 flex-shrink-0">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
        <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground truncate">@{displayName}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTimestamp(comment.timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 mt-0.5 break-words">{comment.text}</p>
      </div>
    </div>
  );
}
