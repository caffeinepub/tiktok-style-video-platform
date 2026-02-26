import React from 'react';
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router';
import { Home, Compass, PlusCircle, User } from 'lucide-react';
import LoginButton from './LoginButton';
import { useAuth } from '../hooks/useAuth';
import ProfileSetupModal from './ProfileSetupModal';
import { useQueryClient } from '@tanstack/react-query';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, needsProfileSetup, profileFetched } = useAuth();
  const queryClient = useQueryClient();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/upload', icon: PlusCircle, label: 'Upload' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* Minimal top branding strip */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 z-50 glass-panel border-b border-border/40">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2"
        >
          <img
            src="/assets/generated/logo-icon.dim_256x256.png"
            alt="VibeReel"
            className="w-7 h-7 rounded-lg"
          />
          <span className="font-display font-bold text-base text-foreground tracking-tight">
            Vibe<span className="text-vibe">Reel</span>
          </span>
        </button>

        <LoginButton
          variant="default"
          size="sm"
          className={
            isAuthenticated
              ? 'text-muted-foreground hover:text-foreground text-xs px-3 py-1.5 h-auto'
              : 'bg-vibe hover:bg-vibe/90 text-white font-semibold text-xs px-4 py-1.5 h-auto rounded-full'
          }
        />
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>

      {/* Bottom tab navigation */}
      <nav className="flex-shrink-0 glass-panel border-t border-border/40 z-50 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 px-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            const isUpload = path === '/upload';
            return (
              <button
                key={path}
                onClick={() => {
                  if (path === '/profile' && !isAuthenticated) {
                    navigate({ to: '/' });
                    return;
                  }
                  navigate({ to: path });
                }}
                className={`flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center px-3 py-1 rounded-xl transition-all ${
                  isUpload
                    ? active
                      ? 'text-vibe'
                      : 'text-muted-foreground hover:text-foreground'
                    : active
                    ? 'text-vibe'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon
                  className={`transition-all ${
                    isUpload
                      ? active
                        ? 'w-7 h-7 stroke-[2.5] text-vibe'
                        : 'w-7 h-7 stroke-[1.5]'
                      : active
                      ? 'w-6 h-6 stroke-[2.5]'
                      : 'w-6 h-6'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium leading-none ${
                    active ? 'font-bold' : ''
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Profile setup modal */}
      {needsProfileSetup && profileFetched && (
        <ProfileSetupModal
          open={true}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
          }}
        />
      )}
    </div>
  );
}
