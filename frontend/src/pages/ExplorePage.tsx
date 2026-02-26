import React, { useState, useEffect } from 'react';
import { Compass, TrendingUp, Clock, Search } from 'lucide-react';
import VideoGrid from '../components/VideoGrid';
import { getVideoRegistry } from '../hooks/useQueries';
import type { VideoMeta } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

type SortMode = 'trending' | 'recent';

export default function ExplorePage() {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = () => {
      const registry = getVideoRegistry();
      setVideos(registry);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...videos].sort((a, b) => {
    if (sortMode === 'trending') return Number(b.likeCount) - Number(a.likeCount);
    return Number(b.uploadTimestamp) - Number(a.uploadTimestamp);
  });

  const filtered = search.trim()
    ? sorted.filter(
        (v) =>
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
      )
    : sorted;

  return (
    <ScrollArea className="h-full">
      <div className="px-3 py-4 space-y-3 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-vibe" />
          <h1 className="font-display text-xl font-bold text-foreground">Explore</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground h-11 rounded-xl text-base"
          />
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortMode('trending')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-1 justify-center min-h-[44px] ${
              sortMode === 'trending'
                ? 'bg-vibe text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending
          </button>
          <button
            onClick={() => setSortMode('recent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-1 justify-center min-h-[44px] ${
              sortMode === 'recent'
                ? 'bg-vibe text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            Recent
          </button>
        </div>

        {/* Video grid */}
        <VideoGrid
          videos={filtered}
          emptyMessage={search ? 'No videos match your search' : 'No videos yet. Be the first to upload!'}
        />
      </div>
    </ScrollArea>
  );
}
