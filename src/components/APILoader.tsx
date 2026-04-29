import React from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';

import { YStack, Text, Card } from 'tamagui';
import { PRIMARY_COLOR } from '../helper/Theme';

const { width, height } = Dimensions.get('window');

interface APILoaderProps {
  message?: string;
  visible?: boolean;
}

export default function APILoader({
  message = 'Please wait...',
  visible = true,
}: APILoaderProps) {
  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(255, 255, 255, 0.92)"
      alignItems="center"
      justifyContent="center"
      zIndex={999}
      style={{ elevation: 20 }}
    >
      <Card
        padding="$6"
        borderRadius={20}
        backgroundColor="white"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 10 }}
        shadowOpacity={0.12}
        shadowRadius={25}
        elevate
        alignItems="center"
        justifyContent="center"
        width={width > 400 ? 280 : '80%'}
      >
        <YStack alignItems="center" gap="$4">
          {/* Loader */}
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />

          {/* Message */}
          <Text
            fontSize={16}
            fontWeight="600"
            color="#374151"
            textAlign="center"
            marginTop="$2">
            {message}
          </Text>

          <Text fontSize={13} color="#64748b" textAlign="center">
            Loading data...
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
}