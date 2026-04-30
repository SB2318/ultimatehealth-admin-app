import React, {useEffect, useState} from 'react';
import {Sheet, YStack, XStack, Text, Button} from 'tamagui';
import {Ionicons} from '@expo/vector-icons';
import Editor from './Editor';
import {ON_PRIMARY_COLOR} from '../helper/Theme';

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
  }, [visible]);

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={(isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) dismiss();
      }}
      snapPoints={[62]}
      dismissOnSnapToBottom
      animation="medium"
      zIndex={100000}>
      
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.75)"
        enterStyle={{opacity: 0}}
        exitStyle={{opacity: 0}}
      />

      <Sheet.Handle backgroundColor="$gray6" height={5} width={40} />

      <Sheet.Frame
        backgroundColor={ON_PRIMARY_COLOR}
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        flex={1}
        paddingHorizontal="$5"
        paddingTop="$3"
        paddingBottom="$5">

        {/* Compact Header */}
        <XStack 
          alignItems="center" 
          justifyContent="space-between"
          marginBottom="$4">
          
          <Text
            fontSize={21}
            fontWeight="700"
            color={"#1F2024"}
            letterSpacing={-0.3}>
            Discard Content
          </Text>

          {/* Close Button - Fixed Positioning */}
          <Button
            size="$4"
            circular
            backgroundColor="$gray3"
            pressStyle={{scale: 0.92}}
            onPress={dismiss}
            icon={
              <Ionicons name="close" size={24} color="$gray11" />
            }
          />
        </XStack>

        {/* Subtitle */}
        <Text 

          fontSize={15} 
          color="$gray600" 
          marginBottom="$5">
          Please provide a clear reason for discarding this content
        </Text>

        {/* Editor takes maximum space */}
        <YStack flex={1}>
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