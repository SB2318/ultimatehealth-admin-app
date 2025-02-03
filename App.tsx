/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef} from 'react';
import {Platform, StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {PRIMARY_COLOR} from './src/helper/Theme';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigation from './src/navigations/StackNavigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import messaging from '@react-native-firebase/messaging';



const queryClient = new QueryClient();
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const BarStyle = Platform.OS === 'ios' ? 'dark-content' : 'light-content';
  const navigationContainerRef = useRef();

  useEffect(() => {

    return () => {
      //unsubscribe();
      //onOpenApp();
    };
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <View
            style={{flex: 1, backgroundColor: backgroundStyle.backgroundColor}}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : BarStyle}
              backgroundColor={
                isDarkMode ? backgroundStyle.backgroundColor : PRIMARY_COLOR
              }
            />
            <NavigationContainer ref={navigationContainerRef}>
              <StackNavigation />
            </NavigationContainer>
          </View>
        </SafeAreaProvider>
  

    </QueryClientProvider>
  );
}

export default App;
