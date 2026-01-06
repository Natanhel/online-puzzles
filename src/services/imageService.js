import { GAME_CONFIG } from '../constants/gameConfig.js';
import { openDB } from 'idb';

const DB_NAME = 'PuzzleGameDB';
const STORE_NAME = 'images';
const DB_VERSION = 7; // Updated to include 33 total SVG images

class ImageService {
  constructor() {
    this.cache = [];
    this.currentIndex = 0;
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize IndexedDB for image caching
   */
  async initDB() {
    if (this.isInitialized) return;

    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
          // Clear old data when upgrading versions
          if (db.objectStoreNames.contains(STORE_NAME)) {
            db.deleteObjectStore(STORE_NAME);
          }
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          console.log(`Database upgraded from v${oldVersion} to v${newVersion} - cache cleared`);
        },
      });
      this.isInitialized = true;
      console.log('Image cache database initialized');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Fetch kid-friendly images from Unsplash API
   * @param {number} count - Number of images to fetch
   * @returns {Promise<Array>} Array of image objects
   */
  async fetchKidFriendlyImages(count = 5) {
    // ALWAYS use cartoon fallback images for kids
    // Unsplash doesn't reliably return cartoon-style images suitable for toddlers
    console.log('Using local cartoon animal fallback images for kids');
    return this.getFallbackImages(count);

    /* Disabled Unsplash API - using local cartoon SVGs instead
    const apiKey = GAME_CONFIG.UNSPLASH_ACCESS_KEY;

    // If no API key or demo mode, return fallback images
    if (!apiKey || apiKey === 'demo') {
      console.warn('No Unsplash API key found, using fallback images');
      return this.getFallbackImages(count);
    }

    try {
      // Kid-friendly cartoon animals
      const animals = ['cartoon cat', 'cartoon dog', 'cartoon bird', 'cartoon turtle', 'cartoon rabbit', 'cartoon elephant'];
      const category = animals[Math.floor(Math.random() * animals.length)];

      const url = new URL('https://api.unsplash.com/photos/random');
      url.searchParams.append('query', `${category} illustration children`);
      url.searchParams.append('count', count.toString());
      url.searchParams.append('content_filter', 'high');
      url.searchParams.append('orientation', 'landscape');
      url.searchParams.append('w', GAME_CONFIG.IMAGE_DIMENSIONS.width.toString());
      url.searchParams.append('h', GAME_CONFIG.IMAGE_DIMENSIONS.height.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform Unsplash response to our format
      return data.map((img, index) => ({
        id: img.id || `unsplash-${Date.now()}-${index}`,
        url: img.urls.regular || img.urls.small,
        thumbnail: img.urls.thumb,
        description: img.alt_description || category,
        source: 'unsplash',
      }));
    } catch (error) {
      console.error('Failed to fetch from Unsplash:', error);
      // Fallback to local images on error
      return this.getFallbackImages(count);
    }
    */
  }

  /**
   * Get fallback images from local assets
   * @param {number} count - Number of images to return
   * @returns {Array} Array of fallback image objects
   */
  getFallbackImages(count = 5) {
    const fallbacks = GAME_CONFIG.FALLBACK_IMAGES.map((path, index) => ({
      id: `fallback-${index}`,
      url: path,
      thumbnail: path,
      description: `Puzzle image ${index + 1}`,
      source: 'local',
    }));

    // Cycle through fallbacks if count exceeds available
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(fallbacks[i % fallbacks.length]);
    }

    return result;
  }

  /**
   * Load images and add aspect ratio information
   * @param {Array} images - Array of image objects
   * @returns {Promise<Array>} Array of images with aspect ratios
   */
  async loadAspectRatios(images) {
    const promises = images.map(img =>
      new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
          const aspectRatio = image.naturalWidth / image.naturalHeight;
          resolve({
            ...img,
            aspectRatio,
          });
        };
        image.onerror = () => {
          console.warn(`Failed to load image for aspect ratio: ${img.url}`);
          // Default to square if load fails
          resolve({
            ...img,
            aspectRatio: 1,
          });
        };
        image.src = img.url;
      })
    );

    return await Promise.all(promises);
  }

  /**
   * Preload images into memory and cache
   * @param {Array} imageUrls - Array of image URLs to preload
   * @returns {Promise<Array>} Array of loaded image URLs
   */
  async preloadImages(imageUrls) {
    const promises = imageUrls.map(url =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => {
          console.warn(`Failed to preload image: ${url}`);
          resolve(null); // Resolve with null instead of rejecting
        };
        img.src = url;
      })
    );

    const results = await Promise.all(promises);
    return results.filter(url => url !== null); // Filter out failed loads
  }

  /**
   * Cache images to IndexedDB
   * @param {Array} images - Array of image objects to cache
   */
  async cacheImages(images) {
    if (!this.db) {
      await this.initDB();
    }

    if (!this.db) {
      console.warn('Cannot cache images: IndexedDB not available');
      return;
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      for (const image of images) {
        await store.put({
          id: image.id,
          url: image.url,
          thumbnail: image.thumbnail,
          description: image.description,
          source: image.source,
          cachedAt: Date.now(),
        });
      }

      await tx.done;
      console.log(`Cached ${images.length} images to IndexedDB`);
    } catch (error) {
      console.error('Failed to cache images:', error);
    }
  }

  /**
   * Retrieve cached images from IndexedDB
   * @returns {Promise<Array>} Array of cached images
   */
  async getCachedImages() {
    if (!this.db) {
      await this.initDB();
    }

    if (!this.db) {
      return [];
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const images = await store.getAll();
      await tx.done;

      console.log(`Retrieved ${images.length} cached images`);
      return images;
    } catch (error) {
      console.error('Failed to retrieve cached images:', error);
      return [];
    }
  }

  /**
   * Initialize the image cache on app start
   * @returns {Promise<void>}
   */
  async initialize() {
    await this.initDB();

    // Try to load cached images first
    const cachedImages = await this.getCachedImages();

    if (cachedImages.length > 0) {
      this.cache = cachedImages;
      this.currentIndex = 0;
      console.log(`Initialized with ${cachedImages.length} cached images`);
    }

    // Fetch fresh images in the background
    try {
      const freshImages = await this.fetchKidFriendlyImages(
        GAME_CONFIG.IMAGE_PRELOAD_COUNT
      );

      // Split local and remote images - local SVGs don't need preloading
      const localImages = freshImages.filter(img => img.source === 'local');
      const remoteImages = freshImages.filter(img => img.source !== 'local');

      // Add local images directly to cache (no preload needed for local SVGs)
      // But load them to get aspect ratios
      if (localImages.length > 0) {
        const imagesWithAspectRatios = await this.loadAspectRatios(localImages);
        this.cache = [...this.cache, ...imagesWithAspectRatios];
        await this.cacheImages(imagesWithAspectRatios);
        console.log(`Added ${imagesWithAspectRatios.length} local images to cache`);
      }

      // Only preload remote images
      if (remoteImages.length > 0) {
        const preloadedUrls = await this.preloadImages(
          remoteImages.map(img => img.url)
        );

        if (preloadedUrls.length > 0) {
          // Filter to only successfully preloaded images
          const successfulImages = remoteImages.filter(img =>
            preloadedUrls.includes(img.url)
          );

          this.cache = [...this.cache, ...successfulImages];
          await this.cacheImages(successfulImages);
          console.log(`Fetched and cached ${successfulImages.length} remote images`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch fresh images during initialization:', error);

      // If we have no cache and fetch failed, use fallbacks
      if (this.cache.length === 0) {
        this.cache = this.getFallbackImages(GAME_CONFIG.IMAGE_PRELOAD_COUNT);
      }
    }
  }

  /**
   * Get the next image from cache, optionally filtered by puzzle orientation
   * @param {number} puzzleRows - Number of rows in the puzzle
   * @param {number} puzzleCols - Number of columns in the puzzle
   * @returns {Promise<Object>} Next image object
   */
  async getNextImage(puzzleRows = null, puzzleCols = null) {
    // If cache is running low, fetch more images
    if (this.currentIndex >= this.cache.length - 2) {
      this.fetchMoreImages();
    }

    // If cache is empty, initialize
    if (this.cache.length === 0) {
      await this.initialize();
    }

    // Filter images by orientation if puzzle dimensions provided
    let availableImages = this.cache;
    if (puzzleRows && puzzleCols) {
      availableImages = this.filterImagesByOrientation(this.cache, puzzleRows, puzzleCols);

      // If no matching images found, fall back to all images
      if (availableImages.length === 0) {
        console.warn('No images match puzzle orientation, using all images');
        availableImages = this.cache;
      }
    }

    // Get current image and increment index
    const image = availableImages[this.currentIndex % availableImages.length];
    this.currentIndex++;

    return image;
  }

  /**
   * Filter images by orientation to match puzzle aspect ratio
   * @param {Array} images - Array of image objects
   * @param {number} puzzleRows - Number of rows in puzzle
   * @param {number} puzzleCols - Number of columns in puzzle
   * @returns {Array} Filtered images matching orientation
   */
  filterImagesByOrientation(images, puzzleRows, puzzleCols) {
    const puzzleAspectRatio = puzzleCols / puzzleRows;
    const isSquarePuzzle = puzzleRows === puzzleCols;
    const isWidePuzzle = puzzleCols > puzzleRows;
    const isTallPuzzle = puzzleRows > puzzleCols;

    return images.filter(img => {
      // Load image to get dimensions (we'll need to preload this)
      // For now, assume SVGs from local have aspect ratios we can infer from filenames
      // or we need to store aspect ratios in the image objects

      // Since we don't have aspect ratios stored yet, let's use a simple heuristic:
      // We'll need to update this when images are cached to include aspect ratios

      // For now, check if image has aspectRatio property
      if (!img.aspectRatio) {
        // If no aspect ratio info, include it (backward compatibility)
        return true;
      }

      const imageAspectRatio = img.aspectRatio;
      const isSquareImage = Math.abs(imageAspectRatio - 1) < 0.2; // Within 20% of square
      const isWideImage = imageAspectRatio > 1.2;
      const isTallImage = imageAspectRatio < 0.8;

      // Matching logic:
      // - Square puzzles: prefer square images
      // - Wide puzzles: prefer wide images
      // - Tall puzzles: prefer tall images
      if (isSquarePuzzle) {
        return isSquareImage;
      } else if (isWidePuzzle) {
        return isWideImage || isSquareImage;
      } else if (isTallPuzzle) {
        return isTallImage || isSquareImage;
      }

      return true;
    });
  }

  /**
   * Fetch more images in the background
   */
  async fetchMoreImages() {
    try {
      const newImages = await this.fetchKidFriendlyImages(5);

      // Split local and remote images - local SVGs don't need preloading
      const localImages = newImages.filter(img => img.source === 'local');
      const remoteImages = newImages.filter(img => img.source !== 'local');

      // Add local images directly to cache with aspect ratios
      if (localImages.length > 0) {
        const imagesWithAspectRatios = await this.loadAspectRatios(localImages);
        this.cache = [...this.cache, ...imagesWithAspectRatios];
        await this.cacheImages(imagesWithAspectRatios);
        console.log(`Added ${imagesWithAspectRatios.length} additional local images`);
      }

      // Only preload remote images
      if (remoteImages.length > 0) {
        const preloadedUrls = await this.preloadImages(remoteImages.map(img => img.url));

        const successfulImages = remoteImages.filter(img =>
          preloadedUrls.includes(img.url)
        );

        if (successfulImages.length > 0) {
          this.cache = [...this.cache, ...successfulImages];
          await this.cacheImages(successfulImages);
          console.log(`Fetched ${successfulImages.length} additional remote images`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch more images:', error);
    }
  }

  /**
   * Clear all cached images (useful for debugging)
   */
  async clearCache() {
    if (!this.db) {
      await this.initDB();
    }

    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction(STORE_NAME, 'readwrite');
      await tx.objectStore(STORE_NAME).clear();
      await tx.done;

      this.cache = [];
      this.currentIndex = 0;
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Reset to next image in cache (for game reset)
   * @returns {Object|null} Next image object or null if cache is empty
   */
  resetToNextImage() {
    if (this.cache.length === 0) {
      console.warn('Cannot reset to next image: cache is empty');
      return null;
    }

    // Move to next image in rotation
    this.currentIndex++;
    const nextImage = this.cache[this.currentIndex % this.cache.length];
    console.log(`Reset to next image: ${nextImage.id}`);
    return nextImage;
  }
}

// Export a singleton instance
const imageService = new ImageService();
export default imageService;
