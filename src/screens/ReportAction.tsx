// import React, {useState} from 'react';
// import {
//   View,
//   ScrollView,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   TextInput,
// } from 'react-native';
// import {useSelector} from 'react-redux';
// import axios from 'axios';
// import Loader from '../components/Loader';
// import {useMutation} from '@tanstack/react-query';
// import {RadioButton} from 'react-native-paper';
// import Snackbar from 'react-native-snackbar';
// import {hp, wp} from '../helper/Metric';
// import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// import {
//   reportActionEnum,
//   reportActionMessages,
//   ReportActionScreenProp,
// } from '../type';
// import {TAKE_ACTION_ON_REPORT} from '../helper/APIUtils';
// import {SafeAreaView} from 'react-native-safe-area-context';

// export default function ReportAction({
//   navigation,
//   route,
// }: ReportActionScreenProp) {
//   const {reportId, report_admin_id} = route.params;
//   const {user_id} = useSelector((state: any) => state.user);
//   const {isConnected} = useSelector((state: any) => state.network);
//   const [dismissReason, setDismissReason] = useState<string>('');

//   const reportActions = Object.entries(reportActionMessages).map(
//     ([action, message]) => {
//       return {
//         label: action,
//         message: message,
//       };
//     },
//   );
//   const [selectedReportAction, setSelectedReportAction] = useState<{
//     label: string;
//     message: string;
//   } | null>(null);

//   //console.log(reasons[0].reason)
//   const submitReportMutation = useMutation({
//     mutationKey: ['submit-report-action'],
//     mutationFn: async (dismissReason: string) => {
//       //console.log("Url", TAKE_ACTION_ON_REPORT);

//       const res = await axios.post(TAKE_ACTION_ON_REPORT, {
//         reportId: reportId,
//         admin_id: report_admin_id,
//         action: selectedReportAction?.label,
//         dismissReason: dismissReason,
//       });

//       return res.data as any;
//     },
//     onSuccess: () => {
//       Snackbar.show({
//         text: 'Report action submitted',
//         duration: Snackbar.LENGTH_SHORT,
//       });

//       navigation.navigate('TabScreen');
//     },

//     onError: () => {
//       // console.log('Update View Count Error', error);
//       Alert.alert('Internal server error, try again!');
//     },
//   });

//   if (submitReportMutation.isPending) {
//     return <Loader />;
//   }
//   return (
//     <ScrollView style={{backgroundColor: 'white'}}>
//       <SafeAreaView style={styles.container}>
//         {reportActions?.map((reason, index) => (
//           <View key={index} style={styles.optionContainer}>
//             <RadioButton
//               value={reason.message}
//               status={
//                 selectedReportAction?.label === reason.label
//                   ? 'checked'
//                   : 'unchecked'
//               }
//               onPress={() => setSelectedReportAction(reason)}
//               color="#000"
//             />
//             <Text style={styles.optionText}>{reason.message}</Text>
//           </View>
//         ))}

//         {selectedReportAction && (
//           <>
//             {selectedReportAction.label === reportActionEnum.DISMISSED && (
//               <TextInput
//                 style={styles.dismissInput}
//                 placeholder="Enter dismiss reason"
//                 value={dismissReason}
//                 onChangeText={setDismissReason}
//                 multiline
//                 numberOfLines={3}
//               />
//             )}

//             <TouchableOpacity
//               style={styles.reportButton}
//               onPress={() => {
//                 if (
//                   selectedReportAction.label === reportActionEnum.DISMISSED &&
//                   !dismissReason.trim()
//                 ) {
//                   Alert.alert(
//                     'Please provide a reason for dismissing the report.',
//                   );
//                   return;
//                 }

//                 Alert.alert(
//                   'Alert',
//                   'You are about to report this author. Do you want to proceed?',
//                   [
//                     {
//                       text: 'Cancel',
//                       onPress: () => console.log('Cancel Pressed'),
//                       style: 'cancel',
//                     },
//                     {
//                       text: 'OK',
//                       onPress: () => {
//                         if (!isConnected) {
//                           Snackbar.show({
//                             text: 'You are currently offline',
//                             duration: Snackbar.LENGTH_SHORT,
//                           });
//                           return;
//                         }
//                         if (report_admin_id !== user_id) {
//                           Alert.alert('Report is not assigned to you');
//                           return;
//                         }
//                         submitReportMutation.mutate(dismissReason);
//                       },
//                     },
//                   ],
//                   {cancelable: false},
//                 );
//               }}>
//               <Text style={styles.btnText}>Submit</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </SafeAreaView>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-start',
//     padding: hp(2),
//   },
//   header: {
//     fontSize: 18,
//     color: 'black',
//     fontWeight: '700',
//   },
//   btnText: {
//     fontSize: 18,
//     color: 'white',
//     fontWeight: '700',
//   },

