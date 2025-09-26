// src/lib/dataService.ts
import { DashboardData, GoogleCalendarData, GoogleCalendarAuth } from '@/types/dashboard';

// Data Service Layer - Easy to replace with API calls later
export const DataService = {
  // These functions mimic REST API endpoints
  // When transitioning to Java backend, just replace these with fetch() calls
  
  // Get all data for a user (would be GET /api/user/{userId}/data)
loadUserData: (): DashboardData | null => {
      try {
      const data = localStorage.getItem('adhd_dashboard_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  },

  // Save all user data (would be POST /api/user/{userId}/data)
  saveUserData: (data: any) => {
    try {
      localStorage.setItem('adhd_dashboard_data', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  // Update specific entity (would be PUT /api/routines/{id}, PUT /api/todos/{id}, etc.)
updateEntity: (entityType: keyof DashboardData, entityId: number, updates: any) => {
    const data = DataService.loadUserData();
    if (data && data[entityType]) {
      const entityArray = data[entityType] as any[];
      const index = entityArray.findIndex((item: any) => item.id === entityId);      if (index !== -1) {
              
      entityArray[index] = { ...entityArray[index], ...updates };
        return DataService.saveUserData(data);
      }
    }
    return false;
  },

  // Get today's date key for daily resets
  getTodayKey: () => {
    return new Date().toISOString().split('T')[0];
  },

  // Google Calendar specific methods
  saveGoogleCalendarAuth: (auth: GoogleCalendarAuth) => {
    const data = DataService.loadUserData();
    if (data) {
      if (!data.googleCalendar) {
        data.googleCalendar = {
          auth: auth,
          events: [],
          lastFetch: null,
          error: null
        };
      } else {
        data.googleCalendar.auth = auth;
      }
      return DataService.saveUserData(data);
    }
    return false;
  },

  saveGoogleCalendarEvents: (events: any[], error: string | null = null) => {
    const data = DataService.loadUserData();
    if (data) {
      if (!data.googleCalendar) {
        data.googleCalendar = {
          auth: {
            isConnected: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null,
            userEmail: null,
            lastSync: null
          },
          events: [],
          lastFetch: null,
          error: null
        };
      }

      data.googleCalendar.events = events;
      data.googleCalendar.lastFetch = new Date().toISOString();
      data.googleCalendar.error = error;

      return DataService.saveUserData(data);
    }
    return false;
  },

  getGoogleCalendarData: (): GoogleCalendarData | null => {
    const data = DataService.loadUserData();
    return data?.googleCalendar || null;
  },

  clearGoogleCalendarData: () => {
    const data = DataService.loadUserData();
    if (data) {
      data.googleCalendar = {
        auth: {
          isConnected: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          userEmail: null,
          lastSync: null
        },
        events: [],
        lastFetch: null,
        error: null
      };
      return DataService.saveUserData(data);
    }
    return false;
  },

  setGoogleCalendarError: (error: string) => {
    const data = DataService.loadUserData();
    if (data) {
      if (!data.googleCalendar) {
        data.googleCalendar = {
          auth: {
            isConnected: false,
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null,
            userEmail: null,
            lastSync: null
          },
          events: [],
          lastFetch: null,
          error: null
        };
      }
      data.googleCalendar.error = error;
      return DataService.saveUserData(data);
    }
    return false;
  }
};