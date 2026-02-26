import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, User } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ open, onComplete }: ProfileSetupModalProps) {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    await saveProfile.mutateAsync({
      username: username.trim(),
      bio: bio.trim(),
      avatarUrl: '',
      followerCount: BigInt(0),
      followingCount: BigInt(0),
    });
    onComplete();
  };

  return (
    <Dialog open={open}>
      <DialogContent className="bg-card border-border text-foreground max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-vibe flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="font-display text-xl">Set Up Your Profile</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Choose a username to get started on VibeReel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground font-medium">
              Username <span className="text-vibe">*</span>
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@yourname"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              maxLength={30}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-foreground font-medium">
              Bio <span className="text-muted-foreground text-sm">(optional)</span>
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-vibe hover:bg-vibe/90 text-white font-semibold"
            disabled={!username.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
            ) : (
              'Get Started 🎬'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
