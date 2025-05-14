import { useState, useCallback } from 'react';
import apiClient from '@/lib/api';
import { useStore } from '@/store';

/**
 * Custom hook for API operations with loading and error state management
 */
export function useApi() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { setError: setGlobalError } = useStore();

  /**
   * Generic API call wrapper function with error handling
   */
  const apiCall = useCallback(async <T>(
    apiFunction: () => Promise<T>,
    options: {
      setGlobalError?: boolean;
      successMessage?: string;
    } = {}
  ): Promise<T | null> => {
    const { setGlobalError: shouldSetGlobalError = true, successMessage } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      if (shouldSetGlobalError) {
        setGlobalError(errorMessage);
      }
      
      console.error('API call failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setGlobalError]);

  return {
    isLoading,
    error,
    setError,
    apiCall,
    apiClient
  };
}

export default useApi; 