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
  private tokenClient: any = null;
  private currentAccessToken: string | null = null;

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

      // Initialize gapi client (without auth2)
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: () => {
            window.gapi.client.init({
              discoveryDocs: [this.discoveryUrl]
            }).then(() => {
              // Initialize Google Identity Services token client
              this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: this.clientId,
                scope: this.scope,
                callback: this.handleTokenResponse.bind(this), // Use persistent callback
              });

              this.isInitialized = true;
              console.log('✅ Google Calendar service initialized with GIS');

              // Try to restore existing session
              this.restoreSessionFromStorage();

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

  // Persistent token response handler
  private handleTokenResponse(response: any): void {
    if (response.error) {
      console.error('Google Calendar token response error:', response.error);
      return;
    }

    // Store access token for API calls
    this.currentAccessToken = response.access_token;
    this.setTokenInClient(response.access_token);

    console.log('✅ Token received and set in client');
  }

  // Helper method to safely set token in gapi client
  private setTokenInClient(accessToken: string): void {
    if (window.gapi && window.gapi.client && window.gapi.client.setToken) {
      window.gapi.client.setToken({ access_token: accessToken });
    } else {
      console.warn('gapi.client.setToken not available when trying to set token');
    }
  }

  // Restore session from localStorage
  private restoreSessionFromStorage(): void {
    try {
      const savedData = this.getStoredAuth();
      if (savedData && savedData.isConnected && savedData.accessToken) {
        // Check if token is still valid
        if (savedData.tokenExpiry && Date.now() < savedData.tokenExpiry) {
          console.log('🔄 Restoring Google Calendar session from storage');
          this.currentAccessToken = savedData.accessToken;
          this.setTokenInClient(savedData.accessToken);
          console.log('✅ Google Calendar session restored');
        } else {
          console.log('❌ Stored Google Calendar token expired');
        }
      }
    } catch (error) {
      console.error('Failed to restore session from storage:', error);
    }
  }

  // Get stored auth data
  private getStoredAuth(): GoogleCalendarAuth | null {
    try {
      const stored = localStorage.getItem('googleCalendarAuth');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored auth data:', error);
      return null;
    }
  }

  async signIn(): Promise<GoogleCalendarAuth> {
    if (typeof window === 'undefined') {
      throw new Error('Sign-in not available on server side');
    }

    await this.initPromise;

    if (!this.tokenClient) {
      throw new Error('Token client not initialized');
    }

    try {
      return new Promise<GoogleCalendarAuth>((resolve, reject) => {
        // Set temporary callback for this sign-in request
        const originalCallback = this.tokenClient.callback;
        this.tokenClient.callback = (response: any) => {
          // Restore original callback
          this.tokenClient.callback = originalCallback;

          if (response.error) {
            console.error('Google Calendar sign-in failed:', response.error);
            reject(new Error(response.error));
            return;
          }

          // Handle the token response
          this.handleTokenResponse(response);

          // Calculate token expiry (GIS doesn't provide exact expiry, typically 1 hour)
          const expiryTime = Date.now() + (response.expires_in ? response.expires_in * 1000 : 3600000);

          // Create auth object directly without API call to avoid 401 error
          const auth: GoogleCalendarAuth = {
            isConnected: true,
            accessToken: response.access_token,
            refreshToken: null, // Not available in client-side OAuth
            tokenExpiry: expiryTime,
            userEmail: 'user@example.com', // Placeholder since we don't need it for calendar access
            lastSync: new Date().toISOString()
          };

          console.log('✅ Google Calendar sign-in successful');
          resolve(auth);
        };

        // Request access token
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Revoke the access token
      if (this.currentAccessToken && window.google.accounts.oauth2) {
        window.google.accounts.oauth2.revoke(this.currentAccessToken, () => {
          console.log('✅ Google Calendar access token revoked');
        });
      }

      // Clear stored token
      this.currentAccessToken = null;
      window.gapi.client.setToken(null);

      console.log('✅ Google Calendar sign-out successful');
    } catch (error) {
      console.error('Google Calendar sign-out failed:', error);
      throw error;
    }
  }

  async isSignedIn(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Check if we have a valid access token
      return this.currentAccessToken !== null && window.gapi.client.getToken() !== null;
    } catch (error) {
      console.error('Failed to check sign-in status:', error);
      return false;
    }
  }

  async refreshToken(auth: GoogleCalendarAuth): Promise<GoogleCalendarAuth> {
    // With GIS, we need to request a new token when the current one expires
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

      // Set the access token safely
      if (window.gapi && window.gapi.client && window.gapi.client.setToken) {
        window.gapi.client.setToken({ access_token: auth.accessToken });
      } else {
        console.error('gapi.client.setToken not available');
        throw new Error('Google API client not properly initialized');
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

      console.log('Raw Google Calendar API response:', response.result);

      const events: GoogleCalendarEvent[] = response.result.items || [];

      console.log('Parsed events from Google:', events);

      const convertedEvents = events.map((event) => this.convertGoogleEventToLocal(event));

      console.log('Converted events for dashboard:', convertedEvents);

      return convertedEvents;
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

  // Helper method to get user email from API
  private async getUserEmailFromAPI(): Promise<string | null> {
    try {
      // Make a lightweight API call to get user info
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });

      return response.result.email || null;
    } catch (error) {
      console.error('Failed to get user email from API:', error);
      return null;
    }
  }

  // Helper method to get user info
  async getUserInfo(): Promise<{ email: string; name: string } | null> {
    if (typeof window === 'undefined') return null;

    try {
      await this.initPromise;

      if (!this.currentAccessToken) {
        return null;
      }

      // Make API call to get user info
      const response = await window.gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v2/userinfo'
      });

      return {
        email: response.result.email || 'unknown@example.com',
        name: response.result.name || 'Unknown User'
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Restore session for a given auth object
  async restoreSession(auth: GoogleCalendarAuth): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      await this.initPromise;

      // Validate the token is not expired
      if (!auth.accessToken || !auth.tokenExpiry || Date.now() >= auth.tokenExpiry) {
        console.log('❌ Cannot restore session: token expired or invalid');
        return false;
      }

      // Set the token in the service and client
      this.currentAccessToken = auth.accessToken;
      this.setTokenInClient(auth.accessToken);

      console.log('✅ Google Calendar session restored externally');
      return true;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return false;
    }
  }

  // Validate current connection state
  async validateConnection(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      await this.initPromise;

      // Check if we have a current access token
      if (!this.currentAccessToken) {
        console.log('❌ No access token available');
        return false;
      }

      // Check if gapi client has a token
      const clientToken = window.gapi?.client?.getToken();
      if (!clientToken || !clientToken.access_token) {
        console.log('❌ gapi client has no token set');
        return false;
      }

      // Tokens should match
      if (clientToken.access_token !== this.currentAccessToken) {
        console.log('❌ Token mismatch between service and gapi client');
        return false;
      }

      console.log('✅ Connection validation passed');
      return true;
    } catch (error) {
      console.error('Connection validation failed:', error);
      return false;
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