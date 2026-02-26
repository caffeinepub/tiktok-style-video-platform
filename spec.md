# Specification

## Summary
**Goal:** Convert the VibeReel web app into a mobile-first, app-like experience with a phone-width layout, bottom tab navigation, and native-style UI patterns throughout.

**Planned changes:**
- Constrain the overall layout to a centered phone-width container (≤390px) on desktop and remove the top header navigation bar
- Add a persistent bottom tab bar with four tabs (Home, Explore, Upload, Profile), each with an icon, label, and active highlight state
- Update the video feed (HomePage) so each card fills 100dvh with mandatory scroll-snap and preserved auto-play/pause behavior
- Redesign the Upload page as a full-screen mobile sheet with large tap targets, full-width inputs, a prominent upload button, progress bar, and fix the end-to-end upload flow (file selection, chunked upload, success/error feedback)
- Convert the comments panel into a bottom drawer/sheet with a drag handle, backdrop dimming, pinned comment input, and swipe-to-dismiss behavior
- Update Profile and Explore pages to use full-width mobile layouts with stacked profile headers and a 2-column video grid

**User-visible outcome:** The app looks and feels like a native mobile short-video app — navigated via a bottom tab bar, with a snapping full-screen video feed, a working upload flow, a slide-up comments drawer, and mobile-optimized profile and explore pages.
