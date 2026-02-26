import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useGetUserProfile, useFollow, getVideoRegistry } from '../hooks/useQueries';
import ProfileHeader from '../components/ProfileHeader';
import VideoGrid from '../components/VideoGrid';
import EditProfileModal from '../components/EditProfileModal';
import AuthGuard from '../components/AuthGuard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { UserX } from 'lucide-react';

export default function ProfilePage() {
  const params = useParams({ strict: false }) as { principal?: string };
  const { identity, userProfile: callerProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const followMutation = useFollow();

  const callerPrincipal = identity?.getPrincipal().toString();
  const targetPrincipal = params.principal ?? callerPrincipal ?? null;
  const isOwnProfile = targetPrincipal === callerPrincipal;

  const { data: profile, isLoading } = useGetUserProfile(targetPrincipal);

  const allVideos = getVideoRegistry();
  const userVideos = targetPrincipal
    ? allVideos.filter((v) => v.uploader.toString() === targetPrincipal)
    : [];

  const handleFollow = async () => {
    if (!targetPrincipal) return;
    setIsFollowing(true);
    try {
      await followMutation.mutateAsync(targetPrincipal);
    } catch {
      setIsFollowing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center py-8 space-y-4">
          <Skeleton className="w-20 h-20 rounded-full bg-secondary" />
          <Skeleton className="h-5 w-32 bg-secondary" />
          <Skeleton className="h-4 w-48 bg-secondary" />
          <Skeleton className="h-11 w-full max-w-xs bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6 text-center">
        <UserX className="w-14 h-14 mb-4 opacity-30" />
        <p className="text-base font-semibold">Profile not found</p>
        <p className="text-sm mt-1">This user hasn't set up their profile yet.</p>
      </div>
    );
  }

  const displayProfile = isOwnProfile && callerProfile ? callerProfile : profile;

  return (
    <ScrollArea className="h-full">
      <ProfileHeader
        profile={displayProfile}
        videoCount={userVideos.length}
        isOwnProfile={isOwnProfile}
        onEditProfile={() => setShowEditModal(true)}
        onFollow={handleFollow}
        isFollowing={isFollowing}
        isFollowLoading={followMutation.isPending}
      />

      {/* Divider */}
      <div className="h-px bg-border/40 mx-4 mb-1" />

      {/* Videos grid */}
      <div className="pb-4">
        <VideoGrid
          videos={userVideos}
          emptyMessage={isOwnProfile ? "You haven't uploaded any videos yet" : "No videos yet"}
        />
      </div>

      {isOwnProfile && callerProfile && (
        <EditProfileModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentProfile={callerProfile}
        />
      )}
    </ScrollArea>
  );
}
