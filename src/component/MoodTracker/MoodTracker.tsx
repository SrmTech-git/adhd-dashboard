'use client'
import React from 'react';
import { Heart } from 'lucide-react';
import { MoodEntry } from '@/types/dashboard';

interface MoodTrackerProps {
  moods: MoodEntry[];
  setMoods: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
  currentTheme: any;
  isDarkMode: boolean;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({
  moods,
  setMoods,
  currentTheme,
  isDarkMode
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayMood = moods.find(mood => mood.date === today);

  const moodOptions = [
    { rating: 1 as const, emoji: '😞', label: 'Bad', color: '#EF4444' },
    { rating: 2 as const, emoji: '😕', label: 'Poor', color: '#F59E0B' },
    { rating: 3 as const, emoji: '😐', label: 'Meh', color: '#6B7280' },
    { rating: 4 as const, emoji: '🙂', label: 'Good', color: '#10B981' },
    { rating: 5 as const, emoji: '😊', label: 'Great', color: '#8B5CF6' }
  ];

  const handleMoodSelect = (rating: 1 | 2 | 3 | 4 | 5) => {
    const newMoodEntry: MoodEntry = {
      date: today,
      rating,
      timestamp: new Date().toISOString()
    };

    if (todayMood) {
      // Update existing mood for today
      setMoods(moods.map(mood =>
        mood.date === today ? newMoodEntry : mood
      ));
    } else {
      // Add new mood entry
      setMoods([...moods, newMoodEntry]);
    }
  };

  return (
    <section style={{
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '400px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <Heart size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Mood Tracker</h2>
        {todayMood && (
          <span style={{
            fontSize: '1.5rem',
            marginLeft: '0.5rem'
          }}>
            {moodOptions.find(m => m.rating === todayMood.rating)?.emoji}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {!todayMood ? (
          <>
            <h3 style={{
              color: currentTheme.textPrimary,
              fontSize: '1.1rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              How are you feeling today?
            </h3>

            {/* Mood Options */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '100%'
            }}>
              {moodOptions.map((mood) => (
                <button
                  key={mood.rating}
                  onClick={() => handleMoodSelect(mood.rating)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 0.5rem',
                    minWidth: '60px',
                    maxWidth: '80px',
                    flex: '1 1 auto',
                    background: currentTheme.backgroundMuted,
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '0.75rem',
                    color: currentTheme.textSecondary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = mood.color + '20';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.backgroundMuted;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{mood.emoji}</span>
                  <span style={{ fontWeight: '500' }}>{mood.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            color: currentTheme.textPrimary
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {moodOptions.find(m => m.rating === todayMood.rating)?.emoji}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Feeling {moodOptions.find(m => m.rating === todayMood.rating)?.label}
            </h3>
            <p style={{
              color: currentTheme.textSecondary,
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Mood logged for today!
            </p>
            <button
              onClick={() => setMoods(moods.filter(mood => mood.date !== today))}
              style={{
                padding: '0.5rem 1rem',
                background: 'none',
                border: `1px solid ${currentTheme.textMuted}`,
                borderRadius: '0.5rem',
                color: currentTheme.textSecondary,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Change Mood
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {moods.length > 0 && (
        <div style={{
          borderTop: `1px solid ${currentTheme.borderColor}`,
          paddingTop: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
            color: currentTheme.textSecondary
          }}>
            <span>
              {moods.length} {moods.length === 1 ? 'entry' : 'entries'} logged
            </span>
            {moods.length > 1 && (
              <span>
                Avg: {moodOptions.find(m => m.rating === Math.round(
                  moods.reduce((sum, mood) => sum + mood.rating, 0) / moods.length
                ))?.emoji}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default MoodTracker;