// src/components/Calendar/Calendar.tsx
'use client'
import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { Event, MoodEntry } from '@/types/dashboard';
import { monthNames, generateCalendarDays, isToday, formatDateForDisplay } from '@/utils/dateHelpers';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import GoogleCalendarConnection from '@/component/GoogleCalendar/GoogleCalendarConnection';

interface CalendarProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  moods: MoodEntry[];
  currentTheme: any;
  isDarkMode: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  events,
  setEvents,
  moods,
  currentTheme,
  isDarkMode
}) => {
  // Calendar state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');

  // Google Calendar integration
  const { events: googleEvents } = useGoogleCalendar();

  // Merge local and Google events
  const allEvents = useMemo(() => {
    const localEventsWithSource = events.map(event => ({
      ...event,
      source: 'local' as const
    }));

    return [...localEventsWithSource, ...googleEvents]
      .sort((a, b) => {
        // Sort by date first, then by time
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;

        // Handle "All day" events - put them first
        if (a.time === 'All day' && b.time !== 'All day') return -1;
        if (b.time === 'All day' && a.time !== 'All day') return 1;
        if (a.time === 'All day' && b.time === 'All day') return 0;

        return a.time.localeCompare(b.time);
      });
  }, [events, googleEvents]);

  // Get selected date events (both local and Google)
  const selectedDateEvents = selectedDate
    ? allEvents.filter(event => event.date === selectedDate)
    : [];

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return allEvents.filter(event => event.date === dateString);
  };

  const getMoodForDate = (day: number | null) => {
    if (!day) return null;
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return moods.find(mood => mood.date === dateString);
  };

  const getMoodEmoji = (rating: 1 | 2 | 3 | 4 | 5) => {
    const moodMap = {
      1: '😞',
      2: '😕',
      3: '😐',
      4: '🙂',
      5: '😊'
    };
    return moodMap[rating];
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    setSelectedDate(dateString);
    setShowEventModal(true);
    setEditingEvent(null);
    setNewEventTime('');
    setNewEventTitle('');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  // Add or update event (only for local events)
  const saveEvent = () => {
    if (!newEventTime || !newEventTitle.trim()) return;

    if (editingEvent) {
      // Only allow editing local events
      if (editingEvent.source === 'local') {
        setEvents(events.map(event =>
          event.id === editingEvent.id
            ? { ...event, time: newEventTime, title: newEventTitle }
            : event
        ));
      }
    } else {
      // Add new event (always local)
      const newId = allEvents.length > 0 ? Math.max(...allEvents.map(e => e.id)) + 1 : 1;
      const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      setEvents([...events, {
        id: newId,
        date: selectedDate!,
        time: newEventTime,
        title: newEventTitle,
        color: randomColor,
        source: 'local'
      }]);
    }

    // Reset form
    setNewEventTime('');
    setNewEventTitle('');
    setEditingEvent(null);
  };

  // Start editing an event (only local events)
  const startEditingEvent = (event: Event) => {
    if (event.source === 'local') {
      setEditingEvent(event);
      setNewEventTime(event.time);
      setNewEventTitle(event.title);
    }
  };

  // Remove event (only local events)
  const removeEvent = (id: number) => {
    const eventToRemove = allEvents.find(e => e.id === id);
    if (eventToRemove?.source === 'local') {
      setEvents(events.filter(event => event.id !== id));
      if (editingEvent && editingEvent.id === id) {
        setEditingEvent(null);
        setNewEventTime('');
        setNewEventTitle('');
      }
    }
  };

  return (
    <section style={{
      gridColumn: '1 / -1',
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Google Calendar Connection */}
      <GoogleCalendarConnection
        currentTheme={currentTheme}
        isDarkMode={isDarkMode}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <CalendarIcon size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Calendar</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigateMonth('prev')} style={{
            background: 'none',
            border: 'none',
            color: currentTheme.textSecondary,
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem'
          }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 600, minWidth: '150px', textAlign: 'center' }}>
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={() => navigateMonth('next')} style={{
            background: 'none',
            border: 'none',
            color: currentTheme.textSecondary,
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem'
          }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        background: currentTheme.border,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            background: currentTheme.backgroundMuted,
            padding: '0.75rem',
            textAlign: 'center',
            fontWeight: 600,
            color: currentTheme.textSecondary,
            fontSize: '0.875rem'
          }}>
            {day}
          </div>
        ))}
        
        {generateCalendarDays(currentMonth, currentYear).map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const dayMood = getMoodForDate(day);
          return (
            <div
              key={index}
              style={{
                background: isToday(day, currentMonth, currentYear) ? currentTheme.backgroundHover : currentTheme.cardBackground,
                minHeight: '100px',
                padding: '0.5rem',
                position: 'relative',
                cursor: day ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
              onClick={() => handleDateClick(day)}
            >
              {day && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: isToday(day, currentMonth, currentYear) ? currentTheme.primary : currentTheme.textPrimary,
                      fontWeight: isToday(day, currentMonth, currentYear) ? 'bold' : 500
                    }}>
                      {day}
                    </span>
                    {dayMood && (
                      <span style={{
                        fontSize: '0.75rem',
                        lineHeight: 1
                      }}>
                        {getMoodEmoji(dayMood.rating)}
                      </span>
                    )}
                  </div>
                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
                      {dayEvents.length <= 2 ? (
                        dayEvents.map((event, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.125rem 0.25rem',
                              borderRadius: '0.125rem',
                              color: 'white',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              backgroundColor: event.color,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <span style={{ flex: 1 }}>{event.title}</span>
                            {event.source === 'google' && (
                              <span style={{
                                fontSize: '0.6rem',
                                opacity: 0.8,
                                fontWeight: 'bold'
                              }}>G</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.125rem 0.25rem',
                              borderRadius: '0.125rem',
                              color: 'white',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              backgroundColor: dayEvents[0].color,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <span style={{ flex: 1 }}>{dayEvents[0].title}</span>
                            {dayEvents[0].source === 'google' && (
                              <span style={{
                                fontSize: '0.6rem',
                                opacity: 0.8,
                                fontWeight: 'bold'
                              }}>G</span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: currentTheme.textSecondary,
                            padding: '0.125rem 0.25rem'
                          }}>
                            +{dayEvents.length - 1} more
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: currentTheme.cardBackground,
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              borderBottom: `1px solid ${currentTheme.border}`
            }}>
              <h3 style={{ margin: 0, color: currentTheme.textPrimary }}>
                Events for {selectedDate && formatDateForDisplay(selectedDate)}
              </h3>
              <button 
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedDate(null);
                  setEditingEvent(null);
                  setNewEventTime('');
                  setNewEventTitle('');
                }} 
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentTheme.textSecondary,
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '0.25rem'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* List existing events */}
            {selectedDateEvents.length > 0 && (
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedDateEvents.map(event => (
                  <div key={event.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    background: currentTheme.backgroundMuted,
                    borderRadius: '0.5rem',
                    border: event.source === 'google' ? '1px solid rgba(66, 133, 244, 0.3)' : 'none'
                  }}>
                    <div style={{
                      width: '4px',
                      height: '40px',
                      borderRadius: '2px',
                      backgroundColor: event.color
                    }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: currentTheme.textSecondary }}>{event.time}</span>
                        {event.source === 'google' && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#4285F4',
                            background: 'rgba(66, 133, 244, 0.1)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.75rem',
                            fontWeight: '500'
                          }}>
                            Google
                          </span>
                        )}
                      </div>
                      <span style={{ fontWeight: 500, color: currentTheme.textPrimary }}>{event.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {event.source === 'local' && (
                        <>
                          <button
                            onClick={() => startEditingEvent(event)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: currentTheme.primary,
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '0.25rem'
                            }}
                            title="Edit event"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => removeEvent(event.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: currentTheme.textMuted,
                              cursor: 'pointer',
                              padding: '0.25rem',
                              borderRadius: '0.25rem'
                            }}
                            title="Delete event"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {event.source === 'google' && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: currentTheme.textMuted,
                          padding: '0.5rem',
                          fontStyle: 'italic'
                        }}>
                          Read-only
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit event form */}
            <div style={{ padding: '1.5rem', borderTop: `1px solid ${currentTheme.border}` }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: currentTheme.textPrimary }}>
                {editingEvent ? 'Edit Local Event' : 'Add New Local Event'}
              </h4>
              {!editingEvent && (
                <p style={{
                  fontSize: '0.875rem',
                  color: currentTheme.textSecondary,
                  margin: '0 0 1rem 0',
                  lineHeight: '1.4'
                }}>
                  Local events can be edited and deleted. Google Calendar events are read-only.
                </p>
              )}
              <input
                type="text"
                placeholder="Time (e.g., 3:00 PM)"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '0.5rem',
                  outline: 'none',
                  background: currentTheme.cardBackground,
                  color: currentTheme.textPrimary
                }}
              />
              <input
                type="text"
                placeholder="Event title..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveEvent()}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '0.5rem',
                  outline: 'none',
                  background: currentTheme.cardBackground,
                  color: currentTheme.textPrimary
                }}
              />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={saveEvent} style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}>
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
                {editingEvent && (
                  <button 
                    onClick={() => {
                      setEditingEvent(null);
                      setNewEventTime('');
                      setNewEventTitle('');
                    }} 
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: currentTheme.backgroundMuted,
                      color: currentTheme.textSecondary,
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;