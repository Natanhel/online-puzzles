# Kids Puzzle Game

A Progressive Web App (PWA) drag & drop puzzle game designed for kids aged 2-5, with progressive difficulty from 2x2 to 6x6 puzzles.

## Features

- 🧩 Progressive difficulty: starts at 2x2, increases every 5 puzzles, up to 6x6
- 📱 Touch-optimized for tablets and smartphones
- 🎨 Kid-friendly bright colors and playful design
- 🖼️ Dynamic images from Unsplash API with offline fallback
- 💾 Progress tracking with LocalStorage
- 📦 Offline-capable PWA with image caching
- ✨ Responsive design that fits any screen size

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. (Optional) Set up Unsplash API

To get fresh kid-friendly images, create a `.env` file:

```bash
cp .env.example .env
```

Then add your Unsplash API key to `.env`:
```
VITE_UNSPLASH_KEY=your_key_here
```

Get a free API key at: https://unsplash.com/developers

**Note:** If you skip this step, the app will use fallback placeholder images.

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
online-puzzles/
├── public/
│   ├── icons/              # PWA app icons
│   └── assets/             # Fallback images
├── src/
│   ├── components/
│   │   ├── Game/          # Game components
│   │   └── UI/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Core services
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── constants/         # Configuration
│   └── App.jsx            # Main app
├── package.json
└── vite.config.js
```

## Game Mechanics

### Difficulty Progression

The game automatically increases difficulty every 5 completed puzzles:

- Puzzles 1-5: 2×2 (4 pieces)
- Puzzles 6-10: 2×3 (6 pieces)
- Puzzles 11-15: 3×3 (9 pieces)
- Puzzles 16-20: 3×4 (12 pieces)
- Puzzles 21-25: 4×4 (16 pieces)
- Puzzles 26-30: 4×5 (20 pieces)
- Puzzles 31-35: 5×5 (25 pieces)
- Puzzles 36-40: 5×6 (30 pieces)
- Puzzles 41-45: 6×6 (36 pieces)
- Puzzle 46+: Restarts at 2×2 with new images

### Touch Controls

- Tap/touch a puzzle piece to pick it up
- Drag it to an empty slot in the grid
- Pieces snap into place when dropped
- Correctly placed pieces show a green checkmark

### Progress Tracking

- Your progress is automatically saved
- Completed puzzle count persists between sessions
- Difficulty level is remembered
- Best times tracked per difficulty

## Development

### Key Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **@use-gesture/react** - Touch/mouse gestures
- **Framer Motion** - Animations
- **IndexedDB** - Image caching
- **LocalStorage** - Progress persistence
- **Workbox** - PWA service worker

### Configuration

Edit `src/constants/gameConfig.js` to customize:

- Minimum/maximum grid size
- Puzzles per difficulty level
- Touch target sizes
- Image preload count
- Animation durations
- And more...

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist folder
# Or connect your GitHub repo to Netlify
```

### GitHub Pages

1. Update `vite.config.js` to set `base: '/online-puzzles/'`
2. Build: `npm run build`
3. Deploy `dist` folder to `gh-pages` branch

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ⚠️ Touch events required for mobile

## Performance

- Initial bundle size: ~150KB (gzipped)
- Images cached in IndexedDB for offline use
- Responsive grid calculations optimized for 60fps
- React.memo used for component optimization

## Contributing

This is a personal project, but suggestions are welcome!

## License

MIT

## Credits

- Images from [Unsplash](https://unsplash.com)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Icons and design inspired by kid-friendly UI patterns

---

**Note:** This app is designed for supervised use by children aged 2-5 with parental guidance.
