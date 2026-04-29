import React, { useEffect, useState } from 'react';
import { Modal, Dimensions } from 'react-native';

import { YStack, Text, Input, Button, XStack, Card } from 'tamagui';

import { PRIMARY_COLOR } from '../helper/Theme';
import { Category, Reason } from '../type';

interface Props {
  type: number;           // 1 = Tag, 2 = Reason
  mode: 'add' | 'edit';   // ← New Prop
  reason: Reason | null;
  tag: Category | null;
  onTagChange: (tag: Category | null, name: string) => void;
  onReasonChange: (reason: Reason | null, name: string) => void;
  visible: boolean;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export default function AddTagModal({
  type,
  mode,
  reason,
  tag,
  visible,
  onTagChange,
  onReasonChange,
  onDismiss,
}: Props) {
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (mode === 'edit') {
      if (type === 1 && tag) setInputValue(tag.name);
      else if (type === 2 && reason) setInputValue(reason.reason);
    } else {
      setInputValue('');
    }
  }, [mode, reason, tag, type, visible]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    if (type === 1) {
      onTagChange(tag, inputValue.trim());
    } else if (type === 2) {
      onReasonChange(reason, inputValue.trim());
    }

    setInputValue('');
    onDismiss();
  };

  // Dynamic Title & Subtitle
  const getTitle = () => {
    if (type === 1) {
      return mode === 'add' ? 'Add New Tag' : 'Edit Tag';
    } else {
      return mode === 'add' ? 'Add New Reason' : 'Edit Reason';
    }
  };

  const getSubtitle = () => {
    if (type === 1) {
      return mode === 'add'
        ? 'Create a new tag for content categorization'
        : 'Update existing tag name';
    } else {
      return mode === 'add'
        ? 'Create a new rejection reason'
        : 'Update existing reason';
    }
  };

  const placeholder =
    type === 1
      ? 'Enter tag name (e.g., Health, Technology, Finance)'
      : 'Enter reason (e.g., Spam, Duplicate, Offensive, Misleading)';

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onDismiss}
      statusBarTranslucent>
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.6)"
        justifyContent="center"
        alignItems="center"
        padding="$4">
        <Card
          width={width > 400 ? 380 : '100%'}
          padding="$5"
          borderRadius={16}
          backgroundColor="white"
          elevate
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 10 }}
          shadowOpacity={0.18}
          shadowRadius={24}>
          <YStack gap="$4">
            {/* Header */}
            <Text
              fontSize={20}
              fontWeight="700"
              color="#1f2937"
              textAlign="center">
              {getTitle()}
            </Text>

            <Text fontSize={14} color="#64748b" textAlign="center">
              {getSubtitle()}
            </Text>

            {/* Input Field */}
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="600" color="#374151">
                {type === 1 ? 'Tag Name' : 'Reason'}
              </Text>
              <Input
                value={inputValue}
                onChangeText={(text)=>{
                  setInputValue(text.nativeEvent.text)
                }}
                placeholder={placeholder}
                height={52}
                borderWidth={1.5}
                borderColor="#e2e8f0"
                focusStyle={{ borderColor: PRIMARY_COLOR }}
                borderRadius={12}
                backgroundColor="#f8fafc"
  
              />
            </YStack>

            {/* Buttons */}
            <XStack gap="$3" marginTop="$2">
              <Button
                flex={1}
                height={52}
                borderRadius={12}
                backgroundColor="white"
                borderWidth={1.5}
                borderColor="#e2e8f0"
                onPress={onDismiss}
                pressStyle={{ opacity: 0.9 }}>
                <Text color="#64748b" fontWeight="600">
                  Cancel
                </Text>
              </Button>

              <Button
                flex={1}
                height={52}
                borderRadius={12}
                backgroundColor={PRIMARY_COLOR}
                onPress={handleSubmit}
                disabled={!inputValue.trim()}
                opacity={!inputValue.trim() ? 0.6 : 1}
                pressStyle={{ scale: 0.98 }}>
                <Text color="white" fontWeight="600" fontSize={16}>
                  {mode === 'add' ? 'Add' : 'Save Changes'}
                </Text>
              </Button>
            </XStack>
          </YStack>
        </Card>
      </YStack>
    </Modal>
  );
}