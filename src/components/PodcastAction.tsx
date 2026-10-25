import React from 'react';
import {Check, CheckCircle, XCircle} from '@tamagui/lucide-icons';
import {Button, SizableText, XStack, YStack, Separator} from 'tamagui';
import {hp} from '../helper/Metric';
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
      marginHorizontal={16}
      marginVertical={12}
      backgroundColor="#1C2533"
      borderRadius={20}
      padding={hp(1.5)}
      borderWidth={1}
      borderColor="#334155"
      shadowColor="#000"
      shadowOffset={{width: 0, height: 8}}
      shadowOpacity={0.3}
      shadowRadius={18}
      elevation={12}>
      
      {/* Subtle Top Accent */}
      <Separator marginBottom={hp(2)} borderColor="#334155" />

      {status === StatusEnum.PUBLISHED ? (
        <SizableText
          size="$5"
          color="#94A3B8"
          textAlign="center"
          fontWeight="600"
          paddingVertical={hp(2)}>
          This content is already published.
        </SizableText>
      ) : (
        <XStack justifyContent="space-around" alignItems="center" gap="$3">
          {/* Pick Button */}
          {status === StatusEnum.REVIEW_PENDING && (
            <ActionButton
              icon={<Check size={30} color="#34D399" />}
              label="PICK"
              color="#34D399"
              click={pick}
            />
          )}

          {/* Approve & Discard (For Assigned Content) */}
          {status !== StatusEnum.REVIEW_PENDING && 
           status !== StatusEnum.PUBLISHED && 
           admin_id === user_id && (
            <>
              <ActionButton
                icon={<CheckCircle size={30} color="#4ACDFF" />}
                label="APPROVE"
                color="#4ACDFF"
                click={approve}
              />

              <ActionButton
                icon={<XCircle size={30} color="#F87171" />}
                label="DISCARD"
                color="#F87171"
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
        backgroundColor="#1C2533"
        borderWidth={2.5}
        borderColor={color}
        pressStyle={{opacity: 0.85}}
        onPress={click}
        elevation={6}
        shadowColor={color}
        shadowOffset={{width: 0, height: 4}}
        shadowOpacity={0.3}
        shadowRadius={10}>
        {icon}
      </Button>

      <SizableText
        size="$3"
        fontWeight="700"
        color={color}
        textTransform="uppercase"
        letterSpacing={0.8}>
        {label}
      </SizableText>
    </YStack>
  );
};
