export const GAME_CONFIG = {
  // Difficulty settings
  MIN_GRID_SIZE: 2,
  MAX_GRID_SIZE: 6,
  PUZZLES_PER_LEVEL: 5,

  // Touch settings
  DRAG_THRESHOLD: 10,           // px before drag starts
  SNAP_TOLERANCE: 30,           // px to snap to grid
  MIN_TOUCH_TARGET: 60,         // px minimum touch size
  DRAG_DEBOUNCE: 16,            // ms (60fps)

  // Image settings
  IMAGE_PRELOAD_COUNT: 5,
  IMAGE_DIMENSIONS: {
    width: 800,
    height: 600
  },
  FALLBACK_IMAGES: [
    '/assets/fallback-1.svg',
    '/assets/fallback-2.svg',
    '/assets/fallback-3.svg',
    '/assets/fallback-4.svg',
    '/assets/fallback-5.svg',
  ],

  // API settings
  UNSPLASH_ACCESS_KEY: import.meta.env.VITE_UNSPLASH_KEY || 'demo',
  IMAGE_CATEGORIES: ['animals', 'nature', 'toys', 'food', 'colors'],

  // Animation settings
  CELEBRATION_DURATION: 3000,   // ms
  PIECE_TRANSITION: 200,        // ms

  // Storage keys
  STORAGE_KEYS: {
    PROGRESS: 'puzzle_progress',
    CACHED_IMAGES: 'puzzle_images',
    SETTINGS: 'puzzle_settings'
  }
};
