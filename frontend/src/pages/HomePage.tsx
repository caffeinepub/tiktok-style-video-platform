import React, { useRef, useEffect, useState, useCallback } from 'react';
import VideoCard from '../components/VideoCard';
import { getVideoRegistry } from '../hooks/useQueries';
import type { VideoMeta } from '../hooks/useQueries';
import { Loader2, Play } from 'lucide-react';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load videos from registry
  useEffect(() => {
    const loadVideos = () => {
      const registry = getVideoRegistry();
      setVideos(registry);
      setLoading(false);
    };
    loadVideos();
    const interval = setInterval(loadVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for active video detection
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6, root: containerRef.current }
    );

    const items = containerRef.current?.querySelectorAll('[data-index]');
    items?.forEach((item) => observerRef.current?.observe(item));
  }, []);

  useEffect(() => {
    if (videos.length > 0) {
      setTimeout(setupObserver, 100);
    }
    return () => observerRef.current?.disconnect();
  }, [videos, setupObserver]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-vibe" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background px-6 text-center">
        <img
          src="/assets/generated/empty-feed.dim_400x400.png"
          alt="No videos"
          className="w-40 h-40 object-contain mb-6 opacity-70"
        />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">No Videos Yet</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Be the first to upload a video and start the vibe!
        </p>
        <div className="flex items-center gap-2 text-vibe">
          <Play className="w-5 h-5 fill-vibe" />
          <span className="text-sm font-medium">Upload your first video</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full feed-scroll hide-scrollbar"
      style={{ touchAction: 'pan-y' }}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          data-index={index}
          className="feed-item"
        >
          <VideoCard
            video={video}
            isActive={index === activeIndex}
          />
        </div>
      ))}
    </div>
  );
}
