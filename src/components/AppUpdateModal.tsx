import React from 'react';
import { Modal, Linking, Dimensions } from 'react-native';

import { YStack, Text, Button, Card, XStack } from 'tamagui';
import { PRIMARY_COLOR } from '../helper/Theme';
import { ArrowUpCircle } from '@tamagui/lucide-icons';   // ← Icon added

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  storeUrl: string;
  onDismiss?: () => void;       
  isForceUpdate?: boolean;       
}

export default function UpdateModal({
  visible,
  storeUrl,
  onDismiss,
  isForceUpdate = true,
}: Props) {
  const handleUpdate = () => {
    Linking.openURL(storeUrl);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}} 
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.65)"
        justifyContent="center"
        alignItems="center"
        padding="$4"
      >
        <Card
          width={width > 400 ? 360 : '100%'}
          padding="$6"
          borderRadius={20}
          backgroundColor="white"
          elevate
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 12 }}
          shadowOpacity={0.18}
          shadowRadius={30}
        >
          <YStack alignItems="center" gap="$4">
            {/* Icon */}
            <ArrowUpCircle size={62} color={PRIMARY_COLOR} />

            {/* Title */}
            <Text fontSize={22} fontWeight="700" color="#1f2937" textAlign="center">
              Update Available 🚀
            </Text>

            {/* Message */}
            <Text fontSize={16} color="#64748b" textAlign="center" lineHeight={22}>
              A new version of the app is available. Please update to get the latest features and improvements.
            </Text>

            {/* Buttons */}
            <XStack gap="$3" marginTop="$4" width="100%">
              {!isForceUpdate && onDismiss && (
                <Button
                  flex={1}
                  height={52}
                  borderRadius={12}
                  backgroundColor="white"
                  borderWidth={1.5}
                  borderColor="#e2e8f0"
                  onPress={onDismiss}
                  pressStyle={{ opacity: 0.9 }}
                >
                  <Text color="#64748b" fontWeight="600">
                    Later
                  </Text>
                </Button>
              )}

              <Button
                flex={1}
                height={52}
                borderRadius={12}
                backgroundColor={PRIMARY_COLOR}
                onPress={handleUpdate}
                pressStyle={{ scale: 0.98 }}
              >
                <Text color="white" fontWeight="700" fontSize={16}>
                  Update Now
                </Text>
              </Button>
            </XStack>

            <Text fontSize={12} color="#94a3b8" marginTop="$2">
              Version update required
            </Text>
          </YStack>
        </Card>
      </YStack>
    </Modal>
  );
}