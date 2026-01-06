# PWA Icons

## Current Status
The `icon.svg` file contains the app icon design. For production, you need to convert this to PNG format.

## Generate PNG Icons

### Option 1: Using Online Tools
1. Open https://realfavicongenerator.net/
2. Upload `icon.svg`
3. Generate and download icons
4. Replace the placeholder PNG files

### Option 2: Using ImageMagick (Command Line)
```bash
# Install ImageMagick if you don't have it
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate 192x192
convert icon.svg -resize 192x192 icon-192.png

# Generate 512x512
convert icon.svg -resize 512x512 icon-512.png
```

### Option 3: Using Node.js Sharp
```bash
npm install --save-dev sharp sharp-cli

npx sharp -i icon.svg -o icon-192.png resize 192 192
npx sharp -i icon.svg -o icon-512.png resize 512 512
```

## Required Sizes
- `icon-192.png` - 192x192px (for mobile home screen)
- `icon-512.png` - 512x512px (for splash screen)

Both should be PNG format for best PWA compatibility.
