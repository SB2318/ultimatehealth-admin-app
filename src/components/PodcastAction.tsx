import {Check, CheckCircle, XCircle} from '@tamagui/lucide-icons';
import {Button, SizableText, XStack, YStack} from 'tamagui';
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
    <XStack
      position="absolute"
      bottom={hp(10)}
      left={wp(6)}
      right={wp(6)}
      backgroundColor="$backgroundStrong"
      padding="$4"
      borderRadius="$10"
      justifyContent="space-around"
      alignItems="center"
      elevation="$5"
      borderWidth={1}
      borderColor="$borderColor">
      {status === StatusEnum.REVIEW_PENDING && (
        <ActionButton
          icon={<Check size="$4" color="$green10" />}
          label="PICK"
          color="$green10"
          click={pick}
        />
      )}

      {status !== StatusEnum.REVIEW_PENDING &&
        status !== StatusEnum.PUBLISHED &&
        admin_id === user_id && (
          <ActionButton
            icon={<CheckCircle size="$2" color="$blue10" />}
            label="APPROVED"
            color="$blue10"
            click={approve}
          />
        )}

      {status !== StatusEnum.REVIEW_PENDING &&
        status !== StatusEnum.PUBLISHED &&
        admin_id === user_id && (
          <ActionButton
            icon={<XCircle size="$2" color="$red10" />}
            label="DISCARD"
            color="$red10"
            click={discard}
          />
        )}
    </XStack>
  );
};

type ActionButtonProps = {
  icon: any;
  label: string;
  color: string;
  click: ()=> void
};

const ActionButton = ({icon, label, color, click}: ActionButtonProps) => {
  return (
    <YStack alignItems="center" gap="$1">
      <Button
        circular
        size="$5"
        backgroundColor="$backgroundTransparent"
        icon={icon}
        onPress={click}
        borderWidth={2}
        borderColor={color}
        pressStyle={{opacity: 0.7, scale: 0.95}}
        scaleIcon={1.2}
      />
      <SizableText size="$1" fontWeight="700" color={color}>
        {label}
      </SizableText>
    </YStack>
  );
};
