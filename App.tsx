/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import axios from 'axios';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AppContent from './src/components/AppContent';

// Set global axios timeout to prevent hung requests
axios.defaults.timeout = 20000;

// Optimized QueryClient: eliminate unnecessary re-fetches and cache data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh data (no refetch on tab switches)
      gcTime: 1000 * 60 * 30, // 30 minutes in memory
      refetchOnWindowFocus: false, // Prevent redundant mobile background/foreground fetches
      refetchOnReconnect: 'always', // Refresh when network reconnects
      retry: 1, // Fail fast: 1 retry instead of 3 exponential delays
    },
  },
});

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
