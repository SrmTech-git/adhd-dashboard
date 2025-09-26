// src/component/GoogleCalendar/GoogleCalendarConnection.tsx

import React from 'react';
import { Calendar, CheckCircle, AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface GoogleCalendarConnectionProps {
  currentTheme: any;
  isDarkMode: boolean;
}

const GoogleCalendarConnection: React.FC<GoogleCalendarConnectionProps> = ({
  currentTheme,
  isDarkMode
}) => {
  const {
    isConnected,
    isLoading,
    userEmail,
    error,
    lastSync,
    connect,
    disconnect,
    syncEvents,
    clearError
  } = useGoogleCalendar();

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <div style={{
      padding: '1rem',
      background: currentTheme.cardBackground,
      borderRadius: '0.75rem',
      border: `1px solid ${currentTheme.border}`,
      marginBottom: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <Calendar size={20} style={{ color: '#4285F4' }} />
        <h3 style={{
          color: currentTheme.textPrimary,
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          Google Calendar
        </h3>

        {/* Connection Status */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {isConnected ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(34, 197, 94, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <CheckCircle size={14} style={{ color: '#22C55E' }} />
              <span style={{
                color: '#22C55E',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Connected
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'rgba(107, 114, 128, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(107, 114, 128, 0.2)'
            }}>
              <span style={{
                color: currentTheme.textMuted,
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Not Connected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          padding: '0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '0.5rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={16} style={{ color: '#EF4444', marginTop: '0.125rem' }} />
          <div style={{ flex: 1 }}>
            <p style={{
              color: '#EF4444',
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.4'
            }}>
              {error}
            </p>
          </div>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              padding: '0.125rem'
            }}
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Connection Info */}
      {isConnected && userEmail && (
        <div style={{
          fontSize: '0.875rem',
          color: currentTheme.textSecondary,
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '0.25rem' }}>
            Connected as: <strong style={{ color: currentTheme.textPrimary }}>{userEmail}</strong>
          </div>
          <div>
            Last sync: <strong style={{ color: currentTheme.textPrimary }}>{formatLastSync(lastSync)}</strong>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#3367D6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = '#4285F4';
              }
            }}
          >
            {isLoading ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Calendar size={16} />
            )}
            {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        ) : (
          <>
            <button
              onClick={syncEvents}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: currentTheme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <RefreshCw size={16} />
              )}
              {isLoading ? 'Syncing...' : 'Sync Events'}
            </button>

            <button
              onClick={disconnect}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: currentTheme.textSecondary,
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '0.5rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = currentTheme.backgroundMuted;
                  e.currentTarget.style.color = currentTheme.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = currentTheme.textSecondary;
                }
              }}
            >
              <X size={16} />
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Help Text */}
      {!isConnected && (
        <p style={{
          fontSize: '0.75rem',
          color: currentTheme.textMuted,
          margin: '0.75rem 0 0 0',
          lineHeight: '1.4'
        }}>
          Connect your Google Calendar to view your events alongside local events. This requires read-only access to your calendar.
        </p>
      )}
    </div>
  );
};

export default GoogleCalendarConnection;