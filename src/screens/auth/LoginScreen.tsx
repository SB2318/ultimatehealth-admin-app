import React, { useState } from 'react';
import { View, ScrollView, StatusBar, Image, Text, TextInput, TouchableOpacity, Alert, useColorScheme, StyleSheet } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR } from '../../helper/Theme';
//import { getMessaging, getToken } from 'firebase/messaging';

import messaging from '@react-native-firebase/messaging';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import EmailInputModal from '../../components/EmailInputModal';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { LOGIN_API, RESEND_VERIFICATION, SEND_OTP } from '../../helper/APIUtils';
import { Admin, AuthData } from '../../type';
import { storeItem, KEYS } from '../../helper/Utils';
import { setUserId, setUserToken, setUserHandle } from '../../stores/UserSlice';
import { useDispatch } from 'react-redux';
import { wp, hp, fp } from '../../helper/Metric';
import { getApp } from '@react-native-firebase/app';
import { useFirebaseMessaging } from '../../hooks/FirebaseContext';
//import { getApp } from '@react-native-firebase/app';

//import { useFirebaseMessaging } from '../../hooks/FirebaseContext';
//import { getToken } from 'firebase/messaging';


export default function LoginScreen({navigation}){

  //const messaging1 = useFirebaseMessaging();
    const inset = useSafeAreaInsets();
    const { fcmToken } = useFirebaseMessaging();
    const dispatch = useDispatch();
    const isDarkMode = useColorScheme() === 'dark';
    const [emailInputVisible, setEmailInputVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState(false);
    const [email, setEmail] = useState('');
    const [otpMail, setOtpMail] = useState('');
  //  const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [emailVerify, setEmailVerify] = useState(false);
    const [output, setOutput] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState(false);
    const [emailMessage, setEmailMessage] = useState(false);
  
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const handleSecureEntryClickEvent = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    async function requestUserPermission() {
      try {
        // Request user permission to receive notifications
        const authStatus = await messaging().requestPermission();
    
        // Check if the authorization status is either AUTHORIZED or PROVISIONAL
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
        if (enabled) {
          console.log('Authorization status:', authStatus);
        } else {
          console.log('Notification permission denied');
        }
      } catch (error) {
        console.error('Error requesting permission:', error);
      }
    }
    
    /*
    async function getFCMToken() {
      await requestUserPermission(); // Ask for permission (iOS only)
      
      try {
      //  const app = getApp('UTH_Admin'); // Initialize the app (ensure Firebase is configured correctly)
       // const messaging2 = getMessaging(app);
    
        // Get the FCM Token
        const  fcmToken = await getApp().messaging().getToken();
        //const fcmToken = await getToken(messaging1);
    
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setFcmToken(fcmToken); // Update state with the FCM token
        } else {
          console.log('Failed to get FCM Token');
          return null;
        }
      } catch (error) {
        console.error('Error getting FCM Token:', error);
      }
    }
      */
    
      const validateAndSubmit = async () => {
        if (validate()) {
         // await getFCMToken();
          setPasswordMessage(false);
          setEmailMessage(false);
          console.log('enter')
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
          console.log("Login Mutation Enter");
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
              // set default header of axios
              axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
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
                Alert.alert('Error', 'User with this email does not exist.' + error.message);
              } else if (error.response.status === 500) {
                Alert.alert('Error', 'Error sending email.' +  error.message);
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
        <ScrollView style={styles.container}>
          <StatusBar
            barStyle={isDarkMode ? 'dark-content' : 'light-content'}
            backgroundColor={BUTTON_COLOR}
          />
          <View style={[styles.innercontainer, {paddingTop: inset.top}]}>
            <View style={styles.logoContainer}>
              {/* image */}
              <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
          />
              {/* brand text container */}
              
            </View>
            {/* login form */}
            <View
              style={[
                styles.formContainer,
                {backgroundColor: isDarkMode ? Colors.darker : 'white'},
              ]}>
              {/* email input */}
              <Text style={styles.inputLabelTxt}>Email</Text>
              {emailMessage ? (
                  <Text style={{color: 'red',}}>Please Enter a Valid Email</Text>
                ) : (
                  <Text style={{color: 'red'}} />
                )}
              <View style={styles.input}>
                
                <TextInput
                  onChange={e => handleEmail(e)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="email-address"
                  //placeholder="Enter your mail id"
                  placeholderTextColor="#948585"
                  style={[
                    styles.inputControl,
                    {
                      borderColor: isDarkMode ? 'white' : 'black',
                      color: isDarkMode ? 'white' : 'black',
                    },
                  ]}
                />
               
              </View>
              <Text style={styles.inputLabelTxt}>Password</Text>
              {passwordMessage ? (
                  <Text style={{color: 'red'}}>
                    Password must be 6 Characters Longs
                  </Text>
                ) : (
                  <Text style={{color: 'red'}} />
                )}
              <View style={styles.input}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    keyboardType="ascii-capable"
                    //placeholder="Password"
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
             
              </View>
            
    
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
                  sendOtpMutation.mutate({
                     email: email,
                  });
                }}
                visible={emailInputVisible}
                backButtonClick={handleEmailInputBack}
                onDismiss={() => setEmailInputVisible(false)}
                isRequestVerification={false}
                onRequestVerification={()=>{}}
              />
    
             
              <TouchableOpacity 
              style={styles.createAccountContainer}
              onPress={() => {
                navigation.navigate('SignUpScreen');
              }}>
                <View
                  style={{...styles.loginButton, backgroundColor: '#F5f5f5'}}>
                  <Text
                    style={[
                      styles.createAccountText,
                      {
                        // color: isDarkMode ? 'white' : 'black',
                        color: 'black',
                      },
                    ]}
                  >
                    Sign up
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => {
                  //console.log('Forgot Password Click');
                  setEmailInputVisible(!emailInputVisible);
                }}>
                <Text style={styles.inputLabelTxt}>Forgot Password?</Text>
              </TouchableOpacity>
    
              <View style={styles.loginButtonContainer}>
                <TouchableOpacity
                  style={{...styles.loginButton}}
                  onPress={() => {
                   // validateAndSubmit();
                    if (email === '') {
                      Alert.alert('Please enter your mail id');
                      return;
                    }
                    requestVerification.mutate();
                  }}>
                  <Text style={styles.loginText}>Request Verification</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        // <DropDownComponent data={Categories} />
      );
}

 const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    innercontainer: {
      flex: 1,
    //  backgroundColor: PRIMARY_COLOR,
    },
    logoContainer: {
      flex: 0,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      //marginBottom: hp(3),
      marginTop: hp(2),
      flexDirection: 'column',
      marginHorizontal: 18,
      marginLeft: wp(2),
    },
    logo: {
      height: hp(16),
      width: wp(20),
      borderRadius: 70,
      resizeMode: 'cover',
    },
    brandText: {
      color: 'black',
      fontSize: fp(4),
      fontFamily: 'Lobster-Regular',
      fontWeight: '600',
      alignSelf:'center'
    },
    formContainer: {
      flex: 1,
     // marginTop: hp(1),
     // borderWidth: 10,
     // borderColor: ON_PRIMARY_COLOR,
     // borderTopRightRadius: wp(2),
      //borderTopLeftRadius: wp(26),
      paddingHorizontal: wp(5.5),
      paddingTop: hp(3),
      flexDirection: 'column',
    },
    input: {
      flexDirection: 'column',
      marginBottom: hp(2),
      height: hp(6),
      justifyContent: 'center',
      alignItems:"center",
      borderWidth:1,
      borderRadius: 6,
      backgroundColor:'#f5f5f5',
      borderColor:"#99ccff"
    },
    inputLabel: {
      fontSize: fp(5),
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: hp(1),
    },

    inputLabelTxt: {
      fontSize: fp(4),
      fontWeight: '500',
      color: PRIMARY_COLOR,
      //marginLeft: hp(1),
      marginBottom: hp(1),
    },
  
    inputControl: {
     // borderWidth: 1,
      width: '100%',
      paddingRight: 40,
      fontSize: fp(4),
      fontWeight: '500',
      alignItems:"center",
      height: hp(5),
    },
    forgotPasswordContainer: {
      alignItems: 'flex-start',
      marginVertical: 2,
    },
    forgotPasswordText: {color: '	#000000', fontWeight: '700', marginBottom: 6},
    loginButtonContainer: {marginVertical: hp(2)},
    loginButton: {
      backgroundColor: PRIMARY_COLOR,
      paddingVertical: hp(1.3),
      paddingHorizontal: wp(1.3),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      width: '100%',
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