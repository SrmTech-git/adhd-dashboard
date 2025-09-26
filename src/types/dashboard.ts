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
  source?: 'local' | 'google'; // Track event source
  googleEventId?: string; // Original Google event ID for reference
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

export interface MoodEntry {
  date: string; // ISO date string like "2024-01-15"
  rating: 1 | 2 | 3 | 4 | 5; // Bad, Poor, Meh, Good, Great
  timestamp: string; // ISO timestamp when mood was recorded
}

export interface DailyRoutineHistory {
  date: string; // ISO date string like "2024-01-15"
  tasks: DailyRoutineItem[];
  completionRate: number; // 0-1 decimal (e.g., 0.6 = 60%)
  completedCount: number;
  totalCount: number;
}

export interface TodoCompletion {
  id: number;
  text: string;
  priority: 'low' | 'medium' | 'high';
  completedAt: string; // ISO timestamp when completed
  completedDate: string; // ISO date string like "2024-01-15"
}

// Google Calendar Integration Types
export interface GoogleCalendarAuth {
  isConnected: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  userEmail: string | null;
  lastSync: string | null; // ISO timestamp of last successful sync
}

export interface GoogleCalendarData {
  auth: GoogleCalendarAuth;
  events: Event[]; // Google calendar events stored locally
  lastFetch: string | null; // ISO timestamp of last event fetch
  error: string | null; // Last error message if any
}

export interface DashboardData {
  dailyRoutine: DailyRoutineItem[];
  todos: TodoItem[];
  events: Event[];
  reminders: Reminder[];
  moods?: MoodEntry[]; // Optional for backward compatibility
  dailyRoutineHistory?: DailyRoutineHistory[]; // Optional for backward compatibility
  todoCompletions?: TodoCompletion[]; // Optional for backward compatibility
  googleCalendar?: GoogleCalendarData; // Optional for backward compatibility
  lastResetDate: string;
  soundEnabled: boolean;
  soundVolume?: number; // Optional for backward compatibility
  snoozedNotifications?: {id: number, showAt: number, originalNotification: Notification}[]; // Optional for backward compatibility
  isDarkMode: boolean;
  lastUpdated: string;
}