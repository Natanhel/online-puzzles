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
    '/assets/image-08-blue-cat.svg',
    '/assets/image-09-car.svg',
    '/assets/image-10-cat.svg',
    '/assets/image-11-sun.svg',
    '/assets/image-12-truck.svg',
    '/assets/image-13-dog.svg',
    '/assets/image-14-fish.svg',
    '/assets/image-15-apple.svg',
    '/assets/image-16-banana.svg',
    '/assets/image-17-elephant.svg',
    '/assets/image-18-red-car.svg',
    '/assets/image-19-butterfly.svg',
    '/assets/image-20-mallard.svg',
    '/assets/image-21-monkey.svg',
    '/assets/image-22-snail.svg',
    '/assets/image-23-peacock.svg',
    '/assets/image-24-garbage-truck.svg',
    '/assets/image-25-alligator.svg',
    '/assets/image-26-bike.svg',
    '/assets/image-27-bus.svg',
    '/assets/image-28-mouse.svg',
    '/assets/image-29-rhino.svg',
    '/assets/image-30-ship.svg',
    '/assets/image-31-monkey-alt.svg',
    '/assets/image-32-van.svg',
    '/assets/image-33-fries.svg',
    '/assets/image-34-hotdog.svg',
    '/assets/image-35-kiwi.svg',
    '/assets/image-36-muffin.svg',
    '/assets/image-37-pizza.svg',
    '/assets/image-38-strawberry.svg',
    '/assets/image-39-taco.svg',
    '/assets/image-40-watermelon.svg',
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
