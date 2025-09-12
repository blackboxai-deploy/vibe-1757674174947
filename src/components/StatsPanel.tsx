"use client";

import React from 'react';
import { PlayerStats, GameState } from '@/app/page';

interface StatsPanelProps {
  stats: PlayerStats;
  gameState: GameState;
}

export function StatsPanel({ stats, gameState }: StatsPanelProps) {
  const winRate = stats.gamesPlayed > 0 ? ((stats.totalWins / stats.gamesPlayed) * 100) : 0;
  const netProfit = stats.totalWinAmount - stats.totalBetAmount;
  const avgWin = stats.totalWins > 0 ? (stats.totalWinAmount / stats.totalWins) : 0;

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600 shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-400">📊 Statistics</h2>
      
      {/* Current Game Status */}
      {gameState.phase === 'playing' && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">Current Game</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-blue-200">Bet Amount</div>
              <div className="text-white font-bold">${gameState.currentBet}</div>
            </div>
            <div>
              <div className="text-blue-200">Multiplier</div>
              <div className="text-white font-bold">{gameState.currentMultiplier}x</div>
            </div>
            <div>
              <div className="text-blue-200">Tiles Revealed</div>
              <div className="text-white font-bold">{gameState.tilesRevealed}</div>
            </div>
            <div>
              <div className="text-blue-200">Potential Win</div>
              <div className="text-white font-bold">
                ${Math.floor(gameState.currentBet * gameState.currentMultiplier)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Games Played */}
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>

          {/* Win Rate */}
          <div className="bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
        </div>

        {/* Wins vs Losses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-600 bg-opacity-20 rounded-lg p-3 text-center border border-green-600">
            <div className="text-xl font-bold text-green-400">{stats.totalWins}</div>
            <div className="text-xs text-green-300">Wins</div>
          </div>
          <div className="bg-red-600 bg-opacity-20 rounded-lg p-3 text-center border border-red-600">
            <div className="text-xl font-bold text-red-400">{stats.totalLosses}</div>
            <div className="text-xs text-red-300">Losses</div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Net Profit</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Wagered</span>
              <span className="text-white font-bold">${stats.totalBetAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Won</span>
              <span className="text-green-400 font-bold">${stats.totalWinAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Avg Win</span>
              <span className="text-blue-400 font-bold">${avgWin.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-opacity-20 rounded-lg p-3 border border-yellow-500">
            <div className="flex justify-between items-center">
              <span className="text-yellow-300 text-sm">Best Multiplier</span>
              <span className="text-yellow-400 font-bold">{stats.bestMultiplier.toFixed(2)}x</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 bg-opacity-20 rounded-lg p-3 border border-purple-500">
            <div className="flex justify-between items-center">
              <span className="text-purple-300 text-sm">Current Streak</span>
              <span className="text-purple-400 font-bold">{stats.currentStreak}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-opacity-20 rounded-lg p-3 border border-indigo-500">
            <div className="flex justify-between items-center">
              <span className="text-indigo-300 text-sm">Longest Streak</span>
              <span className="text-indigo-400 font-bold">{stats.longestStreak}</span>
            </div>
          </div>
        </div>

        {/* Visual Win Rate Bar */}
        <div className="bg-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Win Rate Progress</span>
            <span className="text-gray-300 text-sm">{winRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(winRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Achievement Badges */}
        {stats.gamesPlayed > 0 && (
          <div className="pt-4 border-t border-slate-600">
            <div className="text-sm text-gray-400 mb-3">🏆 Achievements</div>
            <div className="flex flex-wrap gap-2">
              {stats.gamesPlayed >= 10 && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  🎮 Player
                </span>
              )}
              {stats.totalWins >= 5 && (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                  🏆 Winner
                </span>
              )}
              {stats.currentStreak >= 3 && (
                <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                  🔥 Hot Streak
                </span>
              )}
              {stats.bestMultiplier >= 5 && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                  💎 High Roller
                </span>
              )}
              {netProfit > 1000 && (
                <span className="bg-emerald-600 text-white px-2 py-1 rounded text-xs">
                  💰 Profitable
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tips for new players */}
        {stats.gamesPlayed < 5 && (
          <div className="pt-4 border-t border-slate-600">
            <div className="text-sm text-gray-400 text-center">
              <div className="mb-2">🎯 New Player Tips:</div>
              <div className="text-xs space-y-1">
                <div>• Start with small bets ($10-50)</div>
                <div>• Learn the patterns on easy mode</div>
                <div>• Don't chase losses</div>
                <div>• Cash out when ahead!</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}