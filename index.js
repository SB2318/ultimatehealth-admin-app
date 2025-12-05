import { registerRootComponent } from 'expo';
import App from './App';
import { Provider } from 'react-redux';
import store from './src/stores/ReduxStore';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from "react-native";

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
