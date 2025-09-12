"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GameGrid } from '@/components/GameGrid';
import { BettingPanel } from '@/components/BettingPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { AudioManager } from '@/components/AudioManager';

export interface GameState {
  phase: 'idle' | 'betting' | 'playing' | 'gameOver' | 'won';
  balance: number;
  currentBet: number;
  currentMultiplier: number;
  tilesRevealed: number;
  gameId: string;
  grid: ('bomb' | 'safe' | 'hidden')[][];
  revealedTiles: boolean[][];
  bombCount: number;
}

export interface PlayerStats {
  totalWins: number;
  totalLosses: number;
  totalBetAmount: number;
  totalWinAmount: number;
  bestMultiplier: number;
  currentStreak: number;
  longestStreak: number;
  gamesPlayed: number;
}

const GRID_SIZE = 5;
const INITIAL_BALANCE = 10000;

export default function BombingGame() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'idle',
    balance: INITIAL_BALANCE,
    currentBet: 0,
    currentMultiplier: 1.0,
    tilesRevealed: 0,
    gameId: '',
    grid: [],
    revealedTiles: [],
    bombCount: 5
  });

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalWins: 0,
    totalLosses: 0,
    totalBetAmount: 0,
    totalWinAmount: 0,
    bestMultiplier: 1.0,
    currentStreak: 0,
    longestStreak: 0,
    gamesPlayed: 0
  });

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showExplosion, setShowExplosion] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedBalance = localStorage.getItem('bombing-game-balance');
    const savedStats = localStorage.getItem('bombing-game-stats');
    const savedSettings = localStorage.getItem('bombing-game-settings');

    if (savedBalance) {
      setGameState(prev => ({ ...prev, balance: parseFloat(savedBalance) }));
    }

    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    }

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDifficulty(settings.difficulty || 'medium');
      setAudioEnabled(settings.audioEnabled !== false);
    }
  }, []);

  // Save data when important state changes
  useEffect(() => {
    localStorage.setItem('bombing-game-balance', gameState.balance.toString());
  }, [gameState.balance]);

  useEffect(() => {
    localStorage.setItem('bombing-game-stats', JSON.stringify(playerStats));
  }, [playerStats]);

  useEffect(() => {
    localStorage.setItem('bombing-game-settings', JSON.stringify({
      difficulty,
      audioEnabled
    }));
  }, [difficulty, audioEnabled]);

  // Generate bomb positions
  const generateBombPositions = useCallback((bombCount: number): Set<string> => {
    const bombPositions = new Set<string>();
    
    while (bombPositions.size < bombCount) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      bombPositions.add(`${row}-${col}`);
    }
    
    return bombPositions;
  }, []);

  // Initialize game grid
  const initializeGrid = useCallback((bombCount: number) => {
    const bombPositions = generateBombPositions(bombCount);
    const newGrid: ('bomb' | 'safe' | 'hidden')[][] = [];
    const newRevealedTiles: boolean[][] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      newRevealedTiles[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = bombPositions.has(`${row}-${col}`) ? 'bomb' : 'safe';
        newRevealedTiles[row][col] = false;
      }
    }

    return { grid: newGrid, revealedTiles: newRevealedTiles };
  }, [generateBombPositions]);

  // Calculate multiplier based on revealed tiles and bomb count
  const calculateMultiplier = useCallback((tilesRevealed: number, bombCount: number): number => {
    if (tilesRevealed === 0) return 1.0;
    
    const safeTiles = (GRID_SIZE * GRID_SIZE) - bombCount;
    const remainingSafeTiles = safeTiles - tilesRevealed;
    const remainingTotalTiles = (GRID_SIZE * GRID_SIZE) - tilesRevealed;
    
    if (remainingSafeTiles <= 0) return 10.0; // All safe tiles revealed
    
    // Calculate risk-based multiplier
    const riskFactor = remainingTotalTiles / remainingSafeTiles;
    const baseMultiplier = 1 + (tilesRevealed * 0.3 * riskFactor);
    
    return Math.round(baseMultiplier * 100) / 100;
  }, []);

  // Start new game
  const startGame = useCallback((betAmount: number) => {
    const bombCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
    const { grid, revealedTiles } = initializeGrid(bombCount);
    
    setGameState({
      phase: 'playing',
      balance: gameState.balance - betAmount,
      currentBet: betAmount,
      currentMultiplier: 1.0,
      tilesRevealed: 0,
      gameId: Date.now().toString(),
      grid,
      revealedTiles,
      bombCount
    });

    setPlayerStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      totalBetAmount: prev.totalBetAmount + betAmount
    }));
  }, [gameState.balance, difficulty, initializeGrid]);

  // Handle tile click
  const handleTileClick = useCallback((row: number, col: number) => {
    if (gameState.phase !== 'playing' || gameState.revealedTiles[row][col]) return;

    const newRevealedTiles = gameState.revealedTiles.map(r => [...r]);
    newRevealedTiles[row][col] = true;

    if (gameState.grid[row][col] === 'bomb') {
      // Hit a bomb - game over
      setGameState(prev => ({
        ...prev,
        phase: 'gameOver',
        revealedTiles: newRevealedTiles
      }));

      setPlayerStats(prev => ({
        ...prev,
        totalLosses: prev.totalLosses + 1,
        currentStreak: 0
      }));

      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 1000);
    } else {
      // Safe tile
      const newTilesRevealed = gameState.tilesRevealed + 1;
      const newMultiplier = calculateMultiplier(newTilesRevealed, gameState.bombCount);
      
      setGameState(prev => ({
        ...prev,
        revealedTiles: newRevealedTiles,
        tilesRevealed: newTilesRevealed,
        currentMultiplier: newMultiplier
      }));

      // Check if all safe tiles are revealed
      const totalSafeTiles = (GRID_SIZE * GRID_SIZE) - gameState.bombCount;
      if (newTilesRevealed === totalSafeTiles) {
        // Won the game
        const winAmount = Math.floor(gameState.currentBet * newMultiplier);
        
        setGameState(prev => ({
          ...prev,
          phase: 'won',
          balance: prev.balance + winAmount
        }));

        setPlayerStats(prev => ({
          ...prev,
          totalWins: prev.totalWins + 1,
          totalWinAmount: prev.totalWinAmount + winAmount,
          bestMultiplier: Math.max(prev.bestMultiplier, newMultiplier),
          currentStreak: prev.currentStreak + 1,
          longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1)
        }));
      }
    }
  }, [gameState, calculateMultiplier]);

  // Cash out
  const cashOut = useCallback(() => {
    if (gameState.phase !== 'playing' || gameState.tilesRevealed === 0) return;

    const winAmount = Math.floor(gameState.currentBet * gameState.currentMultiplier);
    
    setGameState(prev => ({
      ...prev,
      phase: 'won',
      balance: prev.balance + winAmount
    }));

    setPlayerStats(prev => ({
      ...prev,
      totalWins: prev.totalWins + 1,
      totalWinAmount: prev.totalWinAmount + winAmount,
      bestMultiplier: Math.max(prev.bestMultiplier, gameState.currentMultiplier),
      currentStreak: prev.currentStreak + 1,
      longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1)
    }));
  }, [gameState]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'idle',
      currentBet: 0,
      currentMultiplier: 1.0,
      tilesRevealed: 0,
      gameId: '',
      grid: [],
      revealedTiles: []
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <AudioManager enabled={audioEnabled} gameState={gameState} />
      
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            💣 BOMBING GAME 💣
          </h1>
          <p className="text-xl text-gray-300 mt-2">Test Your Luck • Win Big • Avoid the Bombs</p>
        </div>

        {/* Game Settings */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              disabled={gameState.phase === 'playing'}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white"
            >
              <option value="easy">Easy (3 bombs)</option>
              <option value="medium">Medium (5 bombs)</option>
              <option value="hard">Hard (8 bombs)</option>
            </select>
          </div>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white hover:bg-slate-700 transition-colors"
          >
            🔊 {audioEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Left Panel - Stats */}
          <div className="order-2 lg:order-1">
            <StatsPanel stats={playerStats} gameState={gameState} />
          </div>

          {/* Center - Game Grid */}
          <div className="order-1 lg:order-2 flex flex-col items-center">
            <GameGrid
              gameState={gameState}
              onTileClick={handleTileClick}
              showExplosion={showExplosion}
            />
            
            {gameState.phase === 'playing' && (
              <button
                onClick={cashOut}
                disabled={gameState.tilesRevealed === 0}
                className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                💰 Cash Out: ${Math.floor(gameState.currentBet * gameState.currentMultiplier)}
              </button>
            )}

            {(gameState.phase === 'gameOver' || gameState.phase === 'won') && (
              <div className="mt-6 text-center">
                <div className={`text-2xl font-bold mb-4 ${gameState.phase === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                  {gameState.phase === 'won' 
                    ? `🎉 YOU WON $${Math.floor(gameState.currentBet * gameState.currentMultiplier)}!` 
                    : '💥 BOOM! You hit a bomb!'}
                </div>
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Betting */}
          <div className="order-3">
            <BettingPanel
              gameState={gameState}
              onStartGame={startGame}
              onResetBalance={() => setGameState(prev => ({ ...prev, balance: INITIAL_BALANCE }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}