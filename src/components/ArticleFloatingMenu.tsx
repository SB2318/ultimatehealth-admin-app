import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome5';

interface ArticleFloatingMenuProps {
  items: Item[];
  top: number;
  left: number;
  arrowPosition?: number; // 0 to 1 (percentage of width)
  onClose?: () => void;   // Optional callback when menu is dismissed
}

interface Item {
  name: string;
  action: () => void;
  icon: string;
  color?: string;
}

export default function ArticleFloatingMenu({
  items,
  top,
  left,
  arrowPosition = 0.3,
}: ArticleFloatingMenuProps) {
  return (
    <View style={[styles.container, { top, left }]}>
      {/* Arrow */}
      <View
        style={[
          styles.arrow,
          { left: `${arrowPosition * 100}%` },
        ]}
      />

      {/* Menu Items */}
      {items.map((item, index) => (
        <Pressable
          key={index}
          style={({ pressed }) => [
            styles.item,
            pressed && styles.itemPressed,
          ]}
          onPress={item.action}
          android_ripple={{ color: '#e5e5e5', borderless: false }}
        >
          <FontAwesome
            name={item.icon}
            size={18}
            color={item.color || '#1a1a1a'}
            style={styles.icon}
          />
          <Text style={styles.text}>{item.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '92%',
    maxWidth: 280,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    // Modern shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },

  arrow: {
    position: 'absolute',
    top: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
    transform: [{ translateX: -12 }],
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },

  itemPressed: {
    backgroundColor: '#f8f9fa',
  },

  icon: {
    width: 24,
    textAlign: 'center',
  },

  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c1c1e',
    marginLeft: 14,
    flex: 1,
  },
});