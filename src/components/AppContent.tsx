import {FirebaseProvider} from '@/FirebaseContext';
import {SocketProvider} from './SocketContext';
import config from '@/tamagui.config';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View, StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TamaguiProvider} from 'tamagui';
import StackNavigation from '../navigations/StackNavigation';
import UpdateModal from './AppUpdateModal';
import messaging from '@react-native-firebase/messaging';
import {useDispatch} from 'react-redux';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import {useVersionCheck} from '../hooks/useGetVersionCheck';
import {useNotificationListeners} from '../hooks/useNotificationListener';
import {addEventListener} from '@react-native-community/netinfo';
import {setConnected} from '../stores/NetworkSlice';

export default function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? 'black' : ON_PRIMARY_COLOR,
  };
  const {visible, storeUrl} = useVersionCheck();
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
              <UpdateModal visible={visible} storeUrl={storeUrl} />
            </View>
          </SafeAreaProvider>
        </FirebaseProvider>
      </SocketProvider>
    </TamaguiProvider>
  );
}
