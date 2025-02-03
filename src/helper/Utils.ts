import AsyncStorage from "@react-native-async-storage/async-storage";

// Async Storage for get Item
export const retrieveItem = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      // error reading value
      console.log('Error reading value', e);
    }
  };
  
  // Async Storage Store Item
  export const storeItem = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      // console.log(`Value saved for key : ${key}`, value);
    } catch (e) {
      console.log('Async Storage Data error', e);
    }
  };
  
  // Async storage remove item
  
  export const removeItem = async (key:string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };
  
  export const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      //navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  export const KEYS = {
    USER_ID: 'USER_ID',
    USER_TOKEN: 'USER_TOKEN',
    USER_TOKEN_EXPIRY_DATE: 'USER_TOKEN_EXPIRY_DATE',
    VULTR_CHAT_MODEL: 'zephyr-7b-beta-f32',
    VULTR_COLLECTION: 'care_companion',
    USER_HANDLE: 'USER_HANDLE'
  };