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
import {TAKE_ACTION_ON_REPORT} from '../helper/APIUtils';

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
  const {user_id, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [selectedAction, setSelectedAction] = useState<string>('');
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
    if (isGuest) {
      if (!selectedAction) {
        Alert.alert('Please select an action');
        return;
      }
      if (selectedAction === reportActionEnum.DISMISSED && !dismissReason.trim()) {
        Alert.alert('Please provide a reason for dismissal');
        return;
      }
      Alert.alert(
        'Guest Mode Simulation',
        'Incident report action successfully simulated! The audit log has recorded your governance resolution.',
        [{text: 'OK', onPress: () => navigation.navigate('TabScreen')}],
      );
      return;
    }

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
                        borderColor:
                          selectedAction === action.label
                            ? colors.primary
                            : colors.border,
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
