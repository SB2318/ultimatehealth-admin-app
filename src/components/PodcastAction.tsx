import React from 'react';
import {Check, CheckCircle, XCircle} from '@tamagui/lucide-icons';
import {Button, SizableText, XStack, YStack, Separator} from 'tamagui';
import {hp, wp} from '../helper/Metric';
import {StatusEnum} from '../helper/Utils';

type ActionProps = {
  status: string;
  admin_id: string;
  user_id: string;
  pick: () => void;
  approve: () => void;
  discard: () => void;
};

export const ActionButtonBar = ({
  status,
  admin_id,
  user_id,
  pick,
  approve,
  discard,
}: ActionProps) => {
  return (
    <YStack
      position="absolute"
      bottom={hp(3)}
      left={wp(5)}
      right={wp(5)}
      backgroundColor="$background"
      borderRadius={20}
      padding={hp(2)}
      elevation={12}
      borderWidth={1}
      borderColor="$borderColor"
      shadowColor="#000"
      shadowOffset={{width: 0, height: 8}}
      shadowOpacity={0.12}
      shadowRadius={20}>
      
      {/* Subtle Separator at Top */}
      <Separator marginBottom={hp(1.5)} />

      {status === StatusEnum.PUBLISHED ? (
        <SizableText
          size="$4"
          color="$gray10"
          textAlign="center"
          fontWeight="600"
          paddingVertical={hp(1)}>
          This content is already published. No further action needed.
        </SizableText>
      ) : (
        <XStack justifyContent="space-around" alignItems="center" gap={wp(2)}>
          {/* Pick Button - Only for Review Pending */}
          {status === StatusEnum.REVIEW_PENDING && (
            <ActionButton
              icon={<Check size={28} color="#10B981" />}
              label="PICK"
              color="#10B981"
              click={pick}
            />
          )}

          {/* Approve & Discard - For Assigned Content */}
          {status !== StatusEnum.REVIEW_PENDING &&
            status !== StatusEnum.PUBLISHED &&
            admin_id === user_id && (
              <>
                <ActionButton
                  icon={<CheckCircle size={28} color="#3B82F6" />}
                  label="APPROVE"
                  color="#3B82F6"
                  click={approve}
                />

                <ActionButton
                  icon={<XCircle size={28} color="#EF4444" />}
                  label="DISCARD"
                  color="#EF4444"
                  click={discard}
                />
              </>
            )}
        </XStack>
      )}
    </YStack>
  );
};

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  color: string;
  click: () => void;
};

const ActionButton = ({icon, label, color, click}: ActionButtonProps) => {
  return (
    <YStack alignItems="center" gap="$2">
      <Button
        circular
        size="$6"
        backgroundColor="white"
        borderWidth={2.5}
        borderColor={color}
        pressStyle={{scale: 0.92, opacity: 0.85}}
        onPress={click}
        elevation={4}
        shadowColor={color}
        shadowOffset={{width: 0, height: 3}}
        shadowOpacity={0.2}
        shadowRadius={8}>
        {icon}
      </Button>

      <SizableText
        size="$3"
        fontWeight="700"
        color={color}
        textTransform="uppercase"
        letterSpacing={0.5}>
        {label}
      </SizableText>
    </YStack>
  );
};