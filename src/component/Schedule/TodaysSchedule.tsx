// src/components/Schedule/TodaysSchedule.tsx
'use client'
import React from 'react';
import { Clock, X } from 'lucide-react';
import { Event } from '@/types/dashboard';

interface TodaysScheduleProps {
  todaysEvents: Event[];
  removeEvent: (id: number) => void;
  currentTheme: any;
  isDarkMode: boolean;
}

const TodaysSchedule: React.FC<TodaysScheduleProps> = ({
  todaysEvents,
  removeEvent,
  currentTheme,
  isDarkMode
}) => {
  return (
    <section style={{
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '400px' // Fixed height
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <Clock size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Today's Schedule</h2>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: 1,
        overflowY: 'auto',
        minHeight: 0 // Important for flex child scrolling
      }}>
        {todaysEvents.length > 0 ? (
          todaysEvents.map(event => (
            <div key={event.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem',
              background: currentTheme.backgroundMuted,
              borderRadius: '0.5rem'
            }}>
              <div style={{
                width: '0.5rem',
                height: '2rem',
                borderRadius: '0.25rem',
                backgroundColor: event.color
              }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', color: currentTheme.textSecondary }}>{event.time}</span>
                <span style={{ fontWeight: 500, color: currentTheme.textPrimary }}>{event.title}</span>
              </div>
              <button onClick={() => removeEvent(event.id)} style={{
                background: 'none',
                border: 'none',
                color: currentTheme.textMuted,
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '0.25rem'
              }}>
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          <p style={{ color: currentTheme.textMuted, textAlign: 'center', padding: '2rem' }}>
            No events scheduled for today
          </p>
        )}
      </div>
    </section>
  );
};

export default TodaysSchedule;