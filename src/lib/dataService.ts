// src/lib/dataService.ts
import { DashboardData } from '@/types/dashboard';

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
  }
};