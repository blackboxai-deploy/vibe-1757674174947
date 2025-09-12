"use client";

import React from 'react';
import { GameState } from '@/app/page';

interface GameGridProps {
  gameState: GameState;
  onTileClick: (row: number, col: number) => void;
  showExplosion: boolean;
}

const GRID_SIZE = 5;

export function GameGrid({ gameState, onTileClick, showExplosion }: GameGridProps) {
  const renderTile = (row: number, col: number) => {
    const isRevealed = gameState.revealedTiles[row]?.[col];
    const tileType = gameState.grid[row]?.[col];
    const isClickable = gameState.phase === 'playing' && !isRevealed;

    let tileContent = '';
    let tileClasses = 'w-16 h-16 md:w-20 md:h-20 border-2 border-slate-600 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all duration-200 transform hover:scale-105 ';

    if (!isRevealed) {
      // Hidden tile
      tileClasses += 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-lg ';
      if (gameState.phase === 'playing') {
        tileClasses += 'hover:shadow-xl hover:shadow-blue-500/20 ';
      }
      tileContent = '?';
    } else {
      // Revealed tile
      if (tileType === 'bomb') {
        tileClasses += 'bg-gradient-to-br from-red-600 to-red-800 text-yellow-300 animate-pulse ';
        tileContent = '💣';
      } else {
        tileClasses += 'bg-gradient-to-br from-green-600 to-green-800 text-white ';
        tileContent = '✅';
      }
    }

    // Add explosion effect
    if (showExplosion && isRevealed && tileType === 'bomb') {
      tileClasses += 'animate-bounce scale-125 ';
    }

    // Disable pointer events if not clickable
    if (!isClickable) {
      tileClasses += 'cursor-not-allowed ';
    }

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => isClickable && onTileClick(row, col)}
        disabled={!isClickable}
        className={tileClasses}
        aria-label={`Tile at row ${row + 1}, column ${col + 1}`}
      >
        <span className="text-shadow-lg">{tileContent}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Current Multiplier Display */}
      {gameState.phase === 'playing' && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-xl font-bold text-xl shadow-lg animate-pulse">
          Current Multiplier: {gameState.currentMultiplier}x
        </div>
      )}

      {/* Game Progress */}
      {gameState.phase === 'playing' && (
        <div className="text-center">
          <div className="text-lg text-gray-300 mb-2">
            Safe Tiles Revealed: {gameState.tilesRevealed} / {(GRID_SIZE * GRID_SIZE) - gameState.bombCount}
          </div>
          <div className="w-64 bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${(gameState.tilesRevealed / ((GRID_SIZE * GRID_SIZE) - gameState.bombCount)) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Game Grid */}
      <div className="relative">
        {showExplosion && (
          <div className="absolute inset-0 bg-red-500 opacity-30 rounded-lg animate-ping pointer-events-none z-10" />
        )}
        
        <div className="grid grid-cols-5 gap-2 p-6 bg-slate-800 rounded-2xl shadow-2xl border border-slate-600">
          {Array.from({ length: GRID_SIZE }, (_, row) =>
            Array.from({ length: GRID_SIZE }, (_, col) => renderTile(row, col))
          )}
        </div>

        {/* Bomb Counter */}
        <div className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
          💣{gameState.bombCount}
        </div>
      </div>

      {/* Game Instructions */}
      {gameState.phase === 'idle' && (
        <div className="text-center max-w-md">
          <h3 className="text-xl font-bold mb-2 text-yellow-400">How to Play</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <p>• Place your bet and click "Start Game"</p>
            <p>• Click tiles to reveal safe spaces (✅)</p>
            <p>• Avoid bombs (💣) or lose your bet</p>
            <p>• Cash out anytime to secure your winnings</p>
            <p>• Higher risk = Higher rewards!</p>
          </div>
        </div>
      )}

      {/* Game Status Messages */}
      {gameState.phase === 'playing' && gameState.tilesRevealed > 0 && (
        <div className="text-center">
          <div className="text-lg text-green-400 font-semibold">
            Potential Win: ${Math.floor(gameState.currentBet * gameState.currentMultiplier)}
          </div>
          <div className="text-sm text-gray-400">
            Risk Level: {gameState.bombCount === 3 ? 'Low' : gameState.bombCount === 5 ? 'Medium' : 'High'}
          </div>
        </div>
      )}
    </div>
  );
}