// src/hooks/useGoogleCalendar.ts

import { useState, useEffect, useCallback } from 'react';
import { Event, GoogleCalendarAuth, GoogleCalendarData } from '@/types/dashboard';
import { googleCalendarService } from '@/lib/googleCalendarService';
import { DataService } from '@/lib/dataService';

interface UseGoogleCalendarReturn {
  isConnected: boolean;
  isLoading: boolean;
  userEmail: string | null;
  events: Event[];
  error: string | null;
  lastSync: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncEvents: () => Promise<void>;
  clearError: () => void;
}

export function useGoogleCalendar(): UseGoogleCalendarReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Load saved Google Calendar data on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = DataService.getGoogleCalendarData();
        if (savedData) {
          setIsConnected(savedData.auth.isConnected);
          setUserEmail(savedData.auth.userEmail);
          setEvents(savedData.events);
          setError(savedData.error);
          setLastSync(savedData.auth.lastSync);

          // Check if user is still signed in to Google
          if (savedData.auth.isConnected) {
            // Verify the token is still valid
            if (savedData.auth.tokenExpiry && Date.now() < savedData.auth.tokenExpiry) {
              // Try to restore the session in the service
              const restored = await googleCalendarService.restoreSession(savedData.auth);
              if (restored) {
                console.log('✅ Google Calendar session restored successfully');

                // Validate the connection is working
                const isValid = await googleCalendarService.validateConnection();
                if (!isValid) {
                  console.warn('⚠️ Session restored but validation failed');
                  setError('Session restored but connection validation failed');
                }
              } else {
                console.log('❌ Failed to restore Google Calendar session');
                await disconnect();
              }
            } else {
              // Token expired, clear the connection
              console.log('❌ Google Calendar token expired, clearing connection');
              await disconnect();
            }
          }
        }
      } catch (err) {
        console.error('Failed to load Google Calendar data:', err);
        setError('Failed to load Google Calendar data');
      }
    };

    loadSavedData();
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Google Calendar service is ready
      const isReady = await googleCalendarService.isReady();
      if (!isReady) {
        throw new Error('Google Calendar service is not ready. Please refresh the page and try again.');
      }

      // Attempt to sign in
      const auth = await googleCalendarService.signIn();

      // Save auth data
      DataService.saveGoogleCalendarAuth(auth);

      // Update state
      setIsConnected(true);
      setUserEmail(auth.userEmail);
      setLastSync(auth.lastSync);

      // Automatically fetch events after successful connection
      await syncEvents();

    } catch (err: any) {
      console.error('Google Calendar connection failed:', err);
      setError(err.message || 'Failed to connect to Google Calendar');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await googleCalendarService.signOut();

      // Clear all Google Calendar data
      DataService.clearGoogleCalendarData();

      // Reset state
      setIsConnected(false);
      setUserEmail(null);
      setEvents([]);
      setLastSync(null);

    } catch (err: any) {
      console.error('Google Calendar disconnect failed:', err);
      setError(err.message || 'Failed to disconnect from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncEvents = useCallback(async () => {
    if (!isConnected) {
      setError('Not connected to Google Calendar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const savedData = DataService.getGoogleCalendarData();
      if (!savedData?.auth.isConnected) {
        throw new Error('Google Calendar not connected');
      }

      // Validate connection before syncing
      const connectionValid = await googleCalendarService.validateConnection();
      if (!connectionValid) {
        console.log('🔄 Connection invalid, attempting to restore session');

        // Try to restore the session
        const restored = await googleCalendarService.restoreSession(savedData.auth);
        if (!restored) {
          await disconnect();
          throw new Error('Unable to restore Google Calendar session. Please reconnect.');
        }
      }

      // Check if we need to refresh the token
      let auth = savedData.auth;
      if (auth.tokenExpiry && Date.now() >= auth.tokenExpiry) {
        try {
          auth = await googleCalendarService.refreshToken(auth);
          DataService.saveGoogleCalendarAuth(auth);
        } catch (refreshError) {
          // Token refresh failed, need to re-authenticate
          await disconnect();
          throw new Error('Session expired. Please reconnect to Google Calendar.');
        }
      }

      // Fetch events from Google Calendar
      const fetchedEvents = await googleCalendarService.fetchEvents(auth);

      // Save events to local storage
      DataService.saveGoogleCalendarEvents(fetchedEvents);

      // Update state
      setEvents(fetchedEvents);
      // Force component re-render
      setLastSync(new Date().toISOString());

      // Update auth with new sync time
      const updatedAuth = { ...auth, lastSync: new Date().toISOString() };
      DataService.saveGoogleCalendarAuth(updatedAuth);

      console.log('✅ Google Calendar events synced successfully');

    } catch (err: any) {
      console.error('Failed to sync Google Calendar events:', err);

      // Enhanced error handling
      let errorMessage = 'Failed to sync Google Calendar events';
      if (err.message?.includes('gapi.client.setToken not available')) {
        errorMessage = 'Google API not properly initialized. Please refresh the page and try again.';
      } else if (err.message?.includes('Invalid or expired access token')) {
        errorMessage = 'Session expired. Please reconnect to Google Calendar.';
      } else if (err.message?.includes('Google API client not properly initialized')) {
        errorMessage = 'Google Calendar service not ready. Please refresh the page and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Save error to storage
      DataService.setGoogleCalendarError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, disconnect]);

  const clearError = useCallback(() => {
    setError(null);
    DataService.setGoogleCalendarError('');
  }, []);

  return {
    isConnected,
    isLoading,
    userEmail,
    events,
    error,
    lastSync,
    connect,
    disconnect,
    syncEvents,
    clearError
  };
}