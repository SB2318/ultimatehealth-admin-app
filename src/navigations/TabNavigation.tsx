import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Article';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import TabBar from './TabBar';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity, View} from 'react-native';
import {TabParamList} from '../type';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {BUTTON_COLOR} from '../helper/Theme';
import Podcast from '../screens/Podcast';
import Notification from '../screens/Notification';
import Report from '../screens/Report';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator<TabParamList>();
const TabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="Article"
      tabBar={props => <TabBar {...props} />}>
      <Tab.Screen
        name="Article"
        component={HomeScreen}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors.darker,
          },
          headerTitleStyle: {
            color: 'white',
          },
        }}
      />
      <Tab.Screen
        name="Podcast"
        component={Podcast}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: {
            color: 'white',
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 10,
                gap: 10,
              }}>
              <TouchableOpacity>
                <AntDesign name="search1" color={'white'} size={24} />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  color={'white'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          title: 'Notification',
          headerShown: true,
          headerBackTitleVisible: false,
          headerStyle: {
            backgroundColor: BUTTON_COLOR,
          },
          headerTintColor: 'white',
          headerShadowVisible: false,
          tabBarHideOnKeyboard: true,
          headerLeft: () => (
            <TouchableOpacity
              style={{
                marginLeft: 15,
                height: 35,
                width: 35,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
              }}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={20} name="arrow-left" color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Report"
        component={Report}
        options={{headerShown: false}}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
};
export default TabNavigation;
