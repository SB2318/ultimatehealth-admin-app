import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {RESET_PASSWORD_API} from '../../helper/APIUtils';
import {NewPasswordScreenProp} from '../../type';
import Snackbar from 'react-native-snackbar';
import {useSelector} from 'react-redux';

const COLORS = {
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    borderFocused: '#2563EB',
    primary: '#2563EB',
    surface: '#F1F5F9',
    errorBg: '#FEF2F2',
    errorBorder: '#FECACA',
    errorText: '#DC2626',
    successText: '#16A34A',
    iconColor: '#94A3B8',
    ruleUnmet: '#94A3B8',
    ruleMet: '#16A34A',
  },
  dark: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    secondaryText: '#94A3B8',
    border: '#334155',
    borderFocused: '#3B82F6',
    primary: '#2563EB',
    surface: '#0F172A',
    errorBg: '#450A0A',
    errorBorder: '#7F1D1D',
    errorText: '#F87171',
    successText: '#4ADE80',
    iconColor: '#64748B',
    ruleUnmet: '#64748B',
    ruleMet: '#4ADE80',
  },
};

export default function NewPasswordScreen({
  navigation,
  route,
}: NewPasswordScreenProp) {
  const {email, resetToken} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;
  const {isConnected} = useSelector((state: any) => state.network);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Password Criteria Checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const isPasswordValid =
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar;

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const isFormValid = isPasswordValid && passwordsMatch;

  const handlePasswordChange = (text: string) => {
    setErrorMessage(null);
    setPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setErrorMessage(null);
    setConfirmPassword(text);
  };

  const handlePasswordSubmit = () => {
    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(
        'Password must meet all 5 security criteria shown below.',
      );
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Please confirm your new password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Confirmation password does not match.');
      return;
    }

    if (!resetToken) {
      Alert.alert(
        'Session Expired',
        'Password reset token is missing. Please restart the forgot password process.',
        [{text: 'OK', onPress: () => navigation.navigate('LoginScreen')}],
      );
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
    changePasswordMutation.mutate();
  };

  const changePasswordMutation = useMutation({
    mutationKey: ['generate-new-password'],
    mutationFn: async () => {
      const res = await axios.post(RESET_PASSWORD_API, {
        resetToken,
        newPassword: password,
      });
      return res.data;
    },
    onSuccess: () => {
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now sign in with your new credentials.',
        [{text: 'Sign In', onPress: () => navigation.navigate('LoginScreen')}],
      );
    },
    onError: (error: AxiosError<any>) => {
      if (error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          'Something went wrong. Please try again.';
        setErrorMessage(message);
      } else {
        setErrorMessage('Network error. Please try again.');
      }
    },
  });

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
      {/* Top Navigation Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={[styles.backButton, {backgroundColor: colors.card, borderColor: colors.border}]}
          onPress={() => navigation.navigate('LoginScreen')}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityLabel="Back to login">
          <Icon name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.text}]}>Set New Password</Text>
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
              <Icon name="key-outline" size={36} color={colors.primary} />
            </View>

            <Text style={[styles.title, {color: colors.text}]}>
              Create New Password
            </Text>

            <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
              Your new password must be secure and different from your previously used passwords.
            </Text>

            {email ? (
              <View style={[styles.emailBadge, {backgroundColor: colors.surface, borderColor: colors.border}]}>
                <Icon name="person-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.emailText, {color: colors.secondaryText}]}>
                  Account: <Text style={{color: colors.text, fontWeight: '700'}}>{email}</Text>
                </Text>
              </View>
            ) : null}

            {/* Input 1: New Password */}
            <View style={styles.field}>
              <Text style={[styles.label, {color: colors.text}]}>New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: passwordFocused
                      ? colors.borderFocused
                      : colors.border,
                  },
                ]}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? colors.primary : colors.iconColor}
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  style={[styles.input, {color: colors.text}]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.secondaryText}
                  secureTextEntry={secureTextEntry}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  accessibilityLabel="Toggle password visibility">
                  <Icon
                    name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Criteria Checklist */}
            <View style={[styles.checklistCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
              <Text style={[styles.checklistTitle, {color: colors.secondaryText}]}>
                Password Requirements:
              </Text>

              <RequirementRow
                met={hasMinLength}
                text="At least 8 characters"
                colors={colors}
              />
              <RequirementRow
                met={hasUpperCase}
                text="At least 1 uppercase letter (A-Z)"
                colors={colors}
              />
              <RequirementRow
                met={hasLowerCase}
                text="At least 1 lowercase letter (a-z)"
                colors={colors}
              />
              <RequirementRow
                met={hasNumber}
                text="At least 1 number (0-9)"
                colors={colors}
              />
              <RequirementRow
                met={hasSpecialChar}
                text="At least 1 special character (!@#$%^&*...)"
                colors={colors}
              />
            </View>

            {/* Input 2: Confirm Password */}
            <View style={styles.field}>
              <Text style={[styles.label, {color: colors.text}]}>Confirm New Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: passwordsMismatch
                      ? colors.errorText
                      : confirmPasswordFocused
                      ? colors.borderFocused
                      : colors.border,
                  },
                ]}>
                <Icon
                  name="lock-closed-outline"
                  size={20}
                  color={
                    passwordsMismatch
                      ? colors.errorText
                      : confirmPasswordFocused
                      ? colors.primary
                      : colors.iconColor
                  }
                  style={styles.inputLeadingIcon}
                />
                <TextInput
                  style={[styles.input, {color: colors.text}]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.secondaryText}
                  secureTextEntry={secureConfirmTextEntry}
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  accessibilityLabel="Toggle confirm password visibility">
                  <Icon
                    name={secureConfirmTextEntry ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
              </View>

              {/* Match Feedback */}
              {passwordsMatch && (
                <View style={styles.matchFeedbackRow}>
                  <Icon name="checkmark-circle" size={15} color={colors.successText} />
                  <Text style={[styles.matchFeedbackText, {color: colors.successText}]}>
                    Passwords match
                  </Text>
                </View>
              )}
              {passwordsMismatch && (
                <View style={styles.matchFeedbackRow}>
                  <Icon name="close-circle" size={15} color={colors.errorText} />
                  <Text style={[styles.matchFeedbackText, {color: colors.errorText}]}>
                    Passwords do not match
                  </Text>
                </View>
              )}
            </View>

            {/* Error Message Banner */}
            {errorMessage && (
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
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Confirm & Save Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {backgroundColor: colors.primary},
                (!isFormValid || changePasswordMutation.isPending) && styles.submitButtonDisabled,
              ]}
              onPress={handlePasswordSubmit}
              disabled={!isFormValid || changePasswordMutation.isPending}
              activeOpacity={0.85}>
              {changePasswordMutation.isPending ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Resetting Password...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            {/* Return to Login Link */}
            <TouchableOpacity
              style={styles.returnLink}
              onPress={() => navigation.navigate('LoginScreen')}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="arrow-back-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.returnLinkText, {color: colors.primary}]}>
                Return to Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequirementRow({
  met,
  text,
  colors,
}: {
  met: boolean;
  text: string;
  colors: typeof COLORS.light;
}) {
  return (
    <View style={styles.requirementRow}>
      <Icon
        name={met ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={met ? colors.ruleMet : colors.ruleUnmet}
      />
      <Text
        style={[
          styles.requirementText,
          {
            color: met ? colors.text : colors.secondaryText,
            fontWeight: met ? '600' : '400',
          },
        ]}>
        {text}
      </Text>
    </View>
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
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
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
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 20,
  },
  emailText: {
    fontSize: 13,
  },
  field: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLeadingIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15.5,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },
  checklistCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  checklistTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
  },
  matchFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginLeft: 4,
  },
  matchFeedbackText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
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
    marginTop: 6,
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
  returnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 22,
    paddingVertical: 6,
  },
  returnLinkText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
