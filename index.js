import axios from 'axios';
import { registerRootComponent } from 'expo';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Provider } from 'react-redux';
import store from './src/stores/ReduxStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import App from './App';
import { StyleSheet } from 'react-native';

// Ensure mobile headers are sent for all requests
axios.defaults.headers.common['x-type'] = 'mobile';
axios.defaults.headers.common['x-client-type'] = 'mobile';
axios.defaults.headers.common['x-type-header'] = 'mobile';

axios.interceptors.request.use(config => {
  config.headers = config.headers || {};
  config.headers['x-type'] = 'mobile';
  config.headers['x-client-type'] = 'mobile';
  config.headers['x-type-header'] = 'mobile';
  return config;
});

const AppWrapper = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

registerRootComponent(AppWrapper);
