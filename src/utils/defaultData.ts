// src/utils/defaultData.ts
import { DailyRoutineItem, TodoItem, Event, Reminder } from '@/types/dashboard';

// Helper function for default daily routine
export const getDefaultDailyRoutine = (): DailyRoutineItem[] => [
  { id: 1, text: 'Brush teeth', completed: false },
  { id: 2, text: 'Take morning medication', completed: false },
  { id: 3, text: 'Feed pets', completed: false },
  { id: 4, text: 'Drink water', completed: false },
  { id: 5, text: 'Morning stretch', completed: false }
];

// Helper function for default todos
export const getDefaultTodos = (): TodoItem[] => [
  { id: 1, text: 'Review project proposal', priority: 'high', completed: false },
  { id: 2, text: 'Email team update', priority: 'medium', completed: false },
  { id: 3, text: 'Grocery shopping', priority: 'low', completed: false }
];

// Helper function for default events
export const getDefaultEvents = (): Event[] => {
  const today = new Date();
  return [
    { 
      id: 1, 
      date: today.toISOString().split('T')[0], 
      time: '10:00 AM', 
      title: 'Team meeting', 
      color: '#4F46E5' 
    },
    { 
      id: 2, 
      date: today.toISOString().split('T')[0], 
      time: '2:00 PM', 
      title: 'Doctor appointment', 
      color: '#10B981' 
    }
  ];
};

// Helper function for default reminders
export const getDefaultReminders = (): Reminder[] => [
  { 
    id: 1, 
    text: 'Take afternoon meds 💊', 
    time: '14:00', 
    frequency: 'daily', 
    enabled: true,
    lastShown: null
  },
  { 
    id: 2, 
    text: 'Did you eat lunch yet? 🍽️', 
    time: '12:30', 
    frequency: 'daily', 
    enabled: true,
    lastShown: null
  },
  { 
    id: 3, 
    text: 'Take a stretch break! 🤸', 
    time: null, 
    frequency: 'interval-2', 
    enabled: true,
    lastShown: null
  },
  { 
    id: 4, 
    text: 'Walk the dog before it gets dark! 🐕', 
    time: '16:00', 
    frequency: 'daily', 
    enabled: true,
    lastShown: null
  }
];