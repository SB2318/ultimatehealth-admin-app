import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Article';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import TabBar from './TabBar';
import {TabParamList} from '../type';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
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
          headerShown: false,
          headerTransparent: true,
          headerTitleStyle: {
            color: 'white',
          },
          //headerRight: () => {}
        }}
      />
      <Tab.Screen
        name="Notification"
        component={Notification}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
        
          headerStyle: {
            backgroundColor: ON_PRIMARY_COLOR,
          },
        
        
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
