import React, { useCallback } from 'react';
import {View, Pressable, StyleSheet, useColorScheme, Text} from 'react-native';
import {FontAwesome, Ionicons} from '@expo/vector-icons';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import {PRIMARY_COLOR} from '../helper/Theme';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useSelector } from 'react-redux';
import { PROD_URL } from '../helper/APIUtils';
import { hp } from '../helper/Metric';

const TabBar = ({state, descriptors, navigation}: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

   const {data: unreadCount, refetch: refetchUnreadCount} = useQuery({
      queryKey: ['get-unread-notifications-count'],
      queryFn: async () => {
        try {
      
          const response = await axios.get(
            `${PROD_URL}/notification/unread-count?role=1`,
            {
              //headers: {
              //  Authorization: `Bearer ${user_token}`,
             // },
            },
          );
  
          // console.log('Notification Response', response);
          if(!response || !response.data) return 0;
          return response.data.unreadCount as number;
        } catch (err) {
          //console.error('Error fetching articles:', err);
          return 0;
        }
      },
      enabled : !!user_token && !!isConnected
    });
  
    useFocusEffect(
      useCallback(() => {
        refetchUnreadCount();
      }, [refetchUnreadCount]),
    );

  return (
    <View
      style={[
        styles.mainContainer,
        {backgroundColor: isDarkMode ? PRIMARY_COLOR : 'white'},
      ]}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={index}
            style={[
              styles.mainItemContainer,
              {borderRightWidth: label === 'notes' ? 3 : 0},
            ]}>
            <Pressable
              onPress={onPress}
              style={{
                backgroundColor: isFocused
                  ? PRIMARY_COLOR
                  : isDarkMode
                  ? PRIMARY_COLOR
                  : 'white',
                borderRadius: 50,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 5,
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                }}>
                {label === 'Article' && (
                  <Ionicons
                    name="home"
                    size={30}
                    color={
                      isFocused ? 'white' : isDarkMode ? 'white' : '#343434'
                    }
                  />
                )}
                {label === 'Podcast' && (
                  <FontAwesome
                    name="podcast"
                    size={30}
                    color={
                      isFocused ? 'white' : isDarkMode ? 'white' : '#343434'
                    }
                  />
                )}

                {label === 'Notification' && (
                  <View style={{position: 'relative'}}>
                    <Ionicons
                      name="notifications"
                      size={30}
                      color={
                        isFocused ? 'white' : isDarkMode ? 'white' : '#343434'
                      }
                    />

                    {/* Red dot */}
                    {unreadCount > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 2,
                          width: 15,
                          height: 15,
                          borderRadius: 8,
                          backgroundColor: 'red',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        {/* Optionally show the unread count */}
                        <Text
                          style={{
                            color: 'white',
                            fontSize: 11,
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {label === 'Report' && (
                  <MaterialIcon
                    name="report"
                    size={30}
                    color={
                      isFocused ? 'white' : isDarkMode ? 'white' : '#343434'
                    }
                  />
                )}

                {label === 'Profile' && (
                  <MaterialIcon
                    name="person"
                    size={30}
                    color={
                      isFocused ? 'white' : isDarkMode ? 'white' : '#343434'
                    }
                  />
                )}
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: hp(7),
    backgroundColor: 'red',
    //borderWidth: 0.19,
    zIndex: 0,
  },
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 7,
    borderRadius: 1,
    //borderColor: '#333B42',
    zIndex: 1,
  },
});

export default TabBar;
