import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function LoginButton({ variant = 'default', size = 'default', className }: LoginButtonProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (isAuthenticated) {
    return (
      <Button
        onClick={handleAuth}
        variant={variant === 'default' ? 'ghost' : variant}
        size={size}
        className={className}
        disabled={isLoggingIn}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    );
  }

  return (
    <Button
      onClick={handleAuth}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoggingIn}
    >
      {isLoggingIn ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <LogIn className="w-4 h-4 mr-2" />
      )}
      {isLoggingIn ? 'Logging in...' : 'Login'}
    </Button>
  );
}
