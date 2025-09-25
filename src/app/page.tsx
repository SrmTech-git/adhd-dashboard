'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, CheckSquare, Square, Plus, X, Play, Pause, RotateCcw, Star, ChevronLeft, ChevronRight, Edit2, Save, Bell, BellOff, Clock3, Coffee } from 'lucide-react';
import { DataService } from '@/lib/dataService';
import { theme, getPriorityColor } from '@/lib/theme';
import { DailyRoutineItem, TodoItem, Event, Reminder, DashboardData } from '@/types/dashboard';
import type { Notification } from '@/types/dashboard';
import { getDefaultDailyRoutine, getDefaultTodos, getDefaultEvents, getDefaultReminders } from '@/utils/defaultData';
import { monthNames, getDaysInMonth, getFirstDayOfMonth, generateCalendarDays, isToday, formatDateForDisplay, formatTo12Hour } from '@/utils/dateHelpers';
import { showNotification, dismissNotification, snoozeNotification, requestNotificationPermission }
from '@/utils/notificationHelpers';
import { soundService, SoundType } from '@/lib/soundService';
import CalendarComponent from '@/component/Calendar/Calendar';
import Timer from '@/component/Timer/Timer';
import TodaysSchedule from '@/component/Schedule/TodaysSchedule';
import DailyRoutine from '@/component/DailyRoutine/DailyRoutine';
import TodoList from '@/component/TodoList/TodoList';
import Reminders from '@/component/Reminders/Reminders';

const ADHDDashboard = () => {
  // Get current date for display
  const today = new Date();
  const todayString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // State for save indicator
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // State initialization flag to prevent saving during initial load
  const [isInitialized, setIsInitialized] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Daily routine tasks that reset each day
  const [dailyRoutine, setDailyRoutine] = useState<DailyRoutineItem[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);

  // Dynamic to-do list
const [todos, setTodos] = useState<TodoItem[]>([]);

  // Calendar events
const [events, setEvents] = useState<Event[]>([]);

  // Reminders state
const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderText, setNewReminderText] = useState('');
const [newReminderTime, setNewReminderTime] = useState<string>('');
  const [newReminderFrequency, setNewReminderFrequency] = useState('once');
