import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import { Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
}

export default function EditProfileModal({ open, onClose, currentProfile }: EditProfileModalProps) {
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl);
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (open) {
      setUsername(currentProfile.username);
      setBio(currentProfile.bio);
      setAvatarUrl(currentProfile.avatarUrl);
    }
  }, [open, currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    await saveProfile.mutateAsync({
      username: username.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      followerCount: currentProfile.followerCount,
      followingCount: currentProfile.followingCount,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-username" className="text-foreground font-medium">
              Username <span className="text-vibe">*</span>
            </Label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@yourname"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              maxLength={30}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bio" className="text-foreground font-medium">Bio</Label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-avatar" className="text-foreground font-medium">Avatar URL</Label>
            <Input
              id="edit-avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-vibe hover:bg-vibe/90 text-white font-semibold"
              disabled={!username.trim() || saveProfile.isPending}
            >
              {saveProfile.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
