import React, { useState, useEffect } from 'react'
import GameBoard from './components/Game/GameBoard.jsx'
import LoadingSpinner from './components/UI/LoadingSpinner.jsx'
import CelebrationModal from './components/UI/CelebrationModal.jsx'
import ProgressBar from './components/UI/ProgressBar.jsx'
import ResetButton from './components/UI/ResetButton.jsx'
import useImageApi from './hooks/useImageApi.js'
import useResponsiveGrid from './hooks/useResponsiveGrid.js'
import storageService from './services/storageService.js'
import imageService from './services/imageService.js'
import { calculateNextDifficulty, getCongratulationsMessage, willDifficultyIncrease } from './utils/difficultyCalculator.js'
import { GAME_CONFIG } from './constants/gameConfig.js'
import './styles/themes.css'
import './styles/animations.css'

function App() {
  const { isLoading, getNextImage } = useImageApi()
  const [currentImage, setCurrentImage] = useState(null)
  const [difficulty, setDifficulty] = useState({
    rows: GAME_CONFIG.MIN_GRID_SIZE,
    cols: GAME_CONFIG.MIN_GRID_SIZE,
  })
  const [completedCount, setCompletedCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [isLevelUp, setIsLevelUp] = useState(false)
  const [gameBoardKey, setGameBoardKey] = useState(0) // Key to force GameBoard remount on reset

  // Calculate responsive grid size
  // Use total piece count as max unplaced count for consistent sizing
  const totalPieces = difficulty.rows * difficulty.cols;
  const gridSize = useResponsiveGrid(difficulty.rows, difficulty.cols, totalPieces)

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      // Load progress from storage
      const progress = storageService.initializeProgress()
      setCompletedCount(progress.completedPuzzles)
      const savedDifficulty = progress.currentDifficulty
      setDifficulty(savedDifficulty)

      // Load first image matching puzzle orientation
      const image = await imageService.getNextImage(savedDifficulty.rows, savedDifficulty.cols)
      if (image) {
        setCurrentImage(image.url)
      }
    }

    if (!isLoading) {
      initGame()
    }
  }, [isLoading])

  const handlePuzzleComplete = async () => {
    // Check if this will be a level up
    const levelUp = willDifficultyIncrease(completedCount)
    setIsLevelUp(levelUp)

    // Get congratulations message
    const message = getCongratulationsMessage(difficulty.rows, difficulty.cols)
    setCelebrationMessage(message)

    // Show celebration
    setShowCelebration(true)
  }

  const handleNextPuzzle = async () => {
    // Hide celebration
    setShowCelebration(false)

    // Update progress
    const newCount = completedCount + 1
    setCompletedCount(newCount)
    storageService.incrementCompleted(difficulty.rows, difficulty.cols, 0)

    // Calculate next difficulty
    const nextDiff = calculateNextDifficulty(
      newCount,
      difficulty.rows,
      difficulty.cols
    )

    setDifficulty({ rows: nextDiff.rows, cols: nextDiff.cols })
    storageService.updateDifficulty(nextDiff.rows, nextDiff.cols)

    // Load next image matching the new puzzle orientation
    const image = await imageService.getNextImage(nextDiff.rows, nextDiff.cols)
    if (image) {
      setCurrentImage(image.url)
    }

    // Force GameBoard to remount with new image and difficulty
    setGameBoardKey(prevKey => prevKey + 1)
  }

  const handleFullReset = async () => {
    // Reset progress to initial state
    setCompletedCount(0)
    setDifficulty({
      rows: GAME_CONFIG.MIN_GRID_SIZE,
      cols: GAME_CONFIG.MIN_GRID_SIZE,
    })

    // Clear localStorage
    storageService.clearProgress()

    // Get next image matching reset difficulty (2x2)
    const nextImage = await imageService.getNextImage(
      GAME_CONFIG.MIN_GRID_SIZE,
      GAME_CONFIG.MIN_GRID_SIZE
    )
    if (nextImage) {
      setCurrentImage(nextImage.url)
    }

    // Force GameBoard to remount with new image
    setGameBoardKey(prevKey => prevKey + 1)

    // Hide any open celebration
    setShowCelebration(false)

    console.log('Game reset complete')
  }

  if (isLoading) {
    return (
      <div className="app-container">
        <LoadingSpinner message="Loading puzzles..." />
      </div>
    )
  }

  if (!currentImage) {
    return (
      <div className="app-container">
        <h2>No images available</h2>
        <p>Please check your connection and try again.</p>
      </div>
    )
  }

  return (
    <div className="app-container">
      <ResetButton onReset={handleFullReset} />

      <ProgressBar
        rows={difficulty.rows}
        cols={difficulty.cols}
        completedPuzzles={completedCount}
      />

      <GameBoard
        key={gameBoardKey}
        imageUrl={currentImage}
        rows={difficulty.rows}
        cols={difficulty.cols}
        onComplete={handlePuzzleComplete}
        pieceSize={gridSize.pieceSize}
      />

      <CelebrationModal
        isOpen={showCelebration}
        message={celebrationMessage}
        onNext={handleNextPuzzle}
        showLevelUp={isLevelUp}
      />
    </div>
  )
}

export default App
