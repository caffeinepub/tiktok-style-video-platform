import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Comment } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile', identity?.getPrincipal().toString()] });
    },
  });
}

export function useGetUserProfile(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        const p = Principal.fromText(principal);
        return await actor.getUserProfile(p);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export interface VideoMeta {
  id: string;
  title: string;
  description: string;
  uploader: Principal;
  uploadTimestamp: bigint;
  duration: bigint;
  likeCount: bigint;
  commentCount: bigint;
  videoUrl: string;
}

// We store videos in a local registry since the backend doesn't have a getVideos endpoint
// Videos are stored client-side after upload and fetched from the registry
const videoRegistry: Map<string, VideoMeta> = new Map();

export function getVideoRegistry(): VideoMeta[] {
  return Array.from(videoRegistry.values()).sort(
    (a, b) => Number(b.uploadTimestamp) - Number(a.uploadTimestamp)
  );
}

export function addToVideoRegistry(video: VideoMeta) {
  videoRegistry.set(video.id, video);
}

/**
 * Upload video mutation.
 * The onProgress callback is passed via a ref to avoid serialization issues
 * with React Query mutation variables.
 */
export function useUploadVideo() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  // Store the progress callback in a ref so it's not part of mutation variables
  const onProgressRef = useRef<((pct: number) => void) | null>(null);
  // Store the processing callback in a ref
  const onProcessingRef = useRef<(() => void) | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      duration,
      fileBytes,
    }: {
      id: string;
      title: string;
      description: string;
      duration: number;
      fileBytes: Uint8Array<ArrayBuffer>;
    }) => {
      if (!actor) throw new Error('Actor not available. Please make sure you are logged in.');

      // Create blob with progress tracking using the ref callback
      const progressCallback = onProgressRef.current ?? (() => {});
      const blob = ExternalBlob.fromBytes(fileBytes).withUploadProgress(progressCallback);

      // Upload to backend — this triggers the actual blob upload + canister call
      await actor.uploadVideo(
        id,
        title,
        description,
        BigInt(Math.floor(duration)),
        blob
      );

      // Signal processing state after upload completes
      if (onProcessingRef.current) {
        onProcessingRef.current();
      }

      // Build video meta for local registry
      const uploaderPrincipal = identity?.getPrincipal() ?? Principal.anonymous();
      const videoMeta: VideoMeta = {
        id,
        title,
        description,
        uploader: uploaderPrincipal,
        uploadTimestamp: BigInt(Date.now()) * BigInt(1_000_000),
        duration: BigInt(Math.floor(duration)),
        likeCount: BigInt(0),
        commentCount: BigInt(0),
        videoUrl: blob.getDirectURL(),
      };
      addToVideoRegistry(videoMeta);
      return videoMeta;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  return {
    ...mutation,
    /**
     * Upload a video file with progress tracking.
     * @param params - Upload parameters including file bytes and callbacks
     */
    uploadWithProgress: async (params: {
      id: string;
      title: string;
      description: string;
      duration: number;
      fileBytes: Uint8Array<ArrayBuffer>;
      onProgress?: (pct: number) => void;
      onProcessing?: () => void;
    }) => {
      // Store callbacks in refs before calling mutateAsync
      onProgressRef.current = params.onProgress ?? null;
      onProcessingRef.current = params.onProcessing ?? null;

      return mutation.mutateAsync({
        id: params.id,
        title: params.title,
        description: params.description,
        duration: params.duration,
        fileBytes: params.fileBytes,
      });
    },
  };
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likeVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useGetComments(videoId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', videoId],
    queryFn: async () => {
      if (!actor || !videoId) return [];
      return actor.getComments(videoId);
    },
    enabled: !!actor && !actorFetching && !!videoId,
    refetchInterval: 10000,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, text }: { videoId: string; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addComment(videoId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useFollow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: string) => {
      if (!actor) throw new Error('Actor not available');
      const p = Principal.fromText(userToFollow);
      await actor.follow(p);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
