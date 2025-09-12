"use client";

import React, { useState } from 'react';
import { GameState } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BettingPanelProps {
  gameState: GameState;
  onStartGame: (betAmount: number) => void;
  onResetBalance: () => void;
}

const PRESET_BETS = [10, 25, 50, 100, 250, 500, 1000];

export function BettingPanel({ gameState, onStartGame, onResetBalance }: BettingPanelProps) {
  const [customBet, setCustomBet] = useState<string>('');
  const [selectedBet, setSelectedBet] = useState<number>(50);

  const handlePresetBet = (amount: number) => {
    setSelectedBet(amount);
    setCustomBet('');
  };

  const handleCustomBetChange = (value: string) => {
    setCustomBet(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedBet(numValue);
    }
  };

  const handleStartGame = () => {
    const betAmount = customBet ? parseFloat(customBet) : selectedBet;
    if (betAmount > 0 && betAmount <= gameState.balance) {
      onStartGame(betAmount);
    }
  };

  const handleMaxBet = () => {
    setSelectedBet(gameState.balance);
    setCustomBet(gameState.balance.toString());
  };

  const canBet = gameState.phase === 'idle' && selectedBet > 0 && selectedBet <= gameState.balance;
  const effectiveBet = customBet ? parseFloat(customBet) : selectedBet;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600 shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-yellow-400">💰 Betting Panel</h2>
      
      {/* Balance Display */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400">Current Balance</div>
        <div className="text-3xl font-bold text-green-400">
          ${gameState.balance.toLocaleString()}
        </div>
        {gameState.balance < 10 && (
          <button
            onClick={onResetBalance}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Reset Balance ($10,000)
          </button>
        )}
      </div>

      {/* Betting Interface */}
      {gameState.phase === 'idle' && (
        <div className="space-y-6">
          {/* Preset Bet Buttons */}
          <div>
            <div className="text-sm text-gray-400 mb-3">Quick Bet Amounts</div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BETS.filter(bet => bet <= gameState.balance).map((bet) => (
                <button
                  key={bet}
                  onClick={() => handlePresetBet(bet)}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selectedBet === bet && !customBet
                      ? 'bg-yellow-500 text-black shadow-lg transform scale-105'
                      : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-105'
                  }`}
                >
                  ${bet}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Bet Input */}
          <div>
            <div className="text-sm text-gray-400 mb-2">Custom Amount</div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={customBet}
                onChange={(e) => handleCustomBetChange(e.target.value)}
                placeholder="Enter custom bet"
                min="1"
                max={gameState.balance}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button
                onClick={handleMaxBet}
                variant="outline"
                size="sm"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 whitespace-nowrap"
              >
                Max
              </Button>
            </div>
          </div>

          {/* Selected Bet Display */}
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400">Selected Bet</div>
            <div className="text-2xl font-bold text-yellow-400">
              ${effectiveBet.toLocaleString()}
            </div>
            {effectiveBet > gameState.balance && (
              <div className="text-red-400 text-sm mt-1">Insufficient balance</div>
            )}
          </div>

          {/* Start Game Button */}
          <Button
            onClick={handleStartGame}
            disabled={!canBet || effectiveBet > gameState.balance}
            className="w-full py-4 text-xl font-bold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {effectiveBet > gameState.balance 
              ? '❌ Insufficient Balance' 
              : '🚀 Start Game'}
          </Button>

          {/* Risk Warning */}
          <div className="text-xs text-gray-500 text-center">
            ⚠️ Gambling involves risk. Play responsibly.
          </div>
        </div>
      )}

      {/* Game In Progress */}
      {gameState.phase === 'playing' && (
        <div className="text-center space-y-4">
          <div className="text-lg text-green-400">Game in Progress...</div>
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-400">Current Bet</div>
            <div className="text-xl font-bold text-yellow-400">
              ${gameState.currentBet.toLocaleString()}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Click tiles on the grid to play!<br />
            Cash out anytime to secure winnings.
          </div>
        </div>
      )}

      {/* Game Over */}
      {(gameState.phase === 'gameOver' || gameState.phase === 'won') && (
        <div className="text-center space-y-4">
          <div className={`text-lg font-bold ${
            gameState.phase === 'won' ? 'text-green-400' : 'text-red-400'
          }`}>
            {gameState.phase === 'won' ? '🎉 You Won!' : '💥 Game Over'}
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="text-sm text-gray-400">
              {gameState.phase === 'won' ? 'Winnings' : 'Lost'}
            </div>
            <div className={`text-xl font-bold ${
              gameState.phase === 'won' ? 'text-green-400' : 'text-red-400'
            }`}>
              {gameState.phase === 'won' ? '+' : '-'}$
              {gameState.phase === 'won' 
                ? Math.floor(gameState.currentBet * gameState.currentMultiplier).toLocaleString()
                : gameState.currentBet.toLocaleString()
              }
            </div>
          </div>
        </div>
      )}

      {/* Betting Tips */}
      {gameState.phase === 'idle' && (
        <div className="mt-6 pt-4 border-t border-slate-600">
          <div className="text-sm text-gray-400 text-center">
            <div className="font-semibold mb-2">💡 Pro Tips:</div>
            <div className="space-y-1 text-xs">
              <div>• Start with smaller bets to learn</div>
              <div>• Easy mode = safer, lower rewards</div>
              <div>• Hard mode = risky, higher rewards</div>
              <div>• Cash out early to secure profits</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}