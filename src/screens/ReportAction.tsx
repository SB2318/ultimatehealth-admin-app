import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useSelector} from 'react-redux';
import axios from 'axios';
import Loader from '../components/Loader';
import {useMutation} from '@tanstack/react-query';
import {RadioButton} from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import {hp, wp} from '../helper/Metric';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {
  reportActionEnum,
  reportActionMessages,
  ReportActionScreenProp,
} from '../type';
import {TAKE_ACTION_ON_REPORT} from '../helper/APIUtils';

export default function ReportAction({
  navigation,
  route,
}: ReportActionScreenProp) {
  const {reportId, report_admin_id} = route.params;
  const {user_id} = useSelector((state: any) => state.user);
  const [dismissReason, setDismissReason] = useState<string>('');

  const reportActions = Object.entries(reportActionMessages).map(
    ([action, message]) => {
      return {
        label: action,
        message: message,
      };
    },
  );
  const [selectedReportAction, setSelectedReportAction] = useState<{
    label: string;
    message: string;
  } | null>(null);

  //console.log(reasons[0].reason)
  const submitReportMutation = useMutation({
    mutationKey: ['submit-report-action'],
    mutationFn: async (dismissReason: string) => {
     
      //console.log("Url", TAKE_ACTION_ON_REPORT);
      
      const res = await axios.post(TAKE_ACTION_ON_REPORT, {
        reportId: reportId,
        admin_id: report_admin_id,
        action: selectedReportAction?.label,
        dismissReason: dismissReason,
      });

      return res.data as any;
    },
    onSuccess: () => {
      Snackbar.show({
        text: 'Report action submitted',
        duration: Snackbar.LENGTH_SHORT,
      });

      navigation.navigate('TabScreen');
    },

    onError: () => {
      // console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  if (submitReportMutation.isPending) {
    return <Loader />;
  }
  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      <View style={styles.container}>
        {reportActions?.map((reason, index) => (
          <View key={index} style={styles.optionContainer}>
            <RadioButton
              value={reason.message}
              status={
                selectedReportAction?.label === reason.label
                  ? 'checked'
                  : 'unchecked'
              }
              onPress={() => setSelectedReportAction(reason)}
              color="#000"
            />
            <Text style={styles.optionText}>{reason.message}</Text>
          </View>
        ))}

        {selectedReportAction && (
          <>
            {selectedReportAction.label === reportActionEnum.DISMISSED && (
              <TextInput
                style={styles.dismissInput}
                placeholder="Enter dismiss reason"
                value={dismissReason}
                onChangeText={setDismissReason}
                multiline
                numberOfLines={3}
              />
            )}

            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => {
                if (
                  selectedReportAction.label === reportActionEnum.DISMISSED &&
                  !dismissReason.trim()
                ) {
                  Alert.alert(
                    'Please provide a reason for dismissing the report.',
                  );
                  return;
                }

                Alert.alert(
                  'Alert',
                  'You are about to report this author. Do you want to proceed?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => {
                        if (report_admin_id !== user_id) {
                          Alert.alert('Report is not assigned to you');
                          return;
                        }
                        submitReportMutation.mutate(dismissReason);
                      },
                    },
                  ],
                  {cancelable: false},
                );
              }}>
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 18,
  },
  header: {
    fontSize: 18,
    color: 'black',
    fontWeight: '700',
  },
  btnText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '700',
  },

  reportButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    width: '96%',
  },
  text: {
    fontSize: 16,
    color: '#28282B',
    marginTop: 10,
    fontWeight: '500',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 6,
    fontWeight: '400',
  },

  dismissInput: {
    width: '96%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
});
