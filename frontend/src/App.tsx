import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from '@/components/ui/sonner';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      {/* Phone-width container centered on desktop */}
      <div className="app-shell">
        <Layout />
      </div>
      <Toaster theme="dark" position="top-center" />
    </>
  ),
});

// Child routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: ExplorePage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: UploadPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const profileWithPrincipalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$principal',
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  exploreRoute,
  uploadRoute,
  profileRoute,
  profileWithPrincipalRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
