import React, { useState, useEffect } from 'react'
import GameBoard from './components/Game/GameBoard.jsx'
import LoadingSpinner from './components/UI/LoadingSpinner.jsx'
import CelebrationModal from './components/UI/CelebrationModal.jsx'
import ProgressBar from './components/UI/ProgressBar.jsx'
import useImageApi from './hooks/useImageApi.js'
import useResponsiveGrid from './hooks/useResponsiveGrid.js'
import storageService from './services/storageService.js'
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

  // Calculate responsive grid size
  const gridSize = useResponsiveGrid(difficulty.rows, difficulty.cols)

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      // Load progress from storage
      const progress = storageService.initializeProgress()
      setCompletedCount(progress.completedPuzzles)
      setDifficulty(progress.currentDifficulty)

      // Load first image
      const image = await getNextImage()
      if (image) {
        setCurrentImage(image.url)
      }
    }

    if (!isLoading) {
      initGame()
    }
  }, [isLoading, getNextImage])

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

    // Load next image
    const image = await getNextImage()
    if (image) {
      setCurrentImage(image.url)
    }
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
      <ProgressBar
        rows={difficulty.rows}
        cols={difficulty.cols}
        completedPuzzles={completedCount}
      />

      <GameBoard
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
