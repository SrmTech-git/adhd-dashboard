// src/utils/dateHelpers.ts

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

export const generateCalendarDays = (currentMonth: number, currentYear: number) => {
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const days: (number | null)[] = [];

  // Add empty slots for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

export const isToday = (day: number | null, currentMonth: number, currentYear: number) => {
  if (!day) return false;
  const today = new Date();
  return day === today.getDate() && 
         currentMonth === today.getMonth() && 
         currentYear === today.getFullYear();
};

export const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const formatTo12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${hour12}:${minutes} ${ampm}`;
};