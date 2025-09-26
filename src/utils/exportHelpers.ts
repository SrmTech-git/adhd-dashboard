// src/utils/exportHelpers.ts
import { DashboardData } from '@/types/dashboard';

export const exportToJSON = (data: DashboardData) => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `adhd_dashboard_data_${timestamp}.json`;

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: DashboardData) => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `adhd_dashboard_data_${timestamp}.csv`;

  let csvContent = '';

  // Dashboard Overview
  csvContent += 'DASHBOARD OVERVIEW\n';
  csvContent += 'Last Updated,Last Reset Date,Dark Mode,Sound Enabled,Sound Volume,Google Calendar Connected,Google Calendar User\n';
  const googleConnected = data.googleCalendar?.auth.isConnected || false;
  const googleUser = data.googleCalendar?.auth.userEmail || '';
  csvContent += `"${data.lastUpdated}","${data.lastResetDate}",${data.isDarkMode},${data.soundEnabled},${data.soundVolume || 0.7},${googleConnected},"${googleUser}"\n\n`;

  // Daily Routine
  csvContent += 'DAILY ROUTINE\n';
  csvContent += 'ID,Task,Completed\n';
  data.dailyRoutine.forEach(item => {
    csvContent += `${item.id},"${item.text.replace(/"/g, '""')}",${item.completed}\n`;
  });
  csvContent += '\n';

  // Todos
  csvContent += 'TODO LIST\n';
  csvContent += 'ID,Task,Priority,Completed\n';
  data.todos.forEach(todo => {
    csvContent += `${todo.id},"${todo.text.replace(/"/g, '""')}","${todo.priority}",${todo.completed}\n`;
  });
  csvContent += '\n';

  // Events (Local)
  csvContent += 'LOCAL EVENTS\n';
  csvContent += 'ID,Date,Time,Title,Color,Source\n';
  data.events.forEach(event => {
    csvContent += `${event.id},"${event.date}","${event.time}","${event.title.replace(/"/g, '""')}","${event.color}","${event.source || 'local'}"\n`;
  });
  csvContent += '\n';

  // Google Calendar Events (if available)
  if (data.googleCalendar && data.googleCalendar.events.length > 0) {
    csvContent += 'GOOGLE CALENDAR EVENTS\n';
    csvContent += 'ID,Date,Time,Title,Color,Source,Google Event ID\n';
    data.googleCalendar.events.forEach(event => {
      csvContent += `${event.id},"${event.date}","${event.time}","${event.title.replace(/"/g, '""')}","${event.color}","${event.source || 'google'}","${event.googleEventId || ''}"\n`;
    });
    csvContent += '\n';
  }

  // Reminders
  csvContent += 'REMINDERS\n';
  csvContent += 'ID,Text,Time,Frequency,Enabled,Last Shown\n';
  data.reminders.forEach(reminder => {
    csvContent += `${reminder.id},"${reminder.text.replace(/"/g, '""')}","${reminder.time || ''}","${reminder.frequency}",${reminder.enabled},"${reminder.lastShown || ''}"\n`;
  });
  csvContent += '\n';

  // Moods (if available)
  if (data.moods && data.moods.length > 0) {
    csvContent += 'MOOD TRACKER\n';
    csvContent += 'Date,Rating,Mood Label,Timestamp\n';
    data.moods.forEach(mood => {
      const moodLabels = {
        1: 'Bad',
        2: 'Poor',
        3: 'Meh',
        4: 'Good',
        5: 'Great'
      };
      csvContent += `"${mood.date}",${mood.rating},"${moodLabels[mood.rating]}","${mood.timestamp}"\n`;
    });
    csvContent += '\n';
  }

  // Daily Routine History (if available)
  if (data.dailyRoutineHistory && data.dailyRoutineHistory.length > 0) {
    csvContent += 'DAILY ROUTINE HISTORY\n';
    csvContent += 'Date,Task ID,Task,Completed,Completion Rate,Completed Count,Total Count\n';
    data.dailyRoutineHistory.forEach(history => {
      history.tasks.forEach(task => {
        csvContent += `"${history.date}",${task.id},"${task.text.replace(/"/g, '""')}",${task.completed},${history.completionRate.toFixed(3)},${history.completedCount},${history.totalCount}\n`;
      });
    });
    csvContent += '\n';
  }

  // Todo Completions (if available)
  if (data.todoCompletions && data.todoCompletions.length > 0) {
    csvContent += 'TODO COMPLETIONS\n';
    csvContent += 'ID,Text,Priority,Completed At,Completed Date\n';
    data.todoCompletions.forEach(completion => {
      csvContent += `${completion.id},"${completion.text.replace(/"/g, '""')}","${completion.priority}","${completion.completedAt}","${completion.completedDate}"\n`;
    });
    csvContent += '\n';
  }

  // Snoozed Notifications (if available)
  if (data.snoozedNotifications && data.snoozedNotifications.length > 0) {
    csvContent += 'SNOOZED NOTIFICATIONS\n';
    csvContent += 'ID,Show At,Original Title,Original Message\n';
    data.snoozedNotifications.forEach(snoozed => {
      csvContent += `${snoozed.id},"${new Date(snoozed.showAt).toISOString()}","${snoozed.originalNotification.title.replace(/"/g, '""')}","${snoozed.originalNotification.message.replace(/"/g, '""')}"\n`;
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export const exportData = (data: DashboardData) => {
  exportToJSON(data);
  exportToCSV(data);
};