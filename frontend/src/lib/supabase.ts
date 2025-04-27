import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with realtime enabled
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://5.78.114.152:8000';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Fix URL format - ensure it doesn't end with a trailing slash
const formattedUrl = supabaseUrl.endsWith('/') 
  ? supabaseUrl.slice(0, -1) 
  : supabaseUrl;

console.log('Using Supabase URL:', formattedUrl);

// Self-hosted Supabase specific configuration
// Create client with enhanced debug options and self-hosted settings
export const supabase = createClient(formattedUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 60
    },
    // Self-hosted Supabase often needs to explicitly set the realtime URL
    headers: {
      apikey: supabaseKey,
    }
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Log when client is created
console.log('Supabase client initialized for self-hosted instance');

// Function to check for self-hosted specific configuration issues
const checkSelfHostedConfig = () => {
  const issues = [];
  
  // Check if realtime is enabled in the self-hosted instance
  if (!supabase.realtime) {
    issues.push('Realtime client not initialized. Make sure realtime is enabled in your self-hosted configuration.');
  }
  
  // Check URL format
  if (!formattedUrl.includes('http')) {
    issues.push('URL appears to be malformed. Self-hosted instances need full URL including protocol.');
  }
  
  return {
    issues,
    configuration: {
      url: formattedUrl,
      // Remove sensitive parts of the key for logging
      keyFormat: supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 5),
      eventsPerSecond: 60
    }
  };
};

// Log self-hosted configuration check
const configCheck = checkSelfHostedConfig();
console.log('Self-hosted configuration check:', configCheck);
if (configCheck.issues.length > 0) {
  console.warn('⚠️ Potential issues with self-hosted configuration:', configCheck.issues);
}

// Define return type for diagnostic function
export interface DiagnosticResult {
  available: boolean;
  error?: string;
  details?: {
    url?: string;
    connectionInfo?: string;
    serverInfo?: string;
    suggestion?: string;
    selfHosted?: boolean;
    selfHostedConfig?: any;
  };
}

// Function to manually check if realtime is available
export const checkRealtimeAvailability = async (): Promise<DiagnosticResult> => {
  try {
    console.log('Checking realtime availability on self-hosted Supabase...');
    console.log('URL being used:', formattedUrl);
    
    // Try a basic query to see if server is reachable
    const { data, error } = await supabase.from('tasks').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error accessing database:', error);
      return { 
        available: false, 
        error: error.message,
        details: {
          url: formattedUrl,
          connectionInfo: 'Failed to connect to database',
          suggestion: 'For self-hosted Supabase: Check if your database service is running properly and accessible',
          selfHosted: true,
          selfHostedConfig: configCheck
        }
      };
    }
    
    // Try to create a dummy channel to check realtime status
    const testChannel = supabase.channel('test-availability');
    
    // Check if realtime object exists and has expected methods
    if (!supabase.realtime) {
      return {
        available: false,
        error: 'Realtime client not initialized',
        details: {
          url: formattedUrl,
          suggestion: 'For self-hosted Supabase: Make sure the realtime service is enabled in your Docker configuration',
          selfHosted: true,
          selfHostedConfig: configCheck
        }
      };
    }
    
    // Return a promise that resolves when the subscription succeeds or fails
    return new Promise((resolve) => {
      try {
        testChannel
          .subscribe((status) => {
            console.log('Realtime test status:', status);
            
            if (status === 'SUBSCRIBED') {
              resolve({ 
                available: true,
                details: {
                  url: formattedUrl,
                  connectionInfo: 'Successfully connected to realtime service',
                  serverInfo: 'Realtime server available and responding',
                  selfHosted: true,
                  selfHostedConfig: configCheck
                }
              });
              supabase.removeChannel(testChannel);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              resolve({ 
                available: false, 
                error: `Connection status: ${status}`,
                details: {
                  url: formattedUrl,
                  connectionInfo: `Channel error: ${status}`,
                  suggestion: status === 'CHANNEL_ERROR' 
                    ? 'Self-hosted Supabase: Check if realtime service is running. You may need to enable it in your docker-compose.yml and expose the websocket port (typically 4000).'
                    : 'Self-hosted Supabase: Make sure ports 4000 (realtime) and 3000 (API) are exposed and not blocked by firewalls',
                  serverInfo: 'Self-hosted instances require specific configuration for realtime service',
                  selfHosted: true,
                  selfHostedConfig: configCheck
                }
              });
              supabase.removeChannel(testChannel);
            }
          });
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        resolve({
          available: false,
          error: `Subscription error: ${error}`,
          details: {
            url: formattedUrl,
            connectionInfo: `Error while trying to subscribe: ${error}`,
            suggestion: 'Self-hosted Supabase: Check if your realtime service is configured properly',
            selfHosted: true,
            selfHostedConfig: configCheck
          }
        });
      }
            
      // Timeout after 5 seconds if no response
      setTimeout(() => {
        resolve({ 
          available: false, 
          error: 'Connection timeout',
          details: {
            url: formattedUrl,
            connectionInfo: 'Timeout while waiting for realtime connection',
            suggestion: 'Self-hosted Supabase: Check network connectivity and ensure WebSocket port (4000) is exposed',
            serverInfo: 'For self-hosted instances, you may need to configure CORS and expose WebSocket endpoints',
            selfHosted: true,
            selfHostedConfig: configCheck
          }
        });
        try {
          supabase.removeChannel(testChannel);
        } catch (e) {
          console.error('Error removing channel:', e);
        }
      }, 5000);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error checking realtime:', errorMessage);
    return { 
      available: false, 
      error: `Unexpected error: ${errorMessage}`,
      details: {
        url: formattedUrl,
        suggestion: 'Self-hosted Supabase issue - check console for detailed error information',
        selfHosted: true,
        selfHostedConfig: configCheck
      }
    };
  }
};

// Function to get tasks from Supabase
export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data || [];
}; 