import React, { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { useUploadVideo } from '../hooks/useQueries';
import { validateVideoFile, formatDuration } from '../utils/videoValidation';
import UploadProgress, { type UploadState } from '../components/UploadProgress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Film, X, LogIn, AlertCircle, Video } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

function generateId(): string {
  return `video_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const { login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const uploadVideo = useUploadVideo();

  const [file, setFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFileError('');
    setValidationError('');
    setUploadState('validating');

    const result = await validateVideoFile(selected);
    if (!result.valid) {
      setFileError(result.error ?? 'Invalid video file');
      setUploadState('idle');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selected);
    setVideoDuration(result.duration ?? 0);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setUploadState('idle');
  };

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setVideoDuration(0);
    setFileError('');
    setValidationError('');
    setUploadState('idle');
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    if (uploadVideo.isPending) return;

    setValidationError('');
    setUploadState('uploading');
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
      const id = generateId();

      await uploadVideo.uploadWithProgress({
        id,
        title: title.trim(),
        description: description.trim(),
        duration: videoDuration,
        fileBytes: bytes,
        onProgress: (pct) => {
          setUploadProgress(pct);
        },
        onProcessing: () => {
          setUploadState('processing');
        },
      });

      setUploadState('success');
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1800);
    } catch (err: unknown) {
      let msg = 'Upload failed. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('Unauthorized') || err.message.includes('Only users')) {
          msg = 'You must be logged in to upload videos. Please log in and try again.';
        } else if (err.message.includes('duration exceeds')) {
          msg = 'Video duration exceeds the 10-minute limit.';
        } else if (err.message.includes('Actor not available')) {
          msg = 'Connection error. Please refresh the page and try again.';
        } else {
          msg = err.message;
        }
      }
      setValidationError(msg);
      setUploadState('error');
    }
  };

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-vibe/20 flex items-center justify-center mb-5">
          <Upload className="w-10 h-10 text-vibe" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Share Your Vibe</h2>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed">
          Login to share your videos with the world. Max duration: 10 minutes.
        </p>
        <Button
          onClick={login}
          className="bg-vibe hover:bg-vibe/90 text-white font-semibold px-8 h-12 w-full max-w-xs rounded-xl"
          disabled={loginStatus === 'logging-in'}
        >
          <LogIn className="w-4 h-4 mr-2" />
          {loginStatus === 'logging-in' ? 'Logging in...' : 'Login to Upload'}
        </Button>
      </div>
    );
  }

  const isUploading = uploadVideo.isPending || uploadState === 'uploading' || uploadState === 'processing';

  return (
    <ScrollArea className="h-full">
      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Film className="w-5 h-5 text-vibe" />
          <h1 className="font-display text-xl font-bold text-foreground">New Video</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File picker */}
          {!file ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-file"
                disabled={isUploading}
              />
              <label
                htmlFor="video-file"
                className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  isUploading
                    ? 'border-border opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-vibe hover:bg-secondary/30 active:scale-[0.99]'
                } bg-secondary/20`}
                style={{ minHeight: '200px' }}
              >
                <div className="flex flex-col items-center gap-3 py-10 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-vibe/15 flex items-center justify-center">
                    <Video className="w-8 h-8 text-vibe" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tap to select video</p>
                    <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM · Max 10 min</p>
                  </div>
                </div>
              </label>
              {fileError && (
                <div className="flex items-start gap-2 mt-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{fileError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
              <video
                src={previewUrl}
                className="w-full h-full object-contain"
                controls
                muted
              />
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-black transition-colors"
                  aria-label="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-xs font-medium">
                {formatDuration(videoDuration)}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-foreground font-medium text-sm">
              Title <span className="text-vibe">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your video a catchy title..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base rounded-xl"
              maxLength={100}
              required
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-foreground font-medium text-sm">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none rounded-xl text-base"
              rows={3}
              maxLength={500}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
          </div>

          {/* Progress indicator */}
          <UploadProgress
            state={uploadState}
            progress={uploadProgress}
            error={validationError}
          />

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full bg-vibe hover:bg-vibe/90 text-white font-bold h-13 text-base rounded-xl disabled:opacity-60"
            style={{ height: '52px' }}
            disabled={!file || !title.trim() || isUploading || uploadState === 'success'}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5 animate-bounce" />
                {uploadState === 'processing' ? 'Processing...' : 'Uploading...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Post Video
              </span>
            )}
          </Button>
        </form>
      </div>
    </ScrollArea>
  );
}
