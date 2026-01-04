import { Check, CheckCircle, XCircle } from '@tamagui/lucide-icons'
import { Button, SizableText, XStack, YStack } from 'tamagui';


export const ActionButtonBar = () => {
  return (
    <XStack
      position="absolute"
      bottom={40}
      left={20}
      right={20}
      backgroundColor="$backgroundStrong"
      padding="$4"
      borderRadius="$10"
      justifyContent="space-around"
      alignItems="center"
      elevation="$5"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <ActionButton
        icon={<Check size="$2" color="$green10" />}
        label="PICK"
        color="$green10"
      />

      <ActionButton
        icon={<CheckCircle size="$2" color="$blue10" />}
        label="APPROVED"
        color="$blue10"
      />

      <ActionButton
        icon={<XCircle size="$2" color="$red10" />}
        label="DISCARD"
        color="$red10"
      />
    </XStack>
  )
}

type ActionButtonProps = {
  icon: any
  label: string
  color: string
}


const ActionButton = ({ icon, label, color }: ActionButtonProps) => {
  return (
    <YStack alignItems="center" space="$1">
      <Button
        circular
        size="$5"
        backgroundColor="$backgroundTransparent"
        icon={icon}
        borderWidth={2}
        borderColor={color}
        pressStyle={{ opacity: 0.7, scale: 0.95 }}
        scaleIcon={1.2}
      />
      <SizableText size="$1" fontWeight="700" color={color}>
        {label}
      </SizableText>
    </YStack>
  )
}
