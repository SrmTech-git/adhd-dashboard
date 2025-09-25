// src/lib/theme.ts

export const theme = {
  light: {
    // Light mode colors (current)
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBackground: 'white',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    backgroundMuted: '#F9FAFB',
    backgroundHover: '#F3F4F6',
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444'
  },
  dark: {
    // Dark mode colors - black, indigo/lavender, pink
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    cardBackground: '#2A2A2A',
    textPrimary: '#E5E7EB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#4B5563',
    backgroundMuted: '#374151',
    backgroundHover: '#4B5563',
    primary: '#A78BFA', // Lavender
    success: '#F472B6', // Pink
    warning: '#FBBF24', // Softer yellow
    danger: '#F87171' // Softer red
  }
};

// Priority color helper - uses theme colors
export const getPriorityColor = (currentTheme: typeof theme.light, priority: string) => {
  switch(priority) {
    case 'high': return currentTheme.danger;
    case 'medium': return currentTheme.warning;
    case 'low': return currentTheme.success;
    default: return currentTheme.textMuted;
  }
};