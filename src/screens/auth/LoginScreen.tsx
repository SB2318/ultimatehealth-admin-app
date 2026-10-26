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
import {LOGIN_API, SEND_OTP} from '../../helper/APIUtils';
import {fp, hp, wp} from '../../helper/Metric';
import {KEYS, getApiErrorMessage, storeItem} from '../../helper/Utils';
import {
  setUserHandle,
  setUserId,
  setUserToken,
  setIsSuperAdmin,
  setGuestMode,
} from '../../stores/UserSlice';
import {Admin, AuthData, LoginScreenProp} from '../../type';
import Snackbar from 'react-native-snackbar';
import { PRIMARY_COLOR } from '../../helper/Theme';

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
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      Snackbar.show({
        text: 'Please enter your email address',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    if (!emailVerify) {
      Snackbar.show({
        text: 'Please enter a valid email address',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    if (!password) {
      Snackbar.show({
        text: 'Please enter your password',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    if (password.length < 6) {
      Snackbar.show({
        text: 'Password must be at least 6 characters',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    loginMutation.mutate();
  };

  const handlePassword = (text: string) => {
    setPassword(text);
    setPasswordVerify(text.length >= 6);
  };

  const handleEmail = (text: string) => {
    setEmail(text);
    const isValid = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(text.trim());
    setEmailVerify(isValid);
  };

  const handleEmailInputBack = () => {
    setEmailInputVisible(false);
  };

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async () => {
      console.log('Login Mutation Enter');
      const res = await axios.post(
        LOGIN_API,
        {
          email: email.trim().toLowerCase(),
          password: password,
          fcmToken: fcmToken,
        },
        {
          headers: {
            'x-type': 'mobile',
            'x-client-type': 'mobile',
            'x-type-header': 'mobile',
          },
        },
      );

      return res.data as any;
    },

    onSuccess: async data => {
      try {
        const userObj = data?.user || data || {};
        const userId = userObj?._id || data?._id || userObj?.id || data?.id;
        const token = data?.refreshToken || data?.token || userObj?.refreshToken || userObj?.token;
        const userHandle = userObj?.user_handle || data?.user_handle || userObj?.user_name || data?.user_name || '';
        const isSuperAdmin = Boolean(data?.isSuperAdmin ?? userObj?.isSuperAdmin);

        if (!userId || !token) {
          Alert.alert('Login Failed', 'Authentication token or user ID not found in server response.');
          return;
        }

        await Promise.all([
          storeItem(KEYS.USER_ID, String(userId)),
          storeItem(KEYS.USER_HANDLE, String(userHandle)),
          storeItem(KEYS.IS_SUPER_ADMIN, JSON.stringify(isSuperAdmin)),
          storeItem(KEYS.USER_TOKEN, String(token)),
          storeItem(KEYS.USER_TOKEN_EXPIRY_DATE, new Date().toISOString()),
        ]);

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.headers.common['x-type'] = 'mobile';
        axios.defaults.headers.common['x-client-type'] = 'mobile';
        axios.defaults.headers.common['x-type-header'] = 'mobile';

        dispatch(setUserId(String(userId)));
        dispatch(setUserToken(String(token)));
        dispatch(setUserHandle(String(userHandle)));
        dispatch(setIsSuperAdmin(isSuperAdmin));

        navigation?.reset({
          index: 0,
          routes: [{name: 'TabScreen'}],
        });
      } catch (e) {
        console.error('Async Storage ERROR', e);
        Alert.alert('Storage Error', 'Failed to save session state.');
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


  const sendOtpMutation = useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async ({email}: {email: string}) => {
      const res = await axios.post(SEND_OTP, {
        email: email,
      });
      return res.data;
    },

    onSuccess: () => {
      Alert.alert('Success', 'OTP has been sent to your email.');
      navigateToOtpScreen();
    },
    onError: error => {
      setEmailInputVisible(false);
      const message = getApiErrorMessage(error, 'Something went wrong.');
      Alert.alert('Error', message);
    },
  });

  const navigateToOtpScreen = () => {
    setEmailInputVisible(false);
    navigation.navigate('OtpScreen', {
      email: otpMail,
    });
  };

  const handleGuestExplorer = async () => {
    try {
      await Promise.all([
        storeItem(KEYS.USER_ID, 'guest_reviewer_id'),
        storeItem(KEYS.USER_HANDLE, 'guest_reviewer'),
        storeItem(KEYS.IS_SUPER_ADMIN, 'true'),
        storeItem(KEYS.USER_TOKEN, 'guest_demo_jwt_token'),
        storeItem(
          KEYS.USER_TOKEN_EXPIRY_DATE,
          new Date(Date.now() + 86400000 * 30).toISOString(),
        ),
      ]);

      axios.defaults.headers.common['Authorization'] = 'Bearer guest_demo_jwt_token';
      axios.defaults.headers.common['x-type'] = 'mobile';
      axios.defaults.headers.common['x-client-type'] = 'mobile';
      axios.defaults.headers.common['x-type-header'] = 'mobile';

      dispatch(setGuestMode());

      navigation.reset({
        index: 0,
        routes: [{name: 'TabScreen'}],
      });
    } catch (e) {
      console.error('Guest Explorer entry error:', e);
      Alert.alert('Error', 'Unable to initialize Guest Explorer session.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC'},
      ]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'}
      />

      {/* Offline Alert Strip */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Icon name="cloud-offline" size={16} color="#FFFFFF" />
          <Text style={styles.offlineBannerText}>
            You are offline. Connect to network to sign in.
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Clean Portal Header */}
        <View style={styles.portalHeader}>
          {/* Logo Frame */}
          <View style={styles.portalLogoTile}>
            <Image
              source={require('../../../assets/images/ic_admin.png')}
              style={styles.portalLogo}
            />
          </View>

          {/* Portal Title */}
          <View style={styles.portalBrandRow}>
            <Text
              style={[
                styles.brandTitleDark,
                {color: isDarkMode ? '#F1F5F9' : '#0F172A'},
              ]}>
              Ultimate
            </Text>
            <Text style={styles.brandTitleAccent}>Health</Text>
          </View>

          <Text
            style={[
              styles.portalSubTitle,
              {color: isDarkMode ? '#94A3B8' : '#475569'},
            ]}>
            Admin & Reviewer Portal
          </Text>
        </View>

        {/* Portal Sign-In Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
            },
          ]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIconWrap}>
              <Icon name="shield-checkmark" size={18} color="#0284C7" />
            </View>
            <View>
              <Text
                style={[
                  styles.cardTitle,
                  {color: isDarkMode ? '#F1F5F9' : '#0F172A'},
                ]}>
                Reviewer Sign In
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  {color: isDarkMode ? '#94A3B8' : '#64748B'},
                ]}>
                Access your assigned queue and tasks
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Email Address */}
          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#E2E8F0' : '#1E293B'},
              ]}>
              Email Address
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: emailVerify
                    ? COLORS.success
                    : isDarkMode
                    ? '#334155'
                    : '#CBD5E1',
                },
              ]}>
              <Icon
                name="mail-outline"
                size={19}
                color={emailVerify ? COLORS.success : '#64748B'}
                style={styles.inputPrefixIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {color: isDarkMode ? '#F1F5F9' : '#0F172A'},
                ]}
                value={email}
                onChangeText={handleEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="reviewer@ultimatehealth.blog"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
              {emailVerify && (
                <Icon
                  name="checkmark-circle"
                  size={19}
                  color={COLORS.success}
                />
              )}
            </View>
            {!emailVerify && email.length > 0 && (
              <Text style={styles.errorText}>Please enter a valid email address</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text
              style={[
                styles.label,
                {color: isDarkMode ? '#E2E8F0' : '#1E293B'},
              ]}>
              Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: passwordVerify
                    ? COLORS.success
                    : isDarkMode
                    ? '#334155'
                    : '#CBD5E1',
                },
              ]}>
              <Icon
                name="lock-closed-outline"
                size={19}
                color={passwordVerify ? COLORS.success : '#64748B'}
                style={styles.inputPrefixIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {color: isDarkMode ? '#F1F5F9' : '#0F172A'},
                ]}
                value={password}
                onChangeText={handlePassword}
                secureTextEntry={secureTextEntry}
                placeholder="Enter account security password"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>
            {!passwordVerify && password.length > 0 && (
              <Text style={styles.errorText}>
                Password must be at least 6 characters
              </Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => setEmailInputVisible(true)}
            activeOpacity={0.7}
            hitSlop={{top: 8, bottom: 8, left: 10, right: 10}}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              loginMutation.isPending && styles.buttonDisabled,
            ]}
            onPress={validateAndSubmit}
            disabled={loginMutation.isPending}
            activeOpacity={0.85}>
            {loginMutation.isPending ? (
              <View style={styles.buttonLoadingRow}>
                <Icon name="sync-outline" size={18} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Authenticating Session...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Sign In to Portal</Text>
            )}
          </TouchableOpacity>

          {/* Or Divider */}
          <View style={styles.orDividerRow}>
            <View
              style={[
                styles.orDividerLine,
                {backgroundColor: isDarkMode ? '#334155' : '#E2E8F0'},
              ]}
            />
            <Text
              style={[
                styles.orDividerText,
                {color: isDarkMode ? '#64748B' : '#94A3B8'},
              ]}>
              OR INSTANT PREVIEW
            </Text>
            <View
              style={[
                styles.orDividerLine,
                {backgroundColor: isDarkMode ? '#334155' : '#E2E8F0'},
              ]}
            />
          </View>

          {/* Guest Explorer Card */}
          <TouchableOpacity
            style={[
              styles.guestButton,
              {
                backgroundColor: isDarkMode ? '#0F172A' : '#F0F9FF',
                borderColor: isDarkMode ? '#0284C7' : '#BAE6FD',
              },
            ]}
            onPress={handleGuestExplorer}
            activeOpacity={0.85}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.guestIconCircle}>
                <Icon name="compass" size={20} color="#0284C7" />
              </View>
              <View style={styles.guestTextContainer}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <Text
                    style={[
                      styles.guestTitle,
                      {color: isDarkMode ? '#F1F5F9' : '#0F172A'},
                    ]}>
                    Explore in Guest Mode
                  </Text>
                  <View style={styles.guestDemoBadge}>
                    <Text style={styles.guestDemoBadgeText}>SANDBOX</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.guestSubtitle,
                    {color: isDarkMode ? '#94A3B8' : '#0369A1'},
                  ]}>
                  Instant access to Reviewer Queue & Super Admin Console
                </Text>
              </View>
              <Icon name="arrow-forward" size={18} color="#0284C7" />
            </View>

            {/* Quick feature tags */}
            <View style={styles.guestFeatureRow}>
              <View style={[styles.guestFeatureChip, {backgroundColor: isDarkMode ? '#1E293B' : '#E0F2FE'}]}>
                <Icon name="shield-checkmark" size={11} color="#0284C7" />
                <Text style={styles.guestFeatureText}>Governance Console</Text>
              </View>
              <View style={[styles.guestFeatureChip, {backgroundColor: isDarkMode ? '#1E293B' : '#E0F2FE'}]}>
                <Icon name="document-text" size={11} color="#0284C7" />
                <Text style={styles.guestFeatureText}>Applicant CVs</Text>
              </View>
              <View style={[styles.guestFeatureChip, {backgroundColor: isDarkMode ? '#1E293B' : '#E0F2FE'}]}>
                <Icon name="sparkles" size={11} color="#0284C7" />
                <Text style={styles.guestFeatureText}>AI & Plagiarism</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security & Access Notice */}
        <View style={styles.securityNotice}>
          <View style={styles.securityBadge}>
            <Icon name="shield-checkmark-outline" size={14} color="#0284C7" />
            <Text style={styles.securityBadgeText}>
              Authorized Reviewers Only
            </Text>
          </View>
        </View>
      </ScrollView>

      <EmailInputModal
        callback={(emailStr: string) => {
          if (!isConnected) {
            Snackbar.show({
              text: 'You are currently offline',
              duration: Snackbar.LENGTH_SHORT,
            });
            return;
          }
          setOtpMail(emailStr);
          sendOtpMutation.mutate({
            email: emailStr,
          });
        }}
        isLoading={sendOtpMutation.isPending}
        visible={emailInputVisible}
        backButtonClick={handleEmailInputBack}
        onDismiss={() => setEmailInputVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  offlineBanner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: hp(2.5),
    paddingBottom: 40,
  },
  portalHeader: {
    paddingTop: hp(4),
    paddingBottom: hp(2),
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  systemStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  systemDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  systemStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.1,
  },
  portalLogoTile: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  portalLogo: {
    width: 62,
    height: 62,
    borderRadius: 18,
  },
  portalBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  brandTitleDark: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandTitleAccent: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: -0.4,
  },
  portalSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },

  card: {
    marginHorizontal: wp(5),
    borderRadius: 20,
    borderWidth: 1,
    padding: wp(6),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12.5,
    fontWeight: '400',
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 7,
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputPrefixIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 5,
    marginLeft: 2,
  },

  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -2,
  },
  forgotText: {
    color: '#0284C7',
    fontWeight: '600',
    fontSize: 13,
  },

  loginButton: {
    backgroundColor: '#0284C7',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },

  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
  },
  orDividerText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.1,
  },

  guestButton: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  guestDemoBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  guestDemoBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  guestFeatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(2, 132, 199, 0.15)',
  },
  guestFeatureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  guestFeatureText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  guestIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
  },
  guestTextContainer: {
    flex: 1,
  },
  guestTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  guestSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },

  securityNotice: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 22,
    gap: 6,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 16,
  },
  securityBadgeText: {
    color: '#0284C7',
    fontSize: 11.5,
    fontWeight: '600',
  },
  securityFooterText: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
