/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar, useColorScheme, View} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {FirebaseProvider} from './FirebaseContext';
import {SocketProvider} from './src/components/SocketContext';
import StackNavigation from './src/navigations/StackNavigation';
import {addEventListener} from '@react-native-community/netinfo';
import messaging from '@react-native-firebase/messaging';
import {useDispatch} from 'react-redux';
import config from './tamagui.config';
import {ON_PRIMARY_COLOR} from './src/helper/Theme';
import {setConnected} from './src/stores/NetworkSlice';
import {TamaguiProvider} from 'tamagui';
import {useNotificationListeners} from './src/hooks/useNotificationListener';

const queryClient = new QueryClient();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : ON_PRIMARY_COLOR,
  };

  const dispatch = useDispatch();
  useNotificationListeners();

  useEffect(() => {
    const unsubscribe1 = addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      /** Dispatch use a reducer to update the value in store */
      dispatch(setConnected(state.isConnected));
    });
    const onOpenApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open:', remoteMessage);
    });

    return () => {
      unsubscribe1();
      onOpenApp();
    };
  }, [dispatch]);

  return (
    <TamaguiProvider config={config}>
      <SocketProvider>
        <QueryClientProvider client={queryClient}>
          <FirebaseProvider>
            <SafeAreaProvider>
              <View
                style={{
                  flex: 1,
                  backgroundColor: backgroundStyle.backgroundColor,
                }}>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor={backgroundStyle.backgroundColor}
                />
                <NavigationContainer>
                  <StackNavigation />
                </NavigationContainer>
              </View>
            </SafeAreaProvider>
          </FirebaseProvider>
        </QueryClientProvider>
      </SocketProvider>
    </TamaguiProvider>
  );
}

export default App;
