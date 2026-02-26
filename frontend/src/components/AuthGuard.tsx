import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { LogIn, Loader2, Play } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  action?: string;
  onAuthenticated?: () => void;
}

export default function AuthGuard({ children, action = 'perform this action', onAuthenticated }: AuthGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const [showModal, setShowModal] = useState(false);
  const isLoggingIn = loginStatus === 'logging-in';

  const handleClick = (e: React.MouseEvent) => {
    if (!identity) {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
    } else {
      onAuthenticated?.();
    }
  };

  return (
    <>
      <div onClick={handleClick} className="contents">
        {children}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-vibe/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-vibe fill-vibe" />
              </div>
            </div>
            <DialogTitle className="font-display text-xl text-center">Login Required</DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              You need to be logged in to {action}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <Button
              onClick={() => { setShowModal(false); login(); }}
              className="w-full bg-vibe hover:bg-vibe/90 text-white font-semibold"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> Login</>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="w-full text-muted-foreground"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
