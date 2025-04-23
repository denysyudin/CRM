import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface ApiHook<T> extends ApiState<T> {
  refetch: () => Promise<void>;
}

/**
 * Custom hook for handling API requests with loading and error states
 * @param apiCall - Function that returns a promise with data
 * @param dependencies - Optional dependencies array to trigger refetch
 */
export function useApi<T>(
  apiCall: () => Promise<T>, 
  dependencies: any[] = []
): ApiHook<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Store apiCall in a ref to prevent it from causing re-renders
  const apiCallRef = useRef(apiCall);
  // Update the ref if apiCall changes
  apiCallRef.current = apiCall;

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use the ref to call the latest apiCall function
      const data = await apiCallRef.current();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
      console.error('API Error:', error);
    }
  }, dependencies); // Only depend on external dependencies, not apiCall itself

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export default useApi; 