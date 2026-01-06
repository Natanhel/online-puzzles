import { GAME_CONFIG } from '../constants/gameConfig.js';
import { openDB } from 'idb';

const DB_NAME = 'PuzzleGameDB';
const STORE_NAME = 'images';
const DB_VERSION = 3; // Force use of local cartoon SVGs only

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
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
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

      // Preload and cache the fresh images
      const preloadedUrls = await this.preloadImages(
        freshImages.map(img => img.url)
      );

      if (preloadedUrls.length > 0) {
        // Filter to only successfully preloaded images
        const successfulImages = freshImages.filter(img =>
          preloadedUrls.includes(img.url)
        );

        this.cache = [...this.cache, ...successfulImages];
        await this.cacheImages(successfulImages);
        console.log(`Fetched and cached ${successfulImages.length} fresh images`);
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
   * Get the next image from cache
   * @returns {Promise<Object>} Next image object
   */
  async getNextImage() {
    // If cache is running low, fetch more images
    if (this.currentIndex >= this.cache.length - 2) {
      this.fetchMoreImages();
    }

    // If cache is empty, initialize
    if (this.cache.length === 0) {
      await this.initialize();
    }

    // Get current image and increment index
    const image = this.cache[this.currentIndex % this.cache.length];
    this.currentIndex++;

    return image;
  }

  /**
   * Fetch more images in the background
   */
  async fetchMoreImages() {
    try {
      const newImages = await this.fetchKidFriendlyImages(5);
      const preloadedUrls = await this.preloadImages(newImages.map(img => img.url));

      const successfulImages = newImages.filter(img =>
        preloadedUrls.includes(img.url)
      );

      if (successfulImages.length > 0) {
        this.cache = [...this.cache, ...successfulImages];
        await this.cacheImages(successfulImages);
        console.log(`Fetched ${successfulImages.length} additional images`);
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
}

// Export a singleton instance
const imageService = new ImageService();
export default imageService;
