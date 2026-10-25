import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useColorScheme,
  useWindowDimensions,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {CHECK_OTP, SEND_OTP} from '../../helper/APIUtils';
import {getApiErrorMessage} from '../../helper/Utils';
import {useSelector} from 'react-redux';
import {OtpScreenProp} from '../../type';
import Snackbar from 'react-native-snackbar';

const COLORS = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    borderFocused: '#2563EB',
    borderFilled: '#93C5FD',
    primary: '#2563EB',
    primaryDisabled: '#93C5FD',
    surface: '#F1F5F9',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    errorText: '#DC2626',
    successText: '#16A34A',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    secondaryText: '#94A3B8',
    border: '#334155',
    borderFocused: '#3B82F6',
    borderFilled: '#1D4ED8',
    primary: '#2563EB',
    primaryDisabled: '#1E3A8A',
    surface: '#0F172A',
    errorBg: '#450A0A',
    errorBorder: '#7F1D1D',
    errorText: '#F87171',
    successText: '#4ADE80',
  },
};

export default function OtpScreen({navigation, route}: OtpScreenProp) {
  const OTP_EXPIRY_SECONDS = 300; // 5 minutes expiry
  const {email} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;
  const {width: screenWidth} = useWindowDimensions();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(OTP_EXPIRY_SECONDS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const expiryTimeRef = useRef<number>(Date.now() + OTP_EXPIRY_SECONDS * 1000);
  const inputs = useRef<(TextInput | null)[]>([]);
  const {isConnected} = useSelector((state: any) => state.network);

  // Responsive OTP box size calculation
  const cardHorizontalPadding = 32; // 16 * 2
  const screenHorizontalPadding = 32; // 16 * 2
  const maxCardWidth = 420;
  const effectiveWidth = Math.min(screenWidth, maxCardWidth) - cardHorizontalPadding - screenHorizontalPadding;
  const gap = 8;
  const boxWidth = Math.max(38, Math.min(48, Math.floor((effectiveWidth - gap * 5) / 6)));
  const boxHeight = Math.round(boxWidth * 1.15);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
    return `${formattedMins}:${formattedSecs}`;
  };

  useEffect(() => {
    const updateRemaining = () => {
      const remaining = Math.max(
        0,
        Math.ceil((expiryTimeRef.current - Date.now()) / 1000),
      );
      setTimer(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        updateRemaining();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  const handleChange = (text: string, index: number) => {
    setErrorMessage(null);
    const cleaned = text.replace(/[^0-9]/g, '');

    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Pasted multiple digits (e.g. from SMS/email auto-fill)
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        if (index + idx < 6) {
          newOtp[index + idx] = digit;
        }
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + digits.length, 5);
      inputs.current[nextFocus]?.focus();
      return;
    }

    // Single digit entered
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = () => {
    if (timer === 0) {
      setErrorMessage('Verification code has expired. Please request a new code.');
      return;
    }

    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!isConnected) {
      Snackbar.show({
        text: 'You are currently offline',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    setErrorMessage(null);
    verifyOtpMutation.mutate({otp: fullCode});
  };

  const handleResend = () => {
    if (timer > 0 || sendOtpMutation.isPending) return;

    if (!isConnected) {
      Snackbar.show({
        text: 'You are currently offline',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    sendOtpMutation.mutate();
  };

  const sendOtpMutation = useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async () => {
      const res = await axios.post(SEND_OTP, {email});
      return res.data;
    },
    onSuccess: () => {
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
      setOtp(['', '', '', '', '', '']);
      setErrorMessage(null);
      expiryTimeRef.current = Date.now() + OTP_EXPIRY_SECONDS * 1000;
      setTimer(OTP_EXPIRY_SECONDS);
      inputs.current[0]?.focus();
    },
    onError: error => {
      const message = getApiErrorMessage(
        error,
        'Failed to resend code. Please try again.',
      );
      setErrorMessage(message);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ['verify-otp'],
    mutationFn: async ({otp: enteredOtp}: {otp: string}) => {
      const res = await axios.post(CHECK_OTP, {
        email,
        otp: enteredOtp,
      });
      const resetToken = res.data?.data?.resetToken || res.data?.resetToken;
      return {
        message: res.data?.message as string,
        resetToken: resetToken as string,
      };
    },
    onSuccess: data => {
      if (!data.resetToken) {
        Alert.alert('Error', 'Password reset token not received.');
        return;
      }
      navigation.navigate('NewPasswordScreen', {
        email,
        resetToken: data.resetToken,
      });
    },
    onError: (error: AxiosError<any>) => {
      const message = getApiErrorMessage(
        error,
        'Invalid or expired verification code',
      );
      setErrorMessage(message);
    },
  });

  const isCodeComplete = otp.every(digit => digit.length === 1);
  const isSubmitting = verifyOtpMutation.isPending || sendOtpMutation.isPending;

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
      {/* Top Header with Back Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={[styles.backButton, {backgroundColor: colors.card, borderColor: colors.border}]}
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityLabel="Back to previous screen">
          <Icon name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Verification</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.card, {backgroundColor: colors.card, borderColor: colors.border}]}>
            {/* Header Icon */}
            <View
              style={[
                styles.iconCircle,
                {backgroundColor: isDarkMode ? '#1E3A8A40' : '#EFF6FF'},
              ]}>
              <Icon name="shield-checkmark-outline" size={36} color={colors.primary} />
            </View>

            <Text style={[styles.title, {color: colors.text}]}>
              Enter Verification Code
            </Text>

            <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
              We sent a 6-digit verification code to
            </Text>

            {/* Email Badge with Change Option */}
            <View style={[styles.emailBadge, {backgroundColor: colors.surface, borderColor: colors.border}]}>
              <Icon name="mail" size={15} color={colors.primary} />
              <Text
                style={[styles.emailText, {color: colors.text}]}
                numberOfLines={1}
                ellipsizeMode="middle">
                {email}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={[styles.changeText, {color: colors.primary}]}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Input Boxes Row */}
            <View style={styles.otpRow}>
              {otp.map((digit, index) => {
                const isFocused = focusedIndex === index;
                const isFilled = digit.length > 0;
                return (
                  <TextInput
                    key={index}
                    ref={ref => {
                      inputs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? 6 : 1}
                    selectTextOnFocus
                    textAlign="center"
                    textContentType="oneTimeCode"
                    autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                    style={[
                      styles.otpBox,
                      {
                        width: boxWidth,
                        height: boxHeight,
                        backgroundColor: colors.surface,
                        borderColor: isFocused
                          ? colors.borderFocused
                          : isFilled
                          ? colors.borderFilled
                          : colors.border,
                        color: colors.text,
                      },
                      isFocused && styles.otpBoxFocused,
                    ]}
                  />
                );
              })}
            </View>

            {/* Error Message Banner */}
            {errorMessage ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: colors.errorBg,
                    borderColor: colors.errorBorder,
                  },
                ]}>
                <Icon name="alert-circle" size={18} color={colors.errorText} />
                <Text style={[styles.errorBannerText, {color: colors.errorText}]}>
                  {typeof errorMessage === 'string'
                    ? errorMessage
                    : (errorMessage as any)?.message ||
                      'Invalid or expired verification code'}
                </Text>
              </View>
            ) : null}

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {backgroundColor: colors.primary},
                (!isCodeComplete || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={!isCodeComplete || isSubmitting}
              activeOpacity={0.85}>
              {verifyOtpMutation.isPending ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Verifying...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Resend Section */}
            <View style={styles.resendSection}>
              {timer > 0 ? (
                <View style={styles.timerRow}>
                  <Icon name="time-outline" size={16} color={colors.secondaryText} />
                  <Text style={[styles.timerText, {color: colors.secondaryText}]}>
                    Resend code in{' '}
                    <Text style={[styles.timerHighlight, {color: colors.primary}]}>
                      {formatTime(timer)}
                    </Text>
                  </Text>
                </View>
              ) : (
                <View style={styles.resendActionRow}>
                  <Text style={[styles.resendPrompt, {color: colors.secondaryText}]}>
                    {"Didn't receive the code?"}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={sendOtpMutation.isPending}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    {sendOtpMutation.isPending ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={[styles.resendLink, {color: colors.primary}]}>
                        Resend Code
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 24,
    maxWidth: '100%',
  },
  emailText: {
    fontSize: 13.5,
    fontWeight: '600',
    maxWidth: 200,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  otpBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  otpBoxFocused: {
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    width: '100%',
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendSection: {
    marginTop: 22,
    alignItems: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerHighlight: {
    fontWeight: '700',
  },
  resendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendPrompt: {
    fontSize: 14,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
