"use client";

import React, { useEffect, useRef } from 'react';
import { GameState } from '@/app/page';

interface AudioManagerProps {
  enabled: boolean;
  gameState: GameState;
}

export function AudioManager({ enabled, gameState }: AudioManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lastPhaseRef = useRef<string>('');
  const lastTilesRevealedRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    // Initialize Web Audio API
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = 0.3; // Set volume to 30%
      } catch (error) {
        console.warn('Web Audio API not supported');
        return;
      }
    }

    // Resume audio context if needed (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [enabled]);

  // Create sound effects using Web Audio API
  const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled || !audioContextRef.current || !gainNodeRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();

    oscillator.connect(envelope);
    envelope.connect(gainNodeRef.current);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;

    // Create envelope for smooth sound
    envelope.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    envelope.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Create complex sound effects
  const playClickSound = () => {
    createTone(800, 0.1, 'square');
  };

  const playSafeRevealSound = () => {
    createTone(600, 0.15, 'sine');
    setTimeout(() => createTone(800, 0.1, 'sine'), 50);
  };

  const playBombSound = () => {
    // Create explosion sound with multiple frequencies
    createTone(100, 0.3, 'sawtooth');
    setTimeout(() => createTone(80, 0.4, 'sawtooth'), 50);
    setTimeout(() => createTone(60, 0.5, 'sawtooth'), 100);
    setTimeout(() => createTone(40, 0.6, 'sawtooth'), 150);
  };

  const playCashOutSound = () => {
    // Happy cash out sound
    createTone(523, 0.2, 'sine'); // C5
    setTimeout(() => createTone(659, 0.2, 'sine'), 100); // E5
    setTimeout(() => createTone(784, 0.3, 'sine'), 200); // G5
  };

  const playGameStartSound = () => {
    createTone(440, 0.15, 'sine'); // A4
    setTimeout(() => createTone(554, 0.15, 'sine'), 100); // C#5
  };

  const playBackgroundAmbience = () => {
    if (!enabled || !audioContextRef.current || !gainNodeRef.current) return;

    // Create subtle background ambience
    const oscillator1 = audioContextRef.current.createOscillator();
    const oscillator2 = audioContextRef.current.createOscillator();
    const filter = audioContextRef.current.createBiquadFilter();
    const ambienceGain = audioContextRef.current.createGain();

    oscillator1.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
    oscillator2.frequency.setValueAtTime(120, audioContextRef.current.currentTime);
    
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'sine';

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContextRef.current.currentTime);

    ambienceGain.gain.setValueAtTime(0.05, audioContextRef.current.currentTime);

    oscillator1.connect(filter);
    oscillator2.connect(filter);
    filter.connect(ambienceGain);
    ambienceGain.connect(gainNodeRef.current);

    oscillator1.start();
    oscillator2.start();

    // Stop ambience after 2 seconds
    setTimeout(() => {
      oscillator1.stop();
      oscillator2.stop();
    }, 2000);
  };

  // React to game state changes
  useEffect(() => {
    if (!enabled) return;

    // Game started
    if (lastPhaseRef.current === 'idle' && gameState.phase === 'playing') {
      playGameStartSound();
      playBackgroundAmbience();
    }

    // Tile revealed (safe)
    if (
      gameState.phase === 'playing' && 
      gameState.tilesRevealed > lastTilesRevealedRef.current &&
      lastTilesRevealedRef.current >= 0
    ) {
      playSafeRevealSound();
    }

    // Game over (bomb hit)
    if (lastPhaseRef.current === 'playing' && gameState.phase === 'gameOver') {
      playBombSound();
    }

    // Won or cashed out
    if (lastPhaseRef.current === 'playing' && gameState.phase === 'won') {
      playCashOutSound();
    }

    // Update refs
    lastPhaseRef.current = gameState.phase;
    lastTilesRevealedRef.current = gameState.tilesRevealed;
  }, [gameState.phase, gameState.tilesRevealed, enabled]);

  // Handle click sounds for tiles
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest('button') && gameState.phase === 'playing') {
        playClickSound();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enabled, gameState.phase]);

  // Create pulsing visual feedback when audio is enabled
  return enabled ? (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs animate-pulse">
        🔊 Audio ON
      </div>
    </div>
  ) : null;
}