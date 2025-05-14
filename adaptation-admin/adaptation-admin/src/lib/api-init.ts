import { useStore } from '@/store';
import apiClient from './api';

/**
 * Initialize the application by loading initial data from the API
 * This function should be called on application start
 */
export async function initializeApp() {
  const {
    fetchEmployees,
    fetchTracks,
    fetchArticles,
    fetchUsers,
    fetchPositions,
    fetchDepartments,
    fetchNotifications,
    setError
  } = useStore.getState();

  try {
    // Load data in parallel
    await Promise.all([
      fetchEmployees(),
      fetchTracks(),
      fetchArticles(),
      fetchUsers(),
      fetchPositions(),
      fetchDepartments(),
      fetchNotifications()
    ]);
    
    console.log('Application data initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application data:', error);
    setError(error instanceof Error ? error.message : 'Failed to initialize application data');
  }
}

/**
 * Check if user is authenticated and set token for API client
 * @param token JWT token
 */
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.setToken(token);
    localStorage.setItem('auth_token', token);
  } else {
    apiClient.clearToken();
    localStorage.removeItem('auth_token');
  }
}

/**
 * Load authentication token from localStorage if available
 */
export function loadStoredAuth() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    apiClient.setToken(token);
    return true;
  }
  return false;
} 