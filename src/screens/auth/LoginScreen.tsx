import React, { useState } from 'react';
import { View, StatusBar, Image, Text, TextInput, TouchableOpacity, Alert, useColorScheme, StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ON_PRIMARY_COLOR, PRIMARY_COLOR } from '../../helper/Theme';
import messaging from '@react-native-firebase/messaging';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import EmailInputModal from '../../components/EmailInputModal';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { LOGIN_API } from '../../helper/APIUtils';
import { Admin, AuthData } from '../../type';
import { storeItem, KEYS } from '../../helper/Utils';
import { setUserId, setUserToken, setUserHandle } from '../../stores/UserSlice';
import { useDispatch } from 'react-redux';
import { wp, hp, fp } from '../../helper/Metric';


export default function LoginScreen({navigation}){

    const inset = useSafeAreaInsets();
    const dispatch = useDispatch();
    const isDarkMode = useColorScheme() === 'dark';
    const [emailInputVisible, setEmailInputVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState(false);
    const [email, setEmail] = useState('');
    const [otpMail, setOtpMail] = useState('');
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [emailVerify, setEmailVerify] = useState(false);
    const [output, setOutput] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState(false);
    const [emailMessage, setEmailMessage] = useState(false);
  
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const handleSecureEntryClickEvent = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    async function requestUserPermission() {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
        if (enabled) {
          console.log('Authorization status:', authStatus);
        }
      }
    
      async function getFCMToken() {
        await requestUserPermission(); // Ask for permission (iOS only)
        const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setFcmToken(fcmToken);
        } else {
          console.log('Failed to get FCM Token');
          return null;
        }
      }
    
      const validateAndSubmit = async () => {
        if (validate()) {
          await getFCMToken();
          setPasswordMessage(false);
          setEmailMessage(false);
          loginMutation.mutate();
        } else {
          setOutput(true);
          setPasswordMessage(false);
          setEmailMessage(false);
          if (output && !passwordVerify) {
            setPasswordMessage(true);
          }
          if (output && !emailVerify) {
            setEmailMessage(true);
          }
        }
      };
    
      const validate = () => {
        if (emailVerify && passwordVerify) {
          return true;
        } else {
          return false;
        }
      };
      const handlePassword = e => {
        let pass = e.nativeEvent.text;
        setPassword(pass);
        setPasswordVerify(false);
    
        if (/(?=.*[a-z]).{6,}/.test(pass)) {
          setPassword(pass);
          setPasswordVerify(true);
        }
      };
    
      const handleEmail = e => {
        let email = e.nativeEvent.text;
        setEmail(email);
        setEmailVerify(false);
        if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
          setEmail(email);
          setEmailVerify(true);
        }
      };

      const handleEmailInputBack = () => {
        setEmailInputVisible(false);
      };

      const loginMutation = useMutation({
        mutationKey: ['login'],
        mutationFn: async () => {
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
            user_handle: data?.user_handle
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
              dispatch(setUserHandle(auth.user_handle));
              setTimeout(() => {
                navigation?.reset({
                  index: 0,
                  routes: [{name: 'TabNavigation'}], // Send user to LoginScreen after logout
                });
                //navigation.navigate('TabNavigation');
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
    return (
        <View style={styles.container}>
          <StatusBar
            barStyle={isDarkMode ? 'dark-content' : 'light-content'}
            backgroundColor={PRIMARY_COLOR}
          />
          <View style={[styles.innercontainer, {paddingTop: inset.top}]}>
            <View style={styles.logoContainer}>
              {/* image */}
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
              />
              {/* brand text container */}
              <View style={{marginTop: wp(2)}}>
                <Text style={styles.brandText}>Ultimate Health Admin</Text>
              </View>
            </View>
            {/* login form */}
            <View
              style={[
                styles.formContainer,
                {backgroundColor: isDarkMode ? Colors.darker : 'white'},
              ]}>
              {/* email input */}
              <View style={styles.input}>
                <TextInput
                  onChange={e => handleEmail(e)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="email-address"
                  placeholder="Enter your mail id"
                  placeholderTextColor="#948585"
                  style={[
                    styles.inputControl,
                    {
                      borderColor: isDarkMode ? 'white' : 'black',
                      color: isDarkMode ? 'white' : 'black',
                    },
                  ]}
                />
                {emailMessage ? (
                  <Text style={{color: 'red'}}>Please Enter a Valid Email</Text>
                ) : (
                  <Text style={{color: 'red'}} />
                )}
              </View>
              <View style={styles.input}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    keyboardType="ascii-capable"
                    placeholder="Password"
                    placeholderTextColor="#948585"
                    secureTextEntry={secureTextEntry}
                    style={[
                      styles.inputControl,
                      {
                        borderColor: isDarkMode ? 'white' : 'black',
                        color: isDarkMode ? 'white' : 'black',
                      },
                    ]}
                    onChange={e => handlePassword(e)}
                    value={password}
                    underlineColorAndroid="transparent"
                  />
    
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={handleSecureEntryClickEvent}>
                    {secureTextEntry ? (
                      <Icon
                        name="eye-off"
                        size={20}
                        color={isDarkMode ? 'white' : 'black'}
                      />
                    ) : (
                      <Icon
                        name="eye"
                        size={20}
                        color={isDarkMode ? 'white' : 'black'}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {passwordMessage ? (
                  <Text style={{color: 'red'}}>
                    Password must be 6 Characters Longs
                  </Text>
                ) : (
                  <Text style={{color: 'red'}} />
                )}
              </View>
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => {
                  //console.log('Forgot Password Click');
                  setEmailInputVisible(!emailInputVisible);
                }}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
    
              <View style={styles.loginButtonContainer}>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => {
                    validateAndSubmit();
                  }}>
                  <Text style={styles.loginText}>Login</Text>
                </TouchableOpacity>
              </View>
    
            
              <EmailInputModal
                // eslint-disable-next-line @typescript-eslint/no-shadow
                callback={(email: string) => {
                  setOtpMail(email);
                 // sendOtpMutation.mutate({
                //    email: email,
                //  });
                }}
                visible={emailInputVisible}
                backButtonClick={handleEmailInputBack}
                onDismiss={() => setEmailInputVisible(false)}
              />
    
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: '600',
                  marginBottom: 4,
                  alignSelf: 'center',
                }}>
                or
              </Text>
              <View style={styles.createAccountContainer}>
                <TouchableOpacity
                  style={{...styles.loginButton, backgroundColor: '#FF0000'}}>
                  <Text
                    style={[
                      styles.createAccountText,
                      {
                        // color: isDarkMode ? 'white' : 'black',
                        color: 'white',
                      },
                    ]}
                    onPress={() => {
                      navigation.navigate('SignUpScreen');
                    }}>
                    Create new account
                  </Text>
                </TouchableOpacity>
              </View>
    
              <View style={styles.loginButtonContainer}>
                <TouchableOpacity
                  style={{...styles.loginButton, backgroundColor: '#DE3163'}}
                  onPress={() => {
                    //validateAndSubmit();
                    if (email === '') {
                      Alert.alert('Please enter your mail id');
                      return;
                    }
                   // requestVerification.mutate();
                  }}>
                  <Text style={styles.loginText}>Request Verification</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        // <DropDownComponent data={Categories} />
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    innercontainer: {
      flex: 1,
      backgroundColor: PRIMARY_COLOR,
    },
    logoContainer: {
      flex: 0,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(3),
      marginTop: hp(2),
      flexDirection: 'column',
      marginHorizontal: 18,
      marginLeft: wp(2),
    },
    logo: {
      height: hp(10),
      width: wp(20),
      borderRadius: 100,
      resizeMode: 'cover',
    },
    brandText: {
      color: 'white',
      fontSize: fp(6),
      fontFamily: 'Lobster-Regular',
    },
    formContainer: {
      flex: 1,
      marginTop: 10,
      borderWidth: 10,
      borderColor: ON_PRIMARY_COLOR,
      borderTopRightRadius: wp(2),
      borderTopLeftRadius: wp(26),
      paddingHorizontal: wp(8),
      paddingTop: hp(10),
      flexDirection: 'column',
    },
    input: {
      flexDirection: 'row',
      marginBottom: hp(2),
      justifyContent: 'flex-start',
    },
    inputLabel: {
      fontSize: fp(4),
      fontWeight: '600',
      color: '#948585',
      marginBottom: hp(1),
    },
  
    inputControl: {
      borderBottomWidth: 1,
      width: '100%',
      paddingRight: 40,
      fontSize: fp(4),
      fontWeight: '500',
      height: hp(5),
    },
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginVertical: 2,
    },
    forgotPasswordText: {color: '	#000080', fontWeight: '600', marginBottom: 6},
    loginButtonContainer: {marginVertical: hp(2)},
    loginButton: {
      backgroundColor: PRIMARY_COLOR,
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(10),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      width: '96%',
    },
    loginText: {
      fontSize: fp(5),
      fontWeight: '700',
      color: '#fff',
    },
    createAccountContainer: {marginVertical: hp(1), alignItems: 'center'},
    createAccountText: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 5,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    eyeIcon: {
      position: 'absolute',
      right: 0,
      padding: 10,
    },
  });