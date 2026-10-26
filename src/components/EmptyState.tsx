import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  Fontisto,
} from '@expo/vector-icons';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  TEXT_PRIMARY,
  TEXT_MUTED,
  DARK_THEME,
} from '../helper/Theme';

export interface EmptyStateProps {
  icon?: string;
  iconType?: 'feather' | 'material' | 'ionicons' | 'fontisto';
  badge?: string;
  title: string;
  subtitle: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: string;
}

export default function EmptyState({
  icon = 'inbox',
  iconType = 'feather',
  badge,
  title,
  subtitle,
  actionText,
  onAction,
  actionIcon,
}: EmptyStateProps) {
  const isDarkMode = useColorScheme() === 'dark';

  const renderIcon = () => {
    const iconColor = isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR;
    const iconSize = 34;

    const resolvedType =
      iconType === 'feather' && (icon.includes('-outline') || icon.includes('-sharp'))
        ? 'ionicons'
        : iconType;

    switch (resolvedType) {
      case 'material':
        return (
          <MaterialCommunityIcons
            name={icon as any}
            size={iconSize}
            color={iconColor}
          />
        );
      case 'ionicons':
        return <Ionicons name={icon as any} size={iconSize} color={iconColor} />;
      case 'fontisto':
        return <Fontisto name={icon as any} size={iconSize - 4} color={iconColor} />;
      case 'feather':
      default:
        return <Feather name={icon as any} size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Outer Glow Ring */}
      <View
        style={[
          styles.outerRing,
          {
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#F0F9FF',
            borderColor: isDarkMode ? '#334155' : '#E0F2FE',
          },
        ]}>
        {/* Inner Icon Circle */}
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#E0F2FE',
              borderColor: isDarkMode ? '#475569' : '#BAE6FD',
            },
          ]}>
          {renderIcon()}
        </View>
      </View>

      {/* Optional Badge */}
      {badge && (
        <View
          style={[
            styles.badgeWrap,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
            },
          ]}>
          <Text
            style={[
              styles.badgeText,
              {color: isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR},
            ]}>
            {badge.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Title */}
      <Text
        style={[
          styles.title,
          {color: isDarkMode ? DARK_THEME.textPrimary : TEXT_PRIMARY},
        ]}>
        {title}
      </Text>

      {/* Subtitle */}
      <Text
        style={[
          styles.subtitle,
          {color: isDarkMode ? DARK_THEME.textMuted : TEXT_MUTED},
        ]}>
        {subtitle}
      </Text>

      {/* Optional Action Button */}
      {actionText && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.85}>
          {actionIcon && (
            <Feather
              name={actionIcon as any}
              size={16}
              color="#FFFFFF"
              style={styles.actionIcon}
            />
          )}
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  outerRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  innerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 290,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 18,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
