/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import store from './src/stores/ReduxStore.ts';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TrackPlayer from 'react-native-track-player';
import { trackService } from './src/helper/trackService.ts';

TrackPlayer.registerPlaybackService(() => trackService);
const AppWrapper = () => {
    return (
      <GestureHandlerRootView>
          <Provider store={store}>
              <BottomSheetModalProvider>
            <App />
            </BottomSheetModalProvider>
          </Provider>
      </GestureHandlerRootView>
     
    );
  };
  
  //AppRegistry.registerComponent(appName, () => App);
  AppRegistry.registerComponent(appName, () => AppWrapper);
