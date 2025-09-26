// src/lib/googleCalendarService.ts

import { Event, GoogleCalendarAuth, GoogleCalendarData } from '@/types/dashboard';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

class GoogleCalendarService {
  private clientId = '113475102949-b8qjnku9u2rajuia90uolj6mougcsek2.apps.googleusercontent.com';
  private apiKey = ''; // Not needed for OAuth flow
  private scope = 'https://www.googleapis.com/auth/calendar.readonly';
  private discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initPromise = this.initialize();
    } else {
      this.initPromise = Promise.resolve();
    }
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Wait for Google APIs to load
      await this.waitForGoogleAPIs();

      // Initialize gapi
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2:client', {
          callback: () => {
            window.gapi.client.init({
              discoveryDocs: [this.discoveryUrl],
              clientId: this.clientId,
              scope: this.scope
            }).then(() => {
              this.isInitialized = true;
              resolve();
            }).catch(reject);
          },
          onerror: reject
        });
      });

    } catch (error) {
      console.error('Failed to initialize Google Calendar API:', error);
      throw error;
    }
  }

  private async waitForGoogleAPIs(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Google APIs not available on server side');
    }

    return new Promise((resolve, reject) => {
      const maxAttempts = 50;
      let attempts = 0;

      const checkGoogleAPIs = () => {
        attempts++;
        if (window.gapi && window.google) {
          resolve();
        } else if (attempts < maxAttempts) {
          setTimeout(checkGoogleAPIs, 100);
        } else {
          reject(new Error('Google APIs failed to load'));
        }
      };

      checkGoogleAPIs();
    });
  }

  async signIn(): Promise<GoogleCalendarAuth> {
    if (typeof window === 'undefined') {
      throw new Error('Sign-in not available on server side');
    }

    await this.initPromise;

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();

      if (!user.isSignedIn()) {
        throw new Error('User authentication failed');
      }

      const authResponse = user.getAuthResponse();
      const profile = user.getBasicProfile();

      const auth: GoogleCalendarAuth = {
        isConnected: true,
        accessToken: authResponse.access_token,
        refreshToken: null, // Not available in client-side OAuth
        tokenExpiry: authResponse.expires_at,
        userEmail: profile.getEmail(),
        lastSync: new Date().toISOString()
      };

      return auth;
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.initPromise;

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (error) {
      console.error('Google Calendar sign-out failed:', error);
      throw error;
    }
  }

  async isSignedIn(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      await this.initPromise;
      const authInstance = window.gapi.auth2.getAuthInstance();
      return authInstance.isSignedIn.get();
    } catch (error) {
      console.error('Failed to check sign-in status:', error);
      return false;
    }
  }

  async refreshToken(auth: GoogleCalendarAuth): Promise<GoogleCalendarAuth> {
    // For client-side OAuth, we need to check if the token is still valid
    // and potentially re-authenticate if it's expired
    if (!auth.tokenExpiry || Date.now() >= auth.tokenExpiry) {
      throw new Error('Token expired - re-authentication required');
    }
    return auth;
  }

  async fetchEvents(auth: GoogleCalendarAuth, daysAhead: number = 30): Promise<Event[]> {
    if (typeof window === 'undefined') return [];

    await this.initPromise;

    try {
      // Check if token is valid
      if (!auth.accessToken || !auth.tokenExpiry || Date.now() >= auth.tokenExpiry) {
        throw new Error('Invalid or expired access token');
      }

      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + daysAhead);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: futureDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events: GoogleCalendarEvent[] = response.result.items || [];

      return events.map(this.convertGoogleEventToLocal);
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
      throw error;
    }
  }

  private convertGoogleEventToLocal(googleEvent: GoogleCalendarEvent): Event {
    // Handle all-day events and timed events
    const startDateTime = googleEvent.start.dateTime || googleEvent.start.date;
    const eventDate = new Date(startDateTime!);

    // Generate a stable ID based on Google event ID
    const localId = this.generateLocalId(googleEvent.id);

    // Format time for display
    let timeString: string;
    if (googleEvent.start.dateTime) {
      // Timed event
      timeString = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      // All-day event
      timeString = 'All day';
    }

    return {
      id: localId,
      date: eventDate.toISOString().split('T')[0],
      time: timeString,
      title: googleEvent.summary || 'Untitled Event',
      color: '#4285F4', // Google Blue for Google Calendar events
      source: 'google',
      googleEventId: googleEvent.id
    };
  }

  private generateLocalId(googleEventId: string): number {
    // Generate a consistent numeric ID from the Google event ID
    let hash = 0;
    for (let i = 0; i < googleEventId.length; i++) {
      const char = googleEventId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Helper method to get user info
  async getUserInfo(): Promise<{ email: string; name: string } | null> {
    if (typeof window === 'undefined') return null;

    try {
      await this.initPromise;
      const authInstance = window.gapi.auth2.getAuthInstance();

      if (!authInstance.isSignedIn.get()) {
        return null;
      }

      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();

      return {
        email: profile.getEmail(),
        name: profile.getName()
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Check if the service is ready to use
  async isReady(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      await this.initPromise;
      return this.isInitialized;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();