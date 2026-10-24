import React, {useState, useEffect} from 'react';
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

const COLORS = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#CBD5E1',
    borderFocused: '#2563EB',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    danger: '#EF4444',
    success: '#10B981',
    iconColor: '#94A3B8',
  },
  dark: {
    background: '#1E293B',
    surface: '#0F172A',
    text: '#F8FAFC',
    secondaryText: '#94A3B8',
    border: '#334155',
    borderFocused: '#3B82F6',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    danger: '#F87171',
    success: '#34D399',
    iconColor: '#64748B',
  },
};

export default function EmailInputModal({
  visible,
  callback,
  backButtonClick,
  onDismiss,
  isLoading = false,
}: {
  visible: boolean;
  callback: (email: string) => void;
  backButtonClick: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}) {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmail('');
      setIsValid(true);
      setIsFocused(false);
    }
  }, [visible]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = () => {
    if (isLoading) return;
    const trimmed = email.trim();
    if (emailRegex.test(trimmed)) {
      setIsValid(true);
      Keyboard.dismiss();
      callback(trimmed);
    } else {
      setIsValid(false);
    }
  };

  const handleBack = () => {
    if (isLoading) return;
    Keyboard.dismiss();
    setEmail('');
    setIsValid(true);
    backButtonClick();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleBack}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoid}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={[
                  styles.modalCard,
                  {backgroundColor: colors.background},
                ]}>
                {/* Top Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleBack}
                  hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                  accessibilityLabel="Close forgot password dialog"
                  disabled={isLoading}>
                  <Icon name="close" size={22} color={colors.secondaryText} />
                </TouchableOpacity>

                {/* Header Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    {backgroundColor: isDarkMode ? '#1E3A8A40' : '#EFF6FF'},
                  ]}>
                  <Icon name="mail-unread-outline" size={32} color={colors.primary} />
                </View>

                {/* Title */}
                <Text style={[styles.title, {color: colors.text}]}>
                  Forgot Password?
                </Text>

                <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
                  Enter the email associated with your account and we’ll send you a 6-digit verification code.
                </Text>

                {/* Input Container */}
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: !isValid
                        ? colors.danger
                        : isFocused
                        ? colors.borderFocused
                        : colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}>
                  <Icon
                    name="mail-outline"
                    size={20}
                    color={
                      !isValid
                        ? colors.danger
                        : isFocused
                        ? colors.primary
                        : colors.iconColor
                    }
                    style={styles.inputLeadingIcon}
                  />
                  <TextInput
                    style={[styles.input, {color: colors.text}]}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      if (!isValid) setIsValid(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  {email.length > 0 && !isLoading && (
                    <TouchableOpacity
                      onPress={() => setEmail('')}
                      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Icon
                        name="close-circle"
                        size={18}
                        color={colors.secondaryText}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {!isValid && (
                  <View style={styles.errorRow}>
                    <Icon name="alert-circle" size={15} color={colors.danger} />
                    <Text style={[styles.errorText, {color: colors.danger}]}>
                      Please enter a valid email address
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {backgroundColor: colors.primary},
                    (isLoading || email.trim().length === 0) && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading || email.trim().length === 0}
                  activeOpacity={0.85}>
                  {isLoading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Sending Code...</Text>
                    </View>
                  ) : (
                    <Text style={styles.primaryButtonText}>Send OTP Code</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleBack}
                  disabled={isLoading}
                  activeOpacity={0.7}>
                  <Text style={[styles.cancelButtonText, {color: colors.secondaryText}]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardAvoid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 6,
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  inputContainer: {
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
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 5,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
