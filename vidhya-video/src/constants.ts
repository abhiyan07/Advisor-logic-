export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const BRAND = {
  cream: '#F5F0EA',
  darkBg: '#1A1714',
  rust: '#C0623A',
  rustLight: '#D4724A',
  grayMid: '#8A8580',
  grayLight: '#D4CFC8',
  white: '#FFFFFF',
  cardBg: '#EEEBE4',
  offBlack: '#2A2420',
  border: '#DDD8D0',
};

// Scene durations in frames at 30fps
export const SCENE_DURATIONS = {
  hook: 270,        // 9s  — "What if you already knew..."
  reveal: 240,      // 8s  — Landing page / product intro
  onboarding: 330,  // 11s — Quiz shortlist builder
  advisor: 540,     // 18s — AI Advisor chat
  appBoard: 330,    // 11s — Kanban board
  university: 390,  // 13s — University detail + professor email
  scholarships: 360,// 12s — Scholarship search + cards
  endCard: 240,     // 8s  — Logo + tagline + CTA
};

export const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0);
// = 2700 frames = 90 seconds
