import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAddComment } from '../hooks/useQueries';
import { Send, Loader2 } from 'lucide-react';

interface CommentInputProps {
  videoId: string;
  onCommentAdded?: () => void;
}

export default function CommentInput({ videoId, onCommentAdded }: CommentInputProps) {
  const [text, setText] = useState('');
  const addComment = useAddComment();
  const MAX_CHARS = 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || addComment.isPending) return;

    await addComment.mutateAsync({ videoId, text: text.trim() });
    setText('');
    onCommentAdded?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end p-3 border-t border-border">
      <div className="flex-1">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none text-sm min-h-[40px] max-h-[100px]"
          rows={1}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">{text.length}/{MAX_CHARS}</p>
      </div>
      <Button
        type="submit"
        size="icon"
        className="bg-vibe hover:bg-vibe/90 text-white flex-shrink-0 mb-6"
        disabled={!text.trim() || addComment.isPending}
      >
        {addComment.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
}
