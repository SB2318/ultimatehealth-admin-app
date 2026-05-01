import React, {useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import Icon from '@expo/vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {useFirebaseMessaging} from '../../../FirebaseContext';
import EmailInputModal from '../../components/EmailInputModal';
import {LOGIN_API, RESEND_VERIFICATION, SEND_OTP} from '../../helper/APIUtils';
import {fp, hp, wp} from '../../helper/Metric';
import {KEYS, storeItem} from '../../helper/Utils';
import {setUserHandle, setUserId, setUserToken} from '../../stores/UserSlice';
import {Admin, AuthData, LoginScreenProp} from '../../type';
import Snackbar from 'react-native-snackbar';
import { PRIMARY_COLOR } from '@/src/helper/Theme';

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  surface: '#FFFFFF',
  surfaceDark: '#1E2937',
  text: '#0F172A',
  textDark: '#F1F5F9',
  secondaryText: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
  success: '#10B981',
};

export default function LoginScreen({navigation}: LoginScreenProp) {

  const {fcmToken} = useFirebaseMessaging();
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  const [emailInputVisible, setEmailInputVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [otpMail, setOtpMail] = useState('');
  const {isConnected} = useSelector((state: any) => state.network);
  // const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [emailVerify, setEmailVerify] = useState(false);
  const [output, setOutput] = useState(true);

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const validateAndSubmit = async () => {
    if (!isConnected) {
      Snackbar.show({
        text: 'You are currently offline',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    if (validate()) {
      // await getFCMToken();
      //setPasswordMessage(false);
      //setEmailMessage(false);
      console.log('enter');
      loginMutation.mutate();
    } else {
      setOutput(true);
      //setPasswordMessage(false);
      //setEmailMessage(false);
    }
  };

  const validate = () => {
    if (emailVerify && passwordVerify) {
      return true;
    } else {
      return false;
    }
  };
  const handlePassword = (text: string) => {
    let pass = text;
    setPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setPassword(pass);
      setPasswordVerify(true);
    }
  };

  const handleEmail = (text: string) => {
    setEmail(text);

    const isValid = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(text);
    setEmailVerify(isValid);
  };

  const handleEmailInputBack = () => {
    setEmailInputVisible(false);
  };

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async () => {
      console.log('Login Mutation Enter');
      const res = await axios.post(LOGIN_API, {
        email: email,
        password: password,
        fcmToken: fcmToken,
      });

      return res.data.user as Admin;
    },

    onSuccess: async data => {
      const auth: AuthData = {
        userId: data._id,
        token: data?.refreshToken,
        user_handle: data?.user_handle,
      };
      try {
        await storeItem(KEYS.USER_ID, auth.userId.toString());
        await storeItem(KEYS.USER_HANDLE, data?.user_handle);
        if (auth.token) {
          await storeItem(KEYS.USER_TOKEN, auth.token.toString());
          await storeItem(
            KEYS.USER_TOKEN_EXPIRY_DATE,
            new Date().toISOString(),
          );
          dispatch(setUserId(auth.userId));
          dispatch(setUserToken(auth.token));
          // set default header of axios
          axios.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${auth.token}`;
          dispatch(setUserHandle(auth.user_handle));
          setTimeout(() => {
            navigation?.reset({
              index: 0,
              routes: [{name: 'TabScreen'}],
            });
          }, 1000);
        } else {
          Alert.alert('Token not found');
        }
      } catch (e) {
        console.log('Async Storage ERROR', e);
      }
    },

    onError: (error: AxiosError) => {
      console.log('Error', error);
      if (error.response) {
        const errorCode = error.response.status;
        switch (errorCode) {
          case 400:
            Alert.alert('Error', 'Please provide email and password');
            break;
          case 401:
            Alert.alert('Error', 'Invalid password');
            break;
          case 403:
            Alert.alert(
              'Error',
              'Email not verified. Please check your email.',
            );
            break;
          case 404:
            Alert.alert('Error', 'User not found');
            break;
          default:
            Alert.alert('Error', 'Internal server error');
        }
      } else {
        Alert.alert('Error', 'User not found');
      }
    },
  });

  const requestVerification = useMutation({
    mutationKey: ['resend-verification-mail'],
    mutationFn: async () => {
      const res = await axios.post(RESEND_VERIFICATION, {
        email: email,
        isAdmin: true,
      });

      return res.data.message as string;
    },

    onSuccess: () => {
      /** Check Status */
      Alert.alert('Verification Email Sent');
      setEmail('');
      setPassword('');
    },
    onError: (error: AxiosError) => {
      console.log('Email Verification error', error);

      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Error', 'User not found or already verified');
            break;
          case 429:
            Alert.alert(
              'Error',
              'Verification email already sent. Please try again after 1 hour.',
            );
            break;
          case 500:
            Alert.alert(
              'Error',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            Alert.alert(
              'Error',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        console.log('Email Verification error', error);
      }
    },
  });

  const sendOtpMutation = useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async ({email}: {email: string}) => {
      const res = await axios.post(SEND_OTP, {
        email: email,
      });
      return res.data.otp as string;
    },

    onSuccess: () => {
      Alert.alert('OTP has sent to your mail');
      navigateToOtpScreen();
    },
    onError: error => {
      setEmailInputVisible(false);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 400) {
            Alert.alert(
              'Error',
              'User with this email does not exist.' + error.message,
            );
          } else if (error.response.status === 500) {
            Alert.alert('Error', 'Error sending email.' + error.message);
          } else {
            Alert.alert('Error', 'Something went wrong.' + error.message);
          }
        } else {
          Alert.alert('Error', 'Network error.');
        }
      } else {
        Alert.alert('Error', 'Network error.');
      }
    },
  });

  const navigateToOtpScreen = () => {
    setEmailInputVisible(false);
    navigation.navigate('OtpScreen', {
      email: otpMail,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Gradient Header */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.brandText}>Admin Portal</Text>
          <Text style={styles.welcomeText}>Sign in to continue</Text>
        </View>

        {/* Login Card */}
        <View style={[styles.card, isDarkMode && styles.cardDark]}>
          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <View
              style={[styles.inputWrapper, emailVerify && styles.inputSuccess]}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="you@gmail.com"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
              {emailVerify && (
                <Icon
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />
              )}
            </View>
            {!emailVerify && email.length > 0 && (
              <Text style={styles.errorText}>Please enter a valid email</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordVerify && styles.inputSuccess,
              ]}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={handlePassword}
                secureTextEntry={secureTextEntry}
                placeholder="••••••••"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}>
                <Icon
                  name={secureTextEntry ? 'eye-off' : 'eye'}
                  size={20}
                  color={isDarkMode ? '#CBD5E1' : '#64748B'}
                />
              </TouchableOpacity>
            </View>
            {!passwordVerify && password.length > 0 && (
              <Text style={styles.errorText}>
                Password must be at least 6 characters
              </Text>
            )}
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => setEmailInputVisible(true)}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loginMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={validateAndSubmit}
            disabled={loginMutation.isPending}>
            <Text style={styles.loginButtonText}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <TouchableOpacity
            style={styles.signUpContainer}
            onPress={() => navigation.navigate('SignUpScreen')}>
            <Text style={styles.signUpText}>
              Don&apos;t have an account?{' '}
              <Text style={styles.signUpHighlight}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          {/* Request Verification (secondary) */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              if (!email) {
                Alert.alert('Enter your email first');
                return;
              }

              if (!isConnected) {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
                return;
              }

              requestVerification.mutate();
            }}>
            <Text style={styles.secondaryButtonText}>
              Resend Verification Email
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <EmailInputModal
        // eslint-disable-next-line @typescript-eslint/no-shadow
        callback={(email: string) => {
          if (!isConnected) {
            Snackbar.show({
              text: 'You are currently offline',
              duration: Snackbar.LENGTH_SHORT,
            });
            return;
          }
          setOtpMail(email);
          sendOtpMutation.mutate({
            email: email,
          });
        }}
        visible={emailInputVisible}
        backButtonClick={handleEmailInputBack}
        onDismiss={() => setEmailInputVisible(false)}
        isRequestVerification={false}
        onRequestVerification={() => {}}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  scrollContent: {flexGrow: 1, paddingBottom: hp(5)},

  header: {
    backgroundColor: '#2563EB',
    paddingTop: hp(8),
    paddingBottom: hp(6),
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    height: hp(14),
    width: hp(14),
    borderRadius: hp(7),
    marginBottom: hp(2),
  },
  brandText: {
    fontSize: fp(7),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp(1),
  },
  welcomeText: {
    fontSize: fp(4.5),
    color: '#E0F2FE',
    opacity: 0.9,
  },

  card: {
    marginTop: -hp(4),
    marginHorizontal: wp(5),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: wp(6),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  cardDark: {backgroundColor: '#1E2937'},

  field: {marginBottom: hp(3)},
  label: {
    fontSize: fp(3.8),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: hp(1.5),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: wp(4),
  },
  inputSuccess: {borderColor: COLORS.success},
  input: {
    flex: 1,
    paddingVertical: hp(2.2),
    fontSize: fp(4.2),
    color: COLORS.text,
  },
  eyeIcon: {padding: 8},

  errorText: {color: COLORS.error, fontSize: fp(3.2), marginTop: hp(1)},

  forgotContainer: {alignSelf: 'flex-end', marginBottom: hp(3)},
  forgotText: {color: COLORS.primary, fontWeight: '600', fontSize: fp(3.8)},

  loginButton: {
    backgroundColor: '#2563EB',
    paddingVertical: hp(2.2),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: hp(3),
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: fp(4.8),
    fontWeight: '700',
  },
  buttonDisabled: {opacity: 0.7},

  signUpContainer: {alignItems: 'center', marginBottom: hp(3)},
  signUpText: {fontSize: fp(4), color: COLORS.secondaryText},
  signUpHighlight: {color: COLORS.primary, fontWeight: '600'},

  secondaryButton: {
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  secondaryButtonText: {
    color: COLORS.secondaryText,
    fontSize: fp(3.8),
  },
});
