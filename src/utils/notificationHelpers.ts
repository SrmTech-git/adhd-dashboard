// src/utils/notificationHelpers.ts

// Show notification (browser only, return data for in-app)
export const showNotification = (message: string, title = 'Reminder') => {
  // Browser notification
  if ('Notification' in window && window.Notification.permission === 'granted') {
    new window.Notification(title, {
      body: message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'adhd-dashboard-reminder',
      requireInteraction: false
    });
  }

  // Return notification object for in-app use
  return {
    id: Date.now(),
    title,
    message
  };
};

// Simple helper to create dismiss action
export const dismissNotification = (id: number) => {
  return { type: 'dismiss', id };
};

// Simple helper to create snooze action  
export const snoozeNotification = (notificationId: number, reminderId: number | undefined) => {
  return { 
    type: 'snooze', 
    notificationId, 
    reminderId 
  };
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window && window.Notification.permission === 'default') {
    return await window.Notification.requestPermission();
  }
  return window.Notification.permission;
};