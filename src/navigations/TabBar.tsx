import React from 'react';
import {View, Pressable, StyleSheet, useColorScheme, Text} from 'react-native';
import {FontAwesome, Ionicons} from '@expo/vector-icons';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import {PRIMARY_COLOR} from '../helper/Theme';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useSelector} from 'react-redux';
import {PROD_URL} from '../helper/APIUtils';
import {hp} from '../helper/Metric';

const TabBar = ({state, descriptors, navigation}: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const {data: unreadCount = 0} = useQuery({
    queryKey: ['get-unread-notifications-count'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${PROD_URL}/notification/unread-count?role=1`);
        return response.data?.unreadCount || 0;
      } catch (err) {
        return 0;
      }
    },
    enabled: !!user_token && !!isConnected,
  });

  useFocusEffect(() => {
    // Optional: refetch logic if needed
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
          <Pressable
            key={index}
            onPress={onPress}
            style={styles.tabItem}>
            <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
              {label === 'Article' && (
                <Ionicons
                  name={isFocused ? "home" : "home-outline"}
                  size={26}
                  color={isFocused ? 'white' : isDarkMode ? '#ddd' : '#555'}
                />
              )}

              {label === 'Podcast' && (
                <FontAwesome
                  name="podcast"
                  size={26}
                  color={isFocused ? 'white' : isDarkMode ? '#ddd' : '#555'}
                />
              )}

              {label === 'Notification' && (
                <View>
                  <Ionicons
                    name={isFocused ? "notifications" : "notifications-outline"}
                    size={26}
                    color={isFocused ? 'white' : isDarkMode ? '#ddd' : '#555'}
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
                <MaterialIcon
                  name="report"
                  size={26}
                  color={isFocused ? 'white' : isDarkMode ? '#ddd' : '#555'}
                />
              )}

              {label === 'Profile' && (
                <MaterialIcon
                  name={isFocused ? "person" : "person-outline"}
                  size={26}
                  color={isFocused ? 'white' : isDarkMode ? '#ddd' : '#555'}
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
    bottom: hp(3),
    left: 0,
    right: 0,
    backgroundColor: 'white',
    height: hp(9),
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 100,
  },

  mainContainerDark: {
    backgroundColor: '#1A1A1A',
  },

  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(1),
  },

  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },

  iconContainerActive: {
    backgroundColor: PRIMARY_COLOR,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderRadius: 46,
  },

  activeIndicator: {
    position: 'absolute',
    bottom: hp(1.2),
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_COLOR,
  },

  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },

  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
});