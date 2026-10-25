import React from 'react';
import {StyleSheet, Text, View, useColorScheme} from 'react-native';
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import {
  PRIMARY_COLOR,
  TEXT_PRIMARY,
  TEXT_MUTED,
  DARK_THEME,
} from '../helper/Theme';

interface EmptyStateProps {
  icon?: string;
  iconType?: 'feather' | 'material';
  title: string;
  subtitle: string;
}

export default function EmptyState({
  icon = 'inbox',
  iconType = 'feather',
  title,
  subtitle,
}: EmptyStateProps) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {backgroundColor: isDarkMode ? '#1E293B' : '#EFF6FF'},
        ]}>
        {iconType === 'material' ? (
          <MaterialCommunityIcons
            name={icon as any}
            size={36}
            color={isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR}
          />
        ) : (
          <Feather
            name={icon as any}
            size={32}
            color={isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR}
          />
        )}
      </View>
      <Text
        style={[
          styles.title,
          {color: isDarkMode ? DARK_THEME.textPrimary : TEXT_PRIMARY},
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {color: isDarkMode ? DARK_THEME.textMuted : TEXT_MUTED},
        ]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 290,
  },
});
