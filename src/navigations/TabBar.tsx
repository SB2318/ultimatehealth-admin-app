import React from 'react';
import {View, Pressable, StyleSheet, useColorScheme, Text} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {PROD_URL} from '../helper/APIUtils';
import {hp} from '../helper/Metric';

const TabBar = ({state, descriptors, navigation}: any) => {
  const isDarkMode = useColorScheme() === 'dark';

  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const {data: unreadCount = 0} = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const res = await axios.get(`${PROD_URL}/notification/unread-count?role=1`);
      return res.data?.unreadCount || 0;
    },
    enabled: !!user_token && isConnected,
  });

  return (
    <View style={[styles.mainContainer, isDarkMode && styles.mainContainerDark]}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
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
          <Pressable key={index} onPress={onPress} style={styles.tabItem}>
            <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
              {label === 'Article' && (
                <Ionicons
                  name={isFocused ? "home" : "home-outline"}
                  size={28}
                  color={isFocused 
                    ? (isDarkMode ? '#4ACDFF' : '#2563EB') 
                    : (isDarkMode ? '#94A3B8' : '#555')}
                />
              )}

              {label === 'Podcast' && (
                <FontAwesome
                  name="podcast"
                  size={28}
                  color={isFocused 
                    ? (isDarkMode ? '#4ACDFF' : '#2563EB') 
                    : (isDarkMode ? '#94A3B8' : '#555')}
                />
              )}

              {label === 'Notification' && (
                <View>
                  <Ionicons
                    name={isFocused ? "notifications" : "notifications-outline"}
                    size={28}
                    color={isFocused 
                      ? (isDarkMode ? '#4ACDFF' : '#2563EB') 
                      : (isDarkMode ? '#94A3B8' : '#555')}
                  />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {label === 'Report' && (
                <MaterialIcons
                  name="report"
                  size={28}
                  color={isFocused 
                    ? (isDarkMode ? '#4ACDFF' : '#2563EB') 
                    : (isDarkMode ? '#94A3B8' : '#555')}
                />
              )}

              {label === 'Profile' && (
                <MaterialIcons
                  name={isFocused ? "person" : "person-outline"}
                  size={28}
                  color={isFocused 
                    ? (isDarkMode ? '#4ACDFF' : '#2563EB') 
                    : (isDarkMode ? '#94A3B8' : '#555')}
                />
              )}
            </View>

            {/* Active Indicator */}
            {isFocused && <View style={styles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: hp(4),
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    height: hp(9.5),
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 100,
  },

  mainContainerDark: {
    backgroundColor: '#1C2533',
  },

  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(1),
  },

  iconContainer: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },

  iconContainerActive: {
    backgroundColor: '#EFF6FF',
  },

  activeIndicator: {
    position: 'absolute',
    bottom: hp(1.6),
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
});