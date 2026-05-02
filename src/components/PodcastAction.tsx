// import React from 'react';
// import {Check, CheckCircle, XCircle} from '@tamagui/lucide-icons';
// import {Button, SizableText, XStack, YStack, Separator} from 'tamagui';
// import {hp, wp} from '../helper/Metric';
// import {StatusEnum} from '../helper/Utils';

// type ActionProps = {
//   status: string;
//   admin_id: string;
//   user_id: string;
//   pick: () => void;
//   approve: () => void;
//   discard: () => void;
// };

// export const ActionButtonBar = ({
//   status,
//   admin_id,
//   user_id,
//   pick,
//   approve,
//   discard,
// }: ActionProps) => {
//   return (
//     <YStack
//       position="absolute"
//       bottom={hp(3)}
//       left={wp(5)}
//       right={wp(5)}
//       backgroundColor="$background"
//       borderRadius={20}
//       padding={hp(2)}
//       elevation={12}
//       borderWidth={1}
//       borderColor="$borderColor"
//       shadowColor="#000"
//       shadowOffset={{width: 0, height: 8}}
//       shadowOpacity={0.12}
//       shadowRadius={20}>
      
//       {/* Subtle Separator at Top */}
//       <Separator marginBottom={hp(1.5)} />

//       {status === StatusEnum.PUBLISHED ? (
//         <SizableText
//           size="$4"
//           color="$gray10"
//           textAlign="center"
//           fontWeight="600"
//           paddingVertical={hp(1)}>
//           This content is already published. No further action needed.
//         </SizableText>
//       ) : (
//         <XStack justifyContent="space-around" alignItems="center" gap={wp(2)}>
//           {/* Pick Button - Only for Review Pending */}
//           {status === StatusEnum.REVIEW_PENDING && (
//             <ActionButton
//               icon={<Check size={28} color="#10B981" />}
//               label="PICK"
//               color="#10B981"
//               click={pick}
//             />
//           )}

//           {/* Approve & Discard - For Assigned Content */}
//           {status !== StatusEnum.REVIEW_PENDING &&
//             status !== StatusEnum.PUBLISHED &&
//             admin_id === user_id && (
//               <>
//                 <ActionButton
//                   icon={<CheckCircle size={28} color="#3B82F6" />}
//                   label="APPROVE"
//                   color="#3B82F6"
//                   click={approve}
//                 />

//                 <ActionButton
//                   icon={<XCircle size={28} color="#EF4444" />}
//                   label="DISCARD"
//                   color="#EF4444"
//                   click={discard}
//                 />
//               </>
//             )}
//         </XStack>
//       )}
//     </YStack>
//   );
// };

// type ActionButtonProps = {
//   icon: React.ReactNode;
//   label: string;
//   color: string;
//   click: () => void;
// };

// const ActionButton = ({icon, label, color, click}: ActionButtonProps) => {
//   return (
//     <YStack alignItems="center" gap="$2">
//       <Button
//         circular
//         size="$6"
//         backgroundColor="white"
//         borderWidth={2.5}
//         borderColor={color}
//         pressStyle={{scale: 0.92, opacity: 0.85}}
//         onPress={click}
//         elevation={4}
//         shadowColor={color}
//         shadowOffset={{width: 0, height: 3}}
//         shadowOpacity={0.2}
//         shadowRadius={8}>
//         {icon}
//       </Button>

//       <SizableText
//         size="$3"
//         fontWeight="700"
//         color={color}
//         textTransform="uppercase"
//         letterSpacing={0.5}>
//         {label}
//       </SizableText>
//     </YStack>
//   );
// };

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
      //position="absolute"
      bottom={hp(1)}
      left={wp(2)}
      right={wp(4)}
      backgroundColor="#1C2533"
      borderRadius={20}
      padding={hp(1.5)}
      borderWidth={1}
      borderColor="#334155"
      shadowColor="#000"
      shadowOffset={{width: 0, height: 12}}
      shadowOpacity={0.35}
      shadowRadius={25}
      elevation={20}>
      
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
        <XStack justifyContent="space-around" alignItems="center" gap={wp(3)}>

          {/* Pick Button */}
          {status === StatusEnum.REVIEW_PENDING && (
            <ActionButton
              icon={<Check size={32} color="#34D399" />}
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
                icon={<CheckCircle size={32} color="#4ACDFF" />}
                label="APPROVE"
                color="#4ACDFF"
                click={approve}
              />

              <ActionButton
                icon={<XCircle size={32} color="#F87171" />}
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
    <YStack alignItems="center" gap="$2.5">
      <Button
        circular
        size="$7"
        backgroundColor="#1C2533"
        borderWidth={3}
        borderColor={color}
        pressStyle={{scale: 0.9, opacity: 0.85}}
        onPress={click}
        elevation={10}
        shadowColor={color}
        shadowOffset={{width: 0, height: 6}}
        shadowOpacity={0.4}
        shadowRadius={15}>
        {icon}
      </Button>

      <SizableText
        size="$4"
        fontWeight="700"
        color={color}
        textTransform="uppercase"
        letterSpacing={1}>
        {label}
      </SizableText>
    </YStack>
  );
};