const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);
  const lastReminderCheck = useRef<number | null>(null);


  // Theme system
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Form states for adding new items
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [audioReady, setAudioReady] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  

  // Check browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);


  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = DataService.loadUserData();
    const todayKey = DataService.getTodayKey();
    
    if (savedData) {
      // Load todos, events, reminders, and preferences
      setTodos(savedData.todos || []);
      setEvents(savedData.events || []);
      setReminders(savedData.reminders || getDefaultReminders());
      setSoundEnabled(savedData.soundEnabled !== undefined ? savedData.soundEnabled : true);
      setSoundVolume(savedData.soundVolume !== undefined ? savedData.soundVolume : 0.7);
      setIsDarkMode(savedData.isDarkMode !== undefined ? savedData.isDarkMode : false);
      
      // Handle daily routine reset
      if (savedData.lastResetDate !== todayKey && savedData.dailyRoutine) {
        // It's a new day - reset completion status but keep the items
        const resetRoutine = savedData.dailyRoutine.map((item: DailyRoutineItem) => ({
          ...item,
          completed: false
        }));
        setDailyRoutine(resetRoutine);
        setLastResetDate(todayKey);
      } else {
        setDailyRoutine(savedData.dailyRoutine || getDefaultDailyRoutine());
        setLastResetDate(savedData.lastResetDate || todayKey);
      }
    } else {
      // First time user - set defaults
      setDailyRoutine(getDefaultDailyRoutine());
      setTodos(getDefaultTodos());
      setEvents(getDefaultEvents());
      setReminders(getDefaultReminders());
      setLastResetDate(todayKey);
    }
    
    // Mark as initialized after loading
    setIsInitialized(true);
  }, []);


  // Save data whenever state changes (but only after initial load)
  useEffect(() => {
    // Only save after initialization to prevent saving during initial load
    if (isInitialized) {
      const dataToSave = {
        dailyRoutine,
        todos,
        events,
        reminders,
        lastResetDate,
        soundEnabled,
        soundVolume,
        isDarkMode,
        lastUpdated: new Date().toISOString()
      };
      
      if (DataService.saveUserData(dataToSave)) {
        // Show save indicator
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 1500);
      }
    }
  }, [dailyRoutine, todos, events, reminders, lastResetDate, soundEnabled, soundVolume, isDarkMode, isInitialized]);

  // Update sound service when sound preferences change
  useEffect(() => {
    soundService.setEnabled(soundEnabled);
    soundService.setGlobalVolume(soundVolume);
  }, [soundEnabled, soundVolume]);

  // Handle user interaction for audio context
  useEffect(() => {
    const enableAudio = async () => {
      if (soundEnabled) {
        try {
          await soundService.requestAudioPermission();
          console.log('Audio context enabled for dashboard');
        } catch (error) {
          console.warn('Failed to enable audio context:', error);
        }
      }
    };

    // Enable audio on first user interaction
    const handleInteraction = async () => {
      await enableAudio();
      setAudioReady(true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    if (soundEnabled) {
      document.addEventListener('click', handleInteraction, { once: true });
      document.addEventListener('keydown', handleInteraction, { once: true });
      document.addEventListener('touchstart', handleInteraction, { once: true });
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [soundEnabled]);



  // Get today's events
  const todaysEvents = events
    .filter(event => event.date === today.toISOString().split('T')[0])
    .sort((a, b) => a.time.localeCompare(b.time));

  // Get selected date events
  const selectedDateEvents = selectedDate 
    ? events.filter(event => event.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
    : [];

  // Check for due reminders and upcoming events
  useEffect(() => {
    const checkRemindersAndEvents = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayKey = DataService.getTodayKey();

      // Check reminders
      reminders.forEach(reminder => {
        if (!reminder.enabled) return;

        let shouldShow = false;

        if (reminder.frequency === 'once' || reminder.frequency === 'daily') {
          // Time-based reminders
          if (reminder.time === currentTime) {
            // Check if already shown today for daily reminders
            if (reminder.frequency === 'daily') {
              if (reminder.lastShown !== todayKey) {
                shouldShow = true;
              }
            } else if (reminder.frequency === 'once') {
              if (!reminder.lastShown) {
                shouldShow = true;
              }
            }
          }
        } else if (reminder.frequency.startsWith('interval-')) {
          // Interval-based reminders
          const hours = parseInt(reminder.frequency.split('-')[1]);
          if (!reminder.lastShown) {
            shouldShow = true;
          } else {
            const lastShownTime = new Date(reminder.lastShown);
            const hoursSinceLastShown = (now.getTime() - lastShownTime.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastShown >= hours) {
              shouldShow = true;
            }
          }
        }

        if (shouldShow) {
          const notification = showNotification(reminder.text, 'Gentle reminder 💜');
          setActiveNotifications(prev => [...prev, notification]);

          // Play gentle reminder sound
          if (soundEnabled) {
            soundService.play(SoundType.REMINDER_GENTLE);
          }

          // Update lastShown
          const updatedReminders = reminders.map(r =>
            r.id === reminder.id
              ? { ...r, lastShown: reminder.frequency === 'daily' ? todayKey : now.toISOString() }
              : r
          );
          setReminders(updatedReminders);
        }
      });

      // Check for upcoming events (15 minutes warning)
      const upcomingTime = new Date(now.getTime() + 15 * 60000);
      const upcomingTimeString = `${String(upcomingTime.getHours()).padStart(2, '0')}:${String(upcomingTime.getMinutes()).padStart(2, '0')}`;
      
      // Convert to 12-hour format for comparison
      const formatTo12Hour = (time24: string) => {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${hour12}:${minutes} ${ampm}`;
      };
      
      const upcoming12Hour = formatTo12Hour(upcomingTimeString);
      
      // Check today's events
      todaysEvents.forEach(event => {
        if (event.time === upcoming12Hour) {
          // Check if we haven't alerted for this event yet today
          const alertKey = `event-alert-${event.id}-${todayKey}`;
          const alertShown = localStorage.getItem(alertKey);
          
          if (!alertShown) {
            const notification = showNotification(
              `${event.title} in 15 minutes!`,
              'Upcoming Event 📅'
            );
            setActiveNotifications(prev => [...prev, notification]);
            localStorage.setItem(alertKey, 'true');

            // Play event warning sound
            if (soundEnabled) {
              soundService.play(SoundType.EVENT_WARNING);
            }
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkRemindersAndEvents, 60000);
    
    // Check immediately on load
    checkRemindersAndEvents();

    return () => clearInterval(interval);
  }, [reminders, todaysEvents]);


  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateString = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
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

  // Add or update event
  const saveEvent = () => {
    if (!newEventTime || !newEventTitle.trim()) return;

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, time: newEventTime, title: newEventTitle }
          : event
      ));
    } else {
      // Add new event
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      setEvents([...events, {
        id: newId,
        date: selectedDate!,
        time: newEventTime,
        title: newEventTitle,
        color: randomColor
      }]);
    }

    // Reset form
    setNewEventTime('');
    setNewEventTitle('');
    setEditingEvent(null);
  };

  // Start editing an event
  const startEditingEvent = (event: Event) => {

    setEditingEvent(event);
    setNewEventTime(event.time);
    setNewEventTitle(event.title);
  };

  // Remove event
  const removeEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    if (editingEvent && editingEvent.id === id) {
      setEditingEvent(null);
      setNewEventTime('');
      setNewEventTitle('');
    }
  };

  // Add or update reminder
  const saveReminder = () => {
    if (!newReminderText.trim()) return;
    
    if (newReminderFrequency === 'once' || newReminderFrequency === 'daily') {
      if (!newReminderTime) return;
    }

    if (editingReminder) {
      // Update existing reminder
      setReminders(reminders.map((reminder): Reminder => 
        reminder.id === editingReminder.id 
          ? {
              ...reminder,
              text: newReminderText,
              time: (newReminderFrequency === 'once' || newReminderFrequency === 'daily') ? newReminderTime : null,
              frequency: newReminderFrequency as Reminder['frequency'],              lastShown: null // Reset so the updated reminder can trigger again
            }
          : reminder
      ));
    } else {
      // Add new reminder
      const newId = reminders.length > 0 ? Math.max(...reminders.map(r => r.id)) + 1 : 1;
      
      const newReminder: Reminder = {
        id: newId,
        text: newReminderText,
        time: (newReminderFrequency === 'once' || newReminderFrequency === 'daily') ? newReminderTime : null,
        frequency: newReminderFrequency as Reminder['frequency'],
        enabled: true,
        lastShown: null
      };
      setReminders([...reminders, newReminder]);
    }

    // Reset form
    setNewReminderText('');
    setNewReminderTime('');
    setNewReminderFrequency('once');
    setEditingReminder(null);
  };

  // Start editing a reminder
const startEditingReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setNewReminderText(reminder.text);
    setNewReminderTime(reminder.time || '');
    setNewReminderFrequency(reminder.frequency);
  };

  // Cancel editing
  const cancelEditingReminder = () => {
    setEditingReminder(null);
    setNewReminderText('');
    setNewReminderTime('');
    setNewReminderFrequency('once');
  };

  // Toggle reminder enabled/disabled
  const toggleReminder = (id: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder
    ));
  };

  // Remove reminder
  const removeReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    // Clear editing state if we're deleting the reminder being edited
    if (editingReminder && editingReminder.id === id) {
      cancelEditingReminder();
    }
  };

  // Format reminder display
const formatReminderTime = (reminder: Reminder) => {
    if (reminder.frequency === 'once' || reminder.frequency === 'daily') {
      const [hours, minutes] = reminder.time!.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      return `${displayHour}:${minutes} ${ampm}`;
    } else if (reminder.frequency.startsWith('interval-')) {
      const hours = parseInt(reminder.frequency.split('-')[1]);
      return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return '';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: currentTheme.background,
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        color: 'white',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Focus Dashboard</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{todayString}</p>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: 0,
            left: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            transition: 'all 0.2s'
          }}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'} {isDarkMode ? 'Light' : 'Dark'}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            position: 'absolute',
            top: 0,
            left: '10rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            transition: 'all 0.2s',
            opacity: soundEnabled ? 1 : 0.6
          }}
          title={
            soundEnabled
              ? (audioReady ? 'Sounds enabled and ready' : 'Sounds enabled (click anywhere to activate)')
              : 'Enable sounds'
          }
        >
          {soundEnabled ? (audioReady ? '🔊' : '🔊⚡') : '🔇'} Sound
          {soundEnabled && !audioReady && (
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
              (click to activate)
            </span>
          )}
        </button>

        {showSaveIndicator && (
          <div style={{
            position: 'absolute',
            top: 0,
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Save size={14} />
            <span>Saved</span>
          </div>
        )}
      </header>

      {/* Toast Notifications */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {activeNotifications.map(notification => (
          <div key={notification.id} style={{
            background: currentTheme.cardBackground,
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.2)',
            minWidth: '300px',
            maxWidth: '400px'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <Bell size={16} />
              <div>
                <strong style={{ display: 'block', color: currentTheme.textPrimary, marginBottom: '0.25rem' }}>
                  {notification.title}
                </strong>
                <p style={{ color: currentTheme.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                  {notification.message}
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setActiveNotifications(prev => prev.filter(n => n.id !== notification.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  background: currentTheme.backgroundMuted,
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: currentTheme.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                <Clock3 size={14} /> 10m
              </button>
              <button 
                  onClick={() => setActiveNotifications(prev => prev.filter(n => n.id !== notification.id))}                style={{
                  padding: '0.25rem 0.5rem',
                  background: 'none',
                  border: 'none',
                  color: currentTheme.textMuted,
                  cursor: 'pointer',
                  borderRadius: '0.25rem'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* Daily Routine Section */}
          <DailyRoutine
            dailyRoutine={dailyRoutine}
            setDailyRoutine={setDailyRoutine}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />

        {/* Focus Timer Section */}
          <Timer 
            currentTheme={currentTheme}
            setActiveNotifications={setActiveNotifications}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        

        {/* To-Do List Section */}
          <TodoList
            todos={todos}
            setTodos={setTodos}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />

        {/* Today's Schedule Section */}
          <TodaysSchedule
            todaysEvents={todaysEvents}
            removeEvent={removeEvent}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />


        {/* Reminders Section */}
        <Reminders
          reminders={reminders}
          setReminders={setReminders}
          currentTheme={currentTheme}
          isDarkMode={isDarkMode}
          notificationPermission={notificationPermission}
          setNotificationPermission={setNotificationPermission}
          newReminderText={newReminderText}
          setNewReminderText={setNewReminderText}
          newReminderTime={newReminderTime}
          setNewReminderTime={setNewReminderTime}
          newReminderFrequency={newReminderFrequency}
          setNewReminderFrequency={setNewReminderFrequency}
          editingReminder={editingReminder}
          setEditingReminder={setEditingReminder}
          saveReminder={saveReminder}
          startEditingReminder={startEditingReminder}
          cancelEditingReminder={cancelEditingReminder}
          toggleReminder={toggleReminder}
          removeReminder={removeReminder}
          formatReminderTime={formatReminderTime}
          soundEnabled={soundEnabled}
        />

        {/* Calendar Section - Full Width */}
        {/* Calendar Section */}
          <CalendarComponent
            events={events}
            setEvents={setEvents}
            currentTheme={currentTheme}
            isDarkMode={isDarkMode}
          />

      </div>
    </div>
  );
};

export default function Home() {
  return <ADHDDashboard />;
}