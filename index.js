/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import store from './src/stores/ReduxStore.ts';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
//import {GestureHandlerRootView} from 'react-native-gesture-handler';


const AppWrapper = () => {
    return (
    //  <GestureHandlerRootView>
          <Provider store={store}>
              <BottomSheetModalProvider>
            <App />
            </BottomSheetModalProvider>
          </Provider>
     // </GestureHandlerRootView>
     
    );
  };
  
  //AppRegistry.registerComponent(appName, () => App);
  AppRegistry.registerComponent(appName, () => AppWrapper);
