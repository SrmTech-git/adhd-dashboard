// src/types/dashboard.ts

export interface DailyRoutineItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoItem {
  id: number;
  text: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export interface Event {
  id: number;
  date: string; // ISO date string like "2024-01-15"
  time: string; // Like "10:00 AM"
  title: string;
  color: string; // Hex color like "#4F46E5"
}

export interface Reminder {
  id: number;
  text: string;
  time: string | null; // "14:00" format or null for interval reminders
  frequency: 'once' | 'daily' | 'interval-1' | 'interval-2' | 'interval-3';
  enabled: boolean;
  lastShown: string | null; // ISO date string or null
}

export interface Notification {
  id: number;
  title: string;
  message: string;
}

export interface DashboardData {
  dailyRoutine: DailyRoutineItem[];
  todos: TodoItem[];
  events: Event[];
  reminders: Reminder[];
  lastResetDate: string;
  soundEnabled: boolean;
  isDarkMode: boolean;
  lastUpdated: string;
}