import { GAME_CONFIG } from '../constants/gameConfig.js';

const { STORAGE_KEYS } = GAME_CONFIG;

/**
 * Storage Service - Wrapper for LocalStorage with error handling
 */

class StorageService {
  /**
   * Check if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get an item from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable()) {
      console.warn('LocalStorage not available');
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Set an item in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} True if successful
   */
  set(key, value) {
    if (!this.isAvailable()) {
      console.warn('LocalStorage not available');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error);

      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded, clearing old data');
        this.clearOldData();

        // Try again after clearing
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Still failed after clearing:', retryError);
          return false;
        }
      }

      return false;
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Clear old data to free up space
   */
  clearOldData() {
    // For now, just clear everything except progress
    // In a production app, you might want more sophisticated cleanup
    const progress = this.getProgress();

    this.clear();

    if (progress) {
      this.saveProgress(progress);
    }
  }

  /**
   * Save progress data
   * @param {Object} progress - Progress object
   */
  saveProgress(progress) {
    this.set(STORAGE_KEYS.PROGRESS, {
      ...progress,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Get progress data
   * @returns {Object|null} Progress object or null
   */
  getProgress() {
    return this.get(STORAGE_KEYS.PROGRESS, null);
  }

  /**
   * Clear progress data
   */
  clearProgress() {
    this.remove(STORAGE_KEYS.PROGRESS);
  }

  /**
   * Save game settings
   * @param {Object} settings - Settings object
   */
  saveSettings(settings) {
    this.set(STORAGE_KEYS.SETTINGS, {
      ...settings,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Get game settings
   * @returns {Object} Settings object with defaults
   */
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS, {
      soundEnabled: true,
      hapticFeedback: true,
      showHints: true,
    });
  }

  /**
   * Initialize default progress if none exists
   * @returns {Object} Initial or existing progress
   */
  initializeProgress() {
    let progress = this.getProgress();

    if (!progress) {
      progress = {
        completedPuzzles: 0,
        currentDifficulty: {
          rows: GAME_CONFIG.MIN_GRID_SIZE,
          cols: GAME_CONFIG.MIN_GRID_SIZE,
        },
        totalPlayTime: 0,
        bestTimes: {},
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };

      this.saveProgress(progress);
    }

    return progress;
  }

  /**
   * Increment completed puzzles count
   * @param {number} rows - Puzzle rows
   * @param {number} cols - Puzzle cols
   * @param {number} timeMs - Time taken in milliseconds
   */
  incrementCompleted(rows, cols, timeMs = 0) {
    const progress = this.getProgress() || this.initializeProgress();

    progress.completedPuzzles += 1;
    progress.totalPlayTime += timeMs;

    // Track best time for this difficulty
    const difficultyKey = `${rows}x${cols}`;
    if (!progress.bestTimes[difficultyKey] || timeMs < progress.bestTimes[difficultyKey]) {
      progress.bestTimes[difficultyKey] = timeMs;
    }

    this.saveProgress(progress);

    return progress;
  }

  /**
   * Update current difficulty
   * @param {number} rows - New rows
   * @param {number} cols - New cols
   */
  updateDifficulty(rows, cols) {
    const progress = this.getProgress() || this.initializeProgress();

    progress.currentDifficulty = { rows, cols };
    this.saveProgress(progress);

    return progress;
  }

  /**
   * Get statistics
   * @returns {Object} Game statistics
   */
  getStats() {
    const progress = this.getProgress();

    if (!progress) {
      return {
        totalPuzzles: 0,
        totalPlayTime: 0,
        bestTimes: {},
      };
    }

    return {
      totalPuzzles: progress.completedPuzzles,
      totalPlayTime: progress.totalPlayTime,
      bestTimes: progress.bestTimes,
      averageTime: progress.completedPuzzles > 0
        ? progress.totalPlayTime / progress.completedPuzzles
        : 0,
    };
  }
}

// Export singleton instance
const storageService = new StorageService();
export default storageService;
