import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import { RootStackParamList } from '../type';
import TabNavigation from './TabNavigation';
import ArticleReviewScreen from '../screens/ArticleReviewScreen';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import EditProfile from '../screens/EditProfile';
import LogoutScreen from '../screens/auth/LogoutScreen';
import WorkHistoryScreen from '../screens/WorkHistoryScreen';

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigation = () => {

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false}}
      />
       <Stack.Screen
        name="TabScreen"
        component={TabNavigation}
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
    
    <Stack.Screen
        name="ArticleReviewScreen"
        component={ArticleReviewScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color="white" />
            </TouchableOpacity>
          ),
        })}
      />

     <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={({navigation}) => ({
          headerShown: true,
          title: 'Edit Profile',
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.profileScreenHeaderLeftButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color="black" />
            </TouchableOpacity>
          ),
        })}
      />
       <Stack.Screen
        name="LogoutScreen"
        component={LogoutScreen}
        options={{
          headerShown: false,
        }}
      />

       <Stack.Screen
        name="WorkHistoryScreen"
        component={WorkHistoryScreen}
        options={{
          headerShown: false,
        }}
      />
     
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerLeftButton: {
    marginLeft: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 50,
  },
  headerLeftButtonEditorScreen: {
    marginLeft: 15,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  headerLeftButtonCommentScreen: {
    marginLeft: 15,
    backgroundColor: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginTop: 0,
  },
  profileScreenHeaderLeftButton: {
    marginLeft: 15,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 50,
  },
  dropdown: {
    height: 40,
    // borderColor: '#0CAFFF',
    // borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 17,
    marginBottom: 20,
    paddingRight: 12,
    width: 150,
    backgroundColor: 'rgb(229, 233, 241)',
  },
  placeholderStyle: {
    fontSize: 15,
    color: 'black',
  },
});
export default StackNavigation;


