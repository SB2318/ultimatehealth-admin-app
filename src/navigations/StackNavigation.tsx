import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';

const Stack = createStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
        options={{headerShown: false}}
      />

<Stack.Screen
        name="NewPasswordScreen"
        component={NewPasswordScreen}
        options={{headerShown: false}}
      />
    
     
    </Stack.Navigator>
  );
};

export default StackNavigation;
