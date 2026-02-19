/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AppContent from './src/components/AppContent';

const queryClient = new QueryClient();

function App(): React.JSX.Element {

  return (
     <QueryClientProvider client={queryClient}>
      <AppContent/>
    </QueryClientProvider>
  );
}

export default App;
