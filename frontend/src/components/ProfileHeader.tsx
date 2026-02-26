import React from 'react';
import type { UserProfile } from '../backend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCount } from '../utils/videoValidation';
import { Users, Video, Edit2, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
  profile: UserProfile;
  videoCount: number;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  isFollowLoading?: boolean;
}

export default function ProfileHeader({
  profile,
  videoCount,
  isOwnProfile,
  onEditProfile,
  onFollow,
  isFollowing = false,
  isFollowLoading = false,
}: ProfileHeaderProps) {
  const avatarUrl = profile.avatarUrl || '/assets/generated/default-avatar.dim_256x256.png';
  const initials = profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center pt-6 pb-4 px-4 w-full">
      {/* Avatar */}
      <Avatar className="w-20 h-20 border-4 border-vibe/50 mb-3">
        <AvatarImage src={avatarUrl} alt={profile.username} />
        <AvatarFallback className="bg-vibe text-white text-xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Username */}
      <h1 className="font-display text-xl font-bold text-foreground mb-1">
        @{profile.username}
      </h1>

      {/* Bio */}
      {profile.bio && (
        <p className="text-muted-foreground text-sm text-center px-4 mb-4 leading-relaxed max-w-full">
          {profile.bio}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-center gap-6 mb-4 w-full">
        <div className="flex flex-col items-center">
          <span className="font-display text-lg font-bold text-foreground leading-tight">
            {formatCount(profile.followerCount)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" />
            Followers
          </span>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="flex flex-col items-center">
          <span className="font-display text-lg font-bold text-foreground leading-tight">
            {formatCount(profile.followingCount)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" />
            Following
          </span>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="flex flex-col items-center">
          <span className="font-display text-lg font-bold text-foreground leading-tight">
            {formatCount(videoCount)}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Video className="w-3 h-3" />
            Videos
          </span>
        </div>
      </div>

      {/* Action button - full width */}
      {isOwnProfile ? (
        <Button
          onClick={onEditProfile}
          variant="outline"
          className="w-full max-w-xs h-11 font-semibold border-border/60 text-foreground hover:bg-secondary/60"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      ) : (
        <Button
          onClick={onFollow}
          disabled={isFollowing || isFollowLoading}
          className={`w-full max-w-xs h-11 font-semibold ${
            isFollowing
              ? 'bg-secondary text-foreground border border-border/60'
              : 'bg-vibe hover:bg-vibe/90 text-white'
          }`}
        >
          {isFollowLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isFollowing ? (
            <UserCheck className="w-4 h-4 mr-2" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}
