import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Upload, AlertCircle } from 'lucide-react';

export type UploadState = 'idle' | 'validating' | 'uploading' | 'processing' | 'success' | 'error';

interface UploadProgressProps {
  state: UploadState;
  progress: number;
  error?: string;
}

const stateConfig: Record<UploadState, { label: string; icon: React.ReactNode; color: string }> = {
  idle: { label: '', icon: null, color: '' },
  validating: {
    label: 'Validating video...',
    icon: <Loader2 className="w-5 h-5 animate-spin text-vibe" />,
    color: 'text-vibe',
  },
  uploading: {
    label: 'Uploading video...',
    icon: <Upload className="w-5 h-5 text-vibe animate-bounce" />,
    color: 'text-vibe',
  },
  processing: {
    label: 'Processing on chain...',
    icon: <Loader2 className="w-5 h-5 animate-spin text-vibe" />,
    color: 'text-vibe',
  },
  success: {
    label: 'Upload complete! 🎉',
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    color: 'text-green-500',
  },
  error: {
    label: 'Upload failed',
    icon: <XCircle className="w-5 h-5 text-destructive" />,
    color: 'text-destructive',
  },
};

export default function UploadProgress({ state, progress, error }: UploadProgressProps) {
  if (state === 'idle') return null;

  const config = stateConfig[state];

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${
        state === 'error'
          ? 'bg-destructive/10 border-destructive/30'
          : state === 'success'
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-secondary/50 border-border'
      }`}
    >
      <div className="flex items-center gap-3">
        {config.icon}
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        {state === 'uploading' && (
          <span className="ml-auto text-sm font-bold text-vibe">{Math.round(progress)}%</span>
        )}
      </div>

      {state === 'uploading' && (
        <Progress value={progress} className="h-2" />
      )}

      {state === 'processing' && (
        <Progress value={100} className="h-2 animate-pulse" />
      )}

      {state === 'error' && error && (
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
