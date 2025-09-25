// src/components/Timer/Timer.tsx
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { showNotification } from '@/utils/notificationHelpers';
import type { Notification } from '@/types/dashboard';

interface TimerProps {
  currentTheme: any;
  setActiveNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const Timer: React.FC<TimerProps> = ({
  currentTheme,
  setActiveNotifications,
  soundEnabled,
  setSoundEnabled
}) => {
  // Timer states
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);

  // Sound system - Simple HTML5 Audio
  const timerSound = useRef<HTMLAudioElement | null>(null);

  // Initialize timer completion sound
  useEffect(() => {
    try {
      // Simple HTML5 Audio - we'll need an actual audio file for this to work
      // For now, we'll create the audio element but it won't work until we add a file
      timerSound.current = new Audio('/sounds/timer-complete.mp3');
      timerSound.current.volume = 0.6;
    } catch (error) {
      console.log('Audio initialization failed, continuing without sound:', error);
      timerSound.current = null;
    }
  }, []);

  // Play timer completion sound
  const playTimerSound = () => {
    if (!soundEnabled || !timerSound.current) return;
    
    try {
      // Reset audio to beginning and play
      timerSound.current.currentTime = 0;
      timerSound.current.play().catch(e => {
        // Graceful fallback - don't break if sound fails
        console.log('Timer sound could not play (file may not exist):', e);
      });
    } catch (error) {
      console.log('Timer sound error:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setIsTimerRunning(false);
          playTimerSound(); // Play completion sound
          const notification = showNotification('Timer finished!', 'Time for a break! Great job focusing! 🎉');
          setActiveNotifications(prev => [...prev, notification]);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerMinutes, timerSeconds, setActiveNotifications]);

  // Timer controls
  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(selectedDuration);
    setTimerSeconds(0);
  };

  const setQuickTimer = (minutes: number) => {
    setSelectedDuration(minutes);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  return (
    <section style={{
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <Clock size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Focus Timer</h2>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: 'none',
            border: 'none',
            color: soundEnabled ? currentTheme.primary : currentTheme.textMuted,
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem'
          }}
          title={soundEnabled ? 'Sound enabled' : 'Sound disabled'}
        >
          {soundEnabled ? '🔊' : '🔇'} Sound
        </button>
      </div>
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <span style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: currentTheme.textPrimary,
          fontVariantNumeric: 'tabular-nums'
        }}>
          {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
        </span>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {!isTimerRunning ? (
          <button onClick={startTimer} style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            background: currentTheme.success
          }}>
            <Play size={20} />
          </button>
        ) : (
          <button onClick={pauseTimer} style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            background: currentTheme.warning
          }}>
            <Pause size={20} />
          </button>
        )}
        <button onClick={resetTimer} style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          background: currentTheme.textSecondary
        }}>
          <RotateCcw size={20} />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        {[5, 15, 25, 45].map(minutes => (
          <button 
            key={minutes}
            onClick={() => setQuickTimer(minutes)} 
            style={{
              padding: '0.5rem 1rem',
              background: currentTheme.backgroundMuted,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: currentTheme.textPrimary
            }}
          >
            {minutes}m
          </button>
        ))}
      </div>
    </section>
  );
};

export default Timer;