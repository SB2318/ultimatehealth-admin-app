import React, {useState} from 'react';
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
} from 'react-native';

const COLORS = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
    danger: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#1E2937',
    surface: '#0F172A',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    danger: '#F87171',
    success: '#34D399',
  },
};

export default function EmailInputModal({
  visible,
  callback,
  backButtonClick,
  isRequestVerification,
  onRequestVerification,
  onDismiss,
}: {
  visible: boolean;
  callback: (email: string) => void;
  backButtonClick: () => void;
  isRequestVerification: boolean;
  onRequestVerification: () => void;
  onDismiss: () => void;
}) {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = () => {
    if (emailRegex.test(email)) {
      setIsValid(true);
      callback(email);
      setEmail('');
    } else {
      setIsValid(false);
    }
  };

  const handleBack = () => {
    setEmail('');
    setIsValid(true);
    backButtonClick();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.centeredView}>
          <View style={[styles.modalCard, {backgroundColor: colors.background}]}>
            {/* Title */}
            <Text style={[styles.title, {color: colors.text}]}>
              {isRequestVerification ? 'Email Verification' : 'Forgot Password'}
            </Text>

            <Text style={[styles.subtitle, {color: colors.secondaryText}]}>
              {isRequestVerification
                ? 'Enter your registered email to receive verification link'
                : 'Enter your email and we’ll send you a reset OTP'}
            </Text>

            {/* Input */}
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: !isValid ? colors.danger : isFocused ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text,
                },
              ]}
              placeholder="you@gmail.com"
              placeholderTextColor={colors.secondaryText}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (!isValid) setIsValid(true);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />

            {!isValid && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.primaryButton, {backgroundColor: colors.primary}]}
              onPress={isRequestVerification ? onRequestVerification : handleSubmit}>
              <Text style={styles.primaryButtonText}>
                {isRequestVerification ? 'Send Verification Link' : 'Send OTP'}
              </Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={[styles.backButtonText, {color: colors.secondaryText}]}>
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    width: '90%',
    maxWidth: 380,
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});