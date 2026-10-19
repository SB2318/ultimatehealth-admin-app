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
import {
  PRIMARY_COLOR,
  DARK_THEME,
  CLINICAL_SHADOW,
} from '../helper/Theme';

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

        const activeColor = isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR;
        const inactiveColor = isDarkMode ? DARK_THEME.textMuted : '#64748B';

        return (
          <Pressable key={index} onPress={onPress} style={styles.tabItem}>
            <View
              style={[
                styles.iconContainer,
                isFocused && (isDarkMode ? styles.iconContainerActiveDark : styles.iconContainerActive),
              ]}>
              {label === 'Article' && (
                <Ionicons
                  name={isFocused ? 'document-text' : 'document-text-outline'}
                  size={24}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}

              {label === 'Podcast' && (
                <FontAwesome
                  name="podcast"
                  size={24}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}

              {label === 'Notification' && (
                <View>
                  <Ionicons
                    name={isFocused ? 'notifications' : 'notifications-outline'}
                    size={24}
                    color={isFocused ? activeColor : inactiveColor}
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
                  name={isFocused ? 'shield' : 'shield-outlined'}
                  size={24}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}

              {label === 'Profile' && (
                <MaterialIcons
                  name={isFocused ? 'person' : 'person-outline'}
                  size={24}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}
            </View>

            {/* Micro pill label or active indicator */}
            <Text
              style={[
                styles.label,
                {color: isFocused ? activeColor : inactiveColor},
                isFocused && styles.labelActive,
              ]}>
              {label}
            </Text>
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
    bottom: hp(2.5),
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    height: hp(8.2),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...CLINICAL_SHADOW,
    elevation: 8,
    zIndex: 100,
  },

  mainContainerDark: {
    backgroundColor: '#131B2E',
    borderColor: '#263352',
    shadowColor: '#000000',
  },

  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },

  iconContainer: {
    width: 44,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  iconContainerActive: {
    backgroundColor: '#ECFEFF', // Subtle clinical cyan wash
  },

  iconContainerActiveDark: {
    backgroundColor: '#0C2B4E',
  },

  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },

  labelActive: {
    fontWeight: '700',
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#DC2626',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 3,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});