import React, {useEffect, useState} from 'react';
import {Sheet, YStack, XStack, Text, Button} from 'tamagui';
import {Ionicons} from '@expo/vector-icons';
import Editor from './Editor';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';

type Props = {
  visible: boolean;
  callback: (reason: string) => void;
  dismiss: () => void;
};

export default function DiscardReasonModal({
  visible,
  callback,
  dismiss,
}: Props) {
  const [open, setOpen] = useState(visible);

  useEffect(() => {
    setOpen(visible);
    console.log('Visible modal', visible);
  }, [visible]);
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(isOpen: any) => {
        setOpen(isOpen);
        if (!isOpen) {
          dismiss();
        }
      }}
      snapPoints={[55, 50, 25]}
      dismissOnSnapToBottom
      animation="medium"
      zIndex={100_000}>
      <Sheet.Overlay
        // animation="lazy"
        enterStyle={{opacity: 0}}
        exitStyle={{opacity: 0}}
        backgroundColor="rgba(0,0,0,0.5)"
      />

      {/* Built-in Handle for better UX */}
      <Sheet.Handle />

      <Sheet.Frame
        paddingHorizontal="$4"
        paddingBottom="$6"
        borderTopLeftRadius="$7"
        borderColor={PRIMARY_COLOR}
        borderTopRightRadius="$7"
        backgroundColor={ON_PRIMARY_COLOR}
        >
        {/* Header Section */}
        <YStack marginTop="$2" marginBottom="$4" gap="$1.5">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Text
                fontSize="$5"
                color="$gray700"
                fontWeight={'700'}
                marginTop="$-1">
                Discard Reason
              </Text>
            </YStack>

            <Button
              size="$5"
              circular
              backgroundColor="$gray3"
              hoverStyle={{backgroundColor: '$red10'}}
              pressStyle={{scale: 0.95}}
              onPress={dismiss}
              icon={<Ionicons name="close" size={20} color="var(--gray11)" />}
            />
            
          </XStack>
        </YStack>

        {/* Editor Wrapper */}
        <YStack flex={1} paddingTop="$1">
          <Editor
            callback={(reason: string) => {
              callback(reason);
              dismiss();
            }}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
