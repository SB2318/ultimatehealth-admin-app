import React from 'react';
import {View, Pressable, StyleSheet, useColorScheme, Text, Platform} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {PROD_URL} from '../helper/APIUtils';
import {
  PRIMARY_COLOR,
  DARK_THEME,
  CLINICAL_SHADOW,
} from '../helper/Theme';

const TabBar = ({state, descriptors, navigation}: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = React.useContext(SafeAreaInsetsContext);

  const {user_token, isSuperAdmin} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const {data: unreadCount = 0} = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const res = await axios.get(`${PROD_URL}/notification/unread-count?role=1`);
      return res.data?.unreadCount || 0;
    },
    enabled: !!user_token && isConnected,
    staleTime: 1000 * 60, // Cache for 1 minute to avoid constant re-fetching
  });

  // Safe bottom offset that never results in NaN or crashes if context is initially unmeasured
  const bottomInset =
    insets && typeof insets.bottom === 'number' && !isNaN(insets.bottom)
      ? insets.bottom
      : Platform.OS === 'android'
      ? 16
      : 8;
  const bottomOffset = Math.max(bottomInset + 8, 14);

  return (
    <View style={[styles.mainContainer, {bottom: bottomOffset}, isDarkMode && styles.mainContainerDark]}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
        const label = typeof rawLabel === 'string' ? rawLabel : route.name;
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
              {label === 'Dashboard' && (
                <Ionicons
                  name={isFocused ? 'grid' : 'grid-outline'}
                  size={23}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}

              {label === 'Article' && (
                <Ionicons
                  name={isFocused ? 'document-text' : 'document-text-outline'}
                  size={23}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}

              {label === 'Podcast' && (
                <FontAwesome
                  name="podcast"
                  size={23}
                  color={isFocused ? activeColor : inactiveColor}
                />
              )}

              {label === 'Report' && (
                <Ionicons
                  name={isFocused ? 'shield' : 'shield-outline'}
                  size={23}
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
              {label === 'Profile' && isSuperAdmin ? 'Executive' : label}
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
    left: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    height: 68,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...CLINICAL_SHADOW,
    elevation: 12,
    zIndex: 100,
    alignItems: 'center',
    paddingHorizontal: 4,
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
    paddingVertical: 2,
  },

  iconContainer: {
    width: 42,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  iconContainerActive: {
    backgroundColor: '#ECFEFF', // Subtle clinical cyan wash
  },

  iconContainerActiveDark: {
    backgroundColor: '#0C2B4E',
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.1,
  },

  labelActive: {
    fontWeight: '800',
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