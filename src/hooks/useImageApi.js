import { useState, useEffect, useCallback } from 'react';
import imageService from '../services/imageService.js';

/**
 * React hook for managing images from the image service
 * @returns {Object} Image API state and methods
 */
export function useImageApi() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize the image service on mount
   */
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await imageService.initialize();

        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize image service:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load images');
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Get the next image from the service
   * @returns {Promise<Object|null>} Image object or null on error
   */
  const getNextImage = useCallback(async () => {
    try {
      const image = await imageService.getNextImage();
      return image;
    } catch (err) {
      console.error('Failed to get next image:', err);
      setError(err.message || 'Failed to load image');
      return null;
    }
  }, []);

  /**
   * Clear the image cache
   */
  const clearCache = useCallback(async () => {
    try {
      await imageService.clearCache();
      // Re-initialize after clearing
      await imageService.initialize();
      setError(null);
    } catch (err) {
      console.error('Failed to clear cache:', err);
      setError(err.message || 'Failed to clear cache');
    }
  }, []);

  return {
    isLoading,
    error,
    isInitialized,
    getNextImage,
    clearCache,
  };
}

export default useImageApi;