//   reportButton: {
//     backgroundColor: BUTTON_COLOR,
//     paddingVertical: hp(1.2),
//     paddingHorizontal: wp(10),
//     justifyContent: 'center',
//     alignItems: 'center',
//     alignSelf: 'center',
//     borderRadius: 10,
//     width: '96%',
//   },
//   text: {
//     fontSize: 16,
//     color: '#28282B',
//     marginTop: 10,
//     fontWeight: '500',
//   },
//   optionContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',

//     paddingVertical: hp(1),
//     marginBottom: hp(1),
//     backgroundColor: '#fff',
//     borderRadius: 8,
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 6,
//     fontWeight: '400',
//   },

//   dismissInput: {
//     width: '96%',
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 12,
//     fontSize: 16,
//     textAlignVertical: 'top',
//   },
// });

import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {YStack, XStack, Text, Button, RadioGroup} from 'tamagui';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

import {
  ReportActionScreenProp,
  reportActionEnum,
  reportActionMessages,
} from '../type';
import Loader from '../components/Loader';
import { TAKE_ACTION_ON_REPORT } from '../helper/APIUtils';

const ReportAction = ({navigation, route}: ReportActionScreenProp) => {
  const isDarkMode = useColorScheme() === 'dark';

  const colors = {
    background: isDarkMode ? '#0B1425' : '#F8FAFC',
    surface: isDarkMode ? '#1C2533' : '#FFFFFF',
    text: isDarkMode ? '#F1F5F9' : '#0F172A',
    secondaryText: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#4ACDFF',
    danger: '#F87171',
    border: isDarkMode ? '#334155' : '#E2E8F0',
  };

  const {reportId, report_admin_id} = route.params;
  const {user_id} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [selectedAction, setSelectedAction] = useState<string>("");
  const [dismissReason, setDismissReason] = useState('');

  const reportActions = Object.entries(reportActionMessages).map(([key, value]) => ({
    label: key,
    message: value,
  }));

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(TAKE_ACTION_ON_REPORT, {
        reportId,
        admin_id: report_admin_id,
        action: selectedAction,
        dismissReason: dismissReason,
      });
      return res.data;
    },
    onSuccess: () => {
      Snackbar.show({text: 'Report action submitted', duration: Snackbar.LENGTH_SHORT});
      navigation.navigate('TabScreen');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit report action. Try again.');
    },
  });

  const handleSubmit = () => {
    if (!isConnected) {
      Snackbar.show({text: 'You are offline', duration: Snackbar.LENGTH_SHORT});
      return;
    }
    if (!selectedAction) {
      Alert.alert('Please select an action');
      return;
    }
    if (selectedAction === reportActionEnum.DISMISSED && !dismissReason.trim()) {
      Alert.alert('Please provide a reason for dismissal');
      return;
    }

    Alert.alert('Confirm Action', 'Are you sure you want to proceed?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Yes', onPress: () => submitMutation.mutate()},
    ]);
  };

  if (submitMutation.isPending) return <Loader />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack padding="$5" gap="$6">
            <Text fontSize={24} fontWeight="700" color={colors.text}>
              Take Action on Report
            </Text>

            <YStack gap="$4">
              <RadioGroup 
              value={selectedAction || ''} 
              onValueChange={setSelectedAction}>
              <YStack gap="$4">
                {reportActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedAction(action.label)}
                    style={{
                      backgroundColor: colors.surface,
                      padding: 18,
                      borderRadius: 16,
                      borderWidth: 1.5,
                      borderColor: selectedAction === action.label ? colors.primary : colors.border,
                    }}>
                    <XStack alignItems="center" gap="$3">
                      <RadioGroup.Item value={action.label} />
                      <Text fontSize={16} color={colors.text}>
                        {action.message}
                      </Text>
                    </XStack>
                  </TouchableOpacity>
                ))}
              </YStack>
            </RadioGroup>
            </YStack>

            {selectedAction === reportActionEnum.DISMISSED && (
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  minHeight: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="Enter reason for dismissal..."
                placeholderTextColor={colors.secondaryText}
                value={dismissReason}
                onChangeText={setDismissReason}
                multiline
              />
            )}

            <Button
              height={58}
              backgroundColor={colors.primary}
              borderRadius={14}
              marginTop="$6"
              onPress={handleSubmit}
              disabled={!selectedAction}>
              <Text color="white" fontSize={18} fontWeight="700">
                Submit Action
              </Text>
            </Button>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ReportAction;