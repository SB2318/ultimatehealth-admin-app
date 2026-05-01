import React, {useState} from 'react';
import useUploadImage from '../../hooks/useUploadImage';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import axios, {AxiosError} from 'axios';
import {
  CHECK_USER_HANDLE,
  REGISTRATION_API,
  VERIFICATION_MAIL_API,
} from '../../helper/APIUtils';
import {useMutation} from '@tanstack/react-query';
import Snackbar from 'react-native-snackbar';

import AntDesign from '@expo/vector-icons/AntDesign';
import Icon from '@expo/vector-icons/MaterialIcons';
import Loader from '../../components/Loader';
import EmailVerifiedModal from '../../components/EmailVerifiedModal';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ScrollView,
  YStack,
  Text,
  Button,
  XStack,
  Input,
  Spinner,
} from 'tamagui';
import validator from 'email-validator';
import {useSelector} from 'react-redux';
import {SignUpScreenProp} from '@/src/type';

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  surface: '#FFFFFF',
  text: '#0F172A',
  secondaryText: '#64748B',
  success: '#10B981',
  error: '#EF4444',
};

export default function SignUpScreen({navigation}: SignUpScreenProp) {
  const {uploadImage, loading} = useUploadImage();
  const [user_profile_image, setUserProfileImage] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyBtntext, setVerifyBtntxt] = useState('Request Verification');
  const [verifiedModalVisible, setVerifiedModalVisible] = useState(false);
  const [isHandleAvailable, setIsHandleAvailable] = useState(true);
  const [token, setToken] = useState('');
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [error, setError] = useState('');
  const {isConnected} = useSelector((state: any) => state.network);

  const selectImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        // console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        const {uri, fileSize} = response.assets[0];

        // Check file size (1 MB limit)
        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 1 MB.');
          return;
        }

        if (uri) {
          ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 100)
            .then(async resizedImageUri => {
              setUserProfileImage(resizedImageUri.uri);
            })
            .catch(err => {
              console.log(err);
              Alert.alert('Error', 'Could not resize the image.');
              setUserProfileImage('');
            });
        }
      }
    });
  };

  const checkUserHandleAvailability = async handle => {
    try {
      const response = await axios.post(CHECK_USER_HANDLE, {
        userHandle: username,
      });
      if (response.data.status === true) {
        setIsHandleAvailable(true);
        console.log('User Handle ', isHandleAvailable);
      } else {
        setIsHandleAvailable(false);
        console.log('User Handle ', isHandleAvailable);
        setError(response.data.error); // Show the error message
      }
    } catch (err) {
      console.error('Error checking user handle:', err);
      setError('An error occurred while checking the user handle.');
    }
  };

  const handleUserHandleChange = text => {
    setUsername(text);
    if (text.length > 2) {
      // Check if the user handle is available every time the user types
      checkUserHandleAvailability(text);
    } else {
      setIsHandleAvailable(true);
      setError('');
    }
  };

  const verifyMail = useMutation({
    mutationKey: ['send-verification-mail'],
    mutationFn: async () => {
      const res = await axios.post(VERIFICATION_MAIL_API, {
        email: email,
        token: token,
        isAdmin: true,
      });

      return res.data.message as string;
    },

    onSuccess: data => {
      setVerifyBtntxt(data);
      Alert.alert('Verification Email Sent');
      navigation.navigate('LoginScreen');
    },
    onError: (error: AxiosError) => {
      console.log('Email Verification error', error);

      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400: {
            if (error.message === 'Email and token are required') {
              Alert.alert('Error', 'Email and token are required');
            } else if (error.message === 'User not found or already verified') {
              Alert.alert('Error', 'User not found or already verified');
            } else {
              Alert.alert('Error', 'Please provide all required fields');
            }
            break;
          }
          case 429: {
            Alert.alert(
              'Error',
              'Verification email already sent. Please try again after 1 hour.',
            );
            setVerifyBtntxt('Verification mail already sent');
            setVerifiedModalVisible(false);
            break;
          }

          case 500: {
            Alert.alert(
              'Error',
              'Internal server error. Please try again later.',
            );
            break;
          }
          default:
            Alert.alert(
              'Error',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        console.log('Email Verification error', error);
        Alert.alert('Error', 'Please try again');
      }
    },
  });

  const handleVerifyModalCallback = () => {
    if (!isConnected) {
      Snackbar.show({
        text: 'You are currently offline',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    if (token.length > 0) {
      verifyMail.mutate();
    } else {
      Alert.alert(
        'Failed to authenticate, Token not found',
        'Please try again',
      );
    }
  };
  const handleSubmit = () => {
    if (isHandleAvailable) {
      return;
    }
    if (!name || !username || !email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    } else if (validator.validate(email) === false) {
      Alert.alert('Email id is not valid');
      return;
    } else if (password.length < 6) {
      Alert.alert('Password must be at least of 6 length');
      return;
    }
    registerAdmin();
  };

  const adminRegisterMutation = useMutation({
    mutationKey: ['admin-user-registration'],
    mutationFn: async ({profile_url}: {profile_url: string}) => {
      const res = await axios.post(REGISTRATION_API, {
        user_name: name,
        user_handle: username,
        email: email,
        password: password,
        // isDoctor: false,
        Profile_avtar: profile_url,
      });
      return res.data.token as string;
    },
    onSuccess: data => {
      setToken(data);
      setVerifiedModalVisible(true);
    },

    onError: (err: AxiosError) => {
      console.log(err.message);
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            const errorData = err.message;
            console.log('Error message', errorData);
            Alert.alert('Registration failed', 'Please try again');
            break;
          case 409:
            Alert.alert(
              'Registration failed',
              'Email or user handle already exists',
            );
            break;
          case 500:
            Alert.alert(
              'Registration failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            Alert.alert(
              'Registration failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        console.log('General User Registration Error', err);
        Alert.alert('Registration failed', 'Please try again');
      }
    },
  });

  const registerAdmin = async () => {
    Alert.alert(
      '',
      'Are you sure you want to use this image?',
      [
        {
          text: 'Cancel',
          onPress: () => {
            if (!isConnected) {
              Snackbar.show({
                text: 'You are currently offline',
                duration: Snackbar.LENGTH_SHORT,
              });
              return;
            }
            // setUserProfileImage(user?.Profile_image || '');
            setUserProfileImage('');
            Snackbar.show({
              text: 'Your profile image will not  be uploaded.',
              duration: Snackbar.LENGTH_SHORT,
            });
            adminRegisterMutation.mutate({
              profile_url: '',
            });
          },
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Upload the resized image
              if (!isConnected) {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
                return;
              }
              let result;
              if (user_profile_image && user_profile_image.length > 0) {
                result = await uploadImage(user_profile_image);
              }

              adminRegisterMutation.mutate({
                profile_url: result ? result : '',
              });
              //setSubmitProfileUrl(result ? result : '');
            } catch (err) {
              console.error('Upload failed');
              Alert.alert('Error', 'Upload failed');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  if (adminRegisterMutation.isPending || verifyMail.isPending || loading) {
    return <Loader />;
  }

  const isLoading =
    adminRegisterMutation.isPending || verifyMail.isPending || loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: '#F8FAFC'}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          {/* Gradient Header */}
          <YStack
            backgroundColor={COLORS.primary}
            paddingTop="$8"
            paddingBottom="$9"
            alignItems="center"
            borderBottomLeftRadius={32}
            borderBottomRightRadius={32}>
            {/* <Image
              source={require('../../../assets/images/icon.png')}
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                marginBottom: 6,
              }}
            /> */}
            <Text
              color="white"
              fontSize={28}
              fontWeight="700"
              textAlign="center"
              marginBottom="$1"
              >
              Create Admin Account
            </Text>
            <Text color="#E0F2FE" fontSize={16} marginTop="$1">
              Join the management portal
            </Text>
          </YStack>

          {/* Profile Avatar */}
          <YStack alignItems="center" marginTop={-20} zIndex={10}>
            <TouchableOpacity onPress={selectImage} activeOpacity={0.8}>
              <YStack
                width={100}
                height={100}
                borderRadius={50}
                backgroundColor="white"
                shadowColor="#000"
                shadowOffset={{width: 0, height: 8}}
                shadowOpacity={0.15}
                shadowRadius={20}
                elevation={15}
                alignItems="center"
                justifyContent="center"
                overflow="hidden">
                {user_profile_image ? (
                  <Image
                    source={{uri: user_profile_image}}
                    style={{width: 100, height: 100, borderRadius: 50}}
                  />
                ) : (
                  <YStack
                    width={100}
                    height={100}
                    backgroundColor={COLORS.primary}
                    alignItems="center"
                    justifyContent="center">
                    <AntDesign name="camera" size={36} color="white" />
                  </YStack>
                )}
                <YStack
                  position="absolute"
                  bottom={4}
                  right={4}
                  backgroundColor="white"
                  borderRadius={999}
                  padding={6}
                  shadowColor="#000"
                  shadowOpacity={0.2}
                  elevation={5}>
                  <AntDesign name="edit" size={18} color={COLORS.primary} />
                </YStack>
              </YStack>
            </TouchableOpacity>
            <Text marginTop="$2" color={COLORS.secondaryText} fontSize={14}>
              Tap to change photo
            </Text>
          </YStack>

          {/* Form Card */}
          <YStack
            marginHorizontal="$5"
            marginTop="$6"
            backgroundColor="white"
            borderRadius={20}
            padding="$6"
            shadowColor="#000"
            shadowOffset={{width: 0, height: 10}}
            shadowOpacity={0.08}
            shadowRadius={20}
            elevation={12}>
            <Input
              placeholder="Full Name"
              value={name}
              onChangeText={e => setName(e.nativeEvent.text)}
              height={52}
              backgroundColor="white"
              color={COLORS.text}
              //placeholderTextColor={COLORS.secondaryText}
              borderWidth={1.5}
              borderRadius={10}
              borderColor="#E2E8F0"
              focusStyle={{
                borderColor: COLORS.primary,
                backgroundColor: 'white',
              }}
              fontSize={16}
            />

            <XStack position="relative" marginTop="$4">
              <Input
                flex={1}
                placeholder="User Handle"
                value={username}
                backgroundColor="white"
                onChangeText={u => setUsername(u.nativeEvent.text)}
                height={52}
                borderWidth={1.5}
                borderRadius={10}
                borderColor={
                  isHandleAvailable === false ? COLORS.error : "#E2E8F0"
                }
                focusStyle={{borderColor: COLORS.primary}}
                fontSize={16}
              />
              {isHandleAvailable !== null && username.length > 2 && (
                <Text
                  position="absolute"
                  right={16}
                  top={16}
                  color={isHandleAvailable ? COLORS.success : COLORS.error}
                  fontSize={14}
                  fontWeight="600">
                  {isHandleAvailable
                    ? 'User handle is available'
                    : error || 'User handle is already in use'}
                </Text>
              )}
            </XStack>

            <Input
              marginTop="$4"
              placeholder="Email Address"
              value={email}
              onChangeText={e => setEmail(e.nativeEvent.text)}
              backgroundColor="white"
              color={COLORS.text}
              keyboardType="email-address"
              autoCapitalize="none"
              height={52}
              borderWidth={1.5}
              borderColor="#E2E8F0"
              borderRadius={10}
              //borderColor={COLORS.border}
              focusStyle={{
                borderColor: COLORS.primary,
                backgroundColor: 'white',
              }}
              fontSize={16}
            />

            <XStack position="relative" marginTop="$4">
              <Input
                flex={1}
                placeholder="Password"
                value={password}
                onChangeText={e => setPassword(e.nativeEvent.text)}
                secureTextEntry={isSecureEntry}
                height={52}
                backgroundColor="white"
                color={COLORS.text}
                borderWidth={1.5}
                borderColor="#E2E8F0"
                borderRadius={10}
                focusStyle={{
                  borderColor: COLORS.primary,
                  backgroundColor: 'white',
                }}
                fontSize={16}
              />
              <TouchableOpacity
                onPress={() => setIsSecureEntry(!isSecureEntry)}
                style={{position: 'absolute', right: 16, top: 16}}>
                <AntDesign
                  name={isSecureEntry ? 'eye-invisible' : 'eye'}
                  size={22}
                  color={COLORS.secondaryText}
                />
              </TouchableOpacity>
            </XStack>

            <Button
              marginTop="$6"
              height={56}
              backgroundColor={COLORS.primaryDark}
              borderRadius={14}
              onPress={handleSubmit}
              disabled={isLoading || isHandleAvailable === false}
              pressStyle={{scale: 0.98}}>
              {isLoading ? (
                <Spinner color="white" size="small" />
              ) : (
                <Text color="white" fontSize={18} fontWeight="700">
                  Create Account
                </Text>
              )}
            </Button>

            <XStack justifyContent="center" marginTop="$5">
              <Text color={COLORS.secondaryText}>
                Already have an account?{' '}
              </Text>
              <Text
                color={COLORS.primary}
                fontWeight="600"
                onPress={() => navigation.navigate('LoginScreen')}>
                Sign in
              </Text>
            </XStack>
          </YStack>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  // return (
  //   <ScrollView
  //     backgroundColor="$background"
  //     showsVerticalScrollIndicator={false}>
  //     <SafeAreaView>
  //       {/* Header */}
  //       <YStack
  //         width="94%"
  //         height={140}
  //         alignItems="center"
  //         justifyContent="center"
  //         backgroundColor="$blue10"
  //         alignSelf="center"
  //         borderRadius="$4"
  //         marginTop="$2"
  //         padding="$3"
  //         space="$2">
  //         <Text fontSize={16} color="white" textAlign="center" fontWeight="600">
  //           He who has health has hope and he who has hope has everything.
  //         </Text>
  //         <Text fontSize={16} color="white" textAlign="center" fontWeight="600">
  //           ~ Arabian Proverb.
  //         </Text>
  //       </YStack>

  //       {/* Profile Image */}
  //       <YStack alignItems="center" marginTop="$4" marginBottom="$3">
  //         <Button
  //           circular
  //           size="$9"
  //           backgroundColor="$blue10"
  //           onPress={selectImage}
  //           padding="$3">
  //           {user_profile_image === '' ? (
  //             <AntDesign
  //               name="camera"
  //               size={26}
  //               color="#ffffff"
  //               style={{transform: [{scaleX: -1}]}}
  //             />
  //           ) : (
  //             <Image
  //               source={{uri: user_profile_image}}
  //               style={{
  //                 height: 80,
  //                 width: 80,
  //                 borderRadius: 40,
  //               }}
  //             />
  //           )}
  //         </Button>
  //       </YStack>

  //       {/* Title */}
  //       <Text
  //         fontSize={20}
  //         fontWeight="700"
  //         color="$blue10"
  //         textAlign="center"
  //         textTransform="uppercase">
  //         Sign up
  //       </Text>

  //       {/* Form */}
  //       <YStack padding="$4" space="$4">
  //         {/* Name */}
  //         <XStack position="relative">
  //           <Input
  //             flex={1}
  //             height="$5"
  //             borderColor="$blue10"
  //             borderWidth={1}
  //             borderRadius="$3"
  //             placeholder="Name"
  //             value={name}
  //             onChangeText={setName}
  //           />
  //           <YStack position="absolute" right={14} top={10}>
  //             <Icon name="person" size={20} color="#000" />
  //           </YStack>
  //         </XStack>

  //         {/* Handle Error */}
  //         {isHandleAvailable && (
  //           <Text color="red" fontSize={14}>
  //             User handle is already in use.
  //           </Text>
  //         )}

  //         {/* User Handle */}
  //         <XStack position="relative">
  //           <Input
  //             flex={1}
  //             height="$5"
  //             borderColor="$blue10"
  //             borderWidth={1}
  //             borderRadius="$3"
  //             placeholder="User Handle"
  //             value={username}
  //             onChangeText={handleUserHandleChange}
  //           />
  //           <YStack position="absolute" right={14} top={10}>
  //             <Icon name="person" size={20} color="#000" />
  //           </YStack>
  //         </XStack>

  //         {/* Email */}
  //         <XStack position="relative">
  //           <Input
  //             flex={1}
  //             height="$5"
  //             borderColor="$blue10"
  //             borderWidth={1}
  //             borderRadius="$3"
  //             placeholder="Email"
  //             value={email}
  //             onChangeText={setEmail}
  //             keyboardType="email-address"
  //           />
  //           <YStack position="absolute" right={14} top={10}>
  //             <Icon name="email" size={20} color="#000" />
  //           </YStack>
  //         </XStack>

  //         {/* Password */}
  //         <XStack position="relative">
  //           <Input
  //             flex={1}
  //             height="$5"
  //             borderColor="$blue10"
  //             borderWidth={1}
  //             borderRadius="$3"
  //             placeholder="Password"
  //             value={password}
  //             onChangeText={setPassword}
  //             secureTextEntry={isSecureEntry}
  //           />
  //           <Button
  //             chromeless
  //             position="absolute"
  //             right={1}
  //             top={8}
  //             onPress={() => setIsSecureEntry(!isSecureEntry)}>
  //             <AntDesign
  //               name={isSecureEntry ? 'eye-invisible' : 'eye'}
  //               size={17}
  //               color="#000"
  //             />
  //           </Button>
  //         </XStack>

  //         {/* Role Dropdown */}

  //         {/* Submit Button */}
  //         <Button
  //           backgroundColor="$blue10"
  //           size={'$7'}
  //           padding="$3"
  //           borderRadius="$4"
  //           alignItems="center"
  //           alignSelf="center"
  //           width="100%"
  //           onPress={handleSubmit}>
  //           <Text color="white" fontWeight="bold" fontSize={18}>
  //             Register
  //           </Text>
  //         </Button>
  //       </YStack>

  //       {/* Modal */}
  //       <EmailVerifiedModal
  //         visible={verifiedModalVisible}
  //         onClick={handleVerifyModalCallback}
  //         onClose={() => {
  //           if (verifyBtntext !== 'Request Verification') {
  //             setVerifiedModalVisible(false);
  //           }
  //         }}
  //         message={verifyBtntext}
  //       />
  //     </SafeAreaView>
  //   </ScrollView>
  // );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   header: {
//     width: '100%',
//     height: hp(10),
//     paddingTop: 5,
//     alignItems: 'center',
//     // backgroundColor: PRIMARY_COLOR,
//   },
//   footer: {
//     flex: 1,
//     width: '90%',
//     paddingTop: 20,
//     alignSelf: 'center',
//     backgroundColor: 'white',
//     marginTop: -60,
//     borderRadius: 10,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#000',
//     textAlign: 'center',
//     marginTop: 4,
//   },
//   iconContainer: {
//     alignSelf: 'center',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: hp(3),
//     marginBottom: 10,
//     height: hp(11),
//     width: hp(11),
//     borderRadius: hp(5.5),
//     marginLeft: 10,
//     backgroundColor: PRIMARY_COLOR,
//   },
//   form: {
//     padding: 16,
//   },
//   field: {},
//   input: {
//     height: hp(7),
//     //width:'98%',
//     borderColor: '#0CAFFF',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 6,
//     marginBottom: 20,
//     fontSize: 15,
//   },
//   error: {
//     color: 'red',
//     fontSize: 14,
//     marginBottom: 10,
//   },
//   inputIcon: {
//     position: 'absolute',
//     right: 14,
//     top: 12,
//   },
//   inputIcon2: {
//     position: 'absolute',
//     right: 14,
//     top: 8,
//   },
//   button: {
//     backgroundColor: '#0CAFFF',
//     padding: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//     alignSelf: 'center',
//     marginTop: 20,
//     width: '100%',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   dropdown: {
//     height: 40,
//     borderColor: '#0CAFFF',
//     borderWidth: 1,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//     paddingRight: 12,
//   },
//   placeholderStyle: {
//     fontSize: 15,
//   },
// });
