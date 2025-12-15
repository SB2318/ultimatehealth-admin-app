import React, {useState} from 'react';
import {Alert, useColorScheme} from 'react-native';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';

import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {CHANGE_PASSWORD_API} from '../../helper/APIUtils';
import Loader from '../../components/Loader';
import {
  Card,
  Theme,
  XStack,
  YStack,
  Text,
  Button,
  Paragraph,
  Input,
  Circle,
} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import {AntDesign, Entypo} from '@expo/vector-icons';

export default function NewPasswordScreen({navigation, route}) {
  const {email} = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const isDarkMode = useColorScheme() === 'dark';
 // const {user_token, user_id} = useSelector((state: any) => state.user);
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureNewTextEntry, setSecureNewTextEntry] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);



  const handleSecureEntryClickEvent = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleSecureNewEntryClickEvent = () => {
    setSecureNewTextEntry(!secureNewTextEntry);
  };

  const handlePasswordSubmit = () => {
    if (!password || password.length === 0) {
      //setError({...error, new: true});
      //setErrorText({...errorText, new: 'Please give a password'});
      Alert.alert('Please give a password');
      setErrorMessage('Please give a password');
      return;
    } else if (!passwordVerify) {
      //setError({...error, new: true});
      Alert.alert('Please enter a valid password');
      setErrorMessage('Please enter a valid password');
      return;
    } else if (!confirmPassword || confirmPassword.length === 0) {
      //setError({...error, confirm: true});
      Alert.alert('Please confirm your password');
      setErrorMessage('Please confirm your password');
      return;
    } else if (password !== confirmPassword) {
      // setError({...error, confirm: true});
      Alert.alert('confirmation password does not match the new password');
      setErrorMessage('confirmation password does not match the new password');
      return;
    } else {
      //navigation.navigate('LoginScreen');
      setErrorMessage(null);
      changePasswordMutation.mutate();
    }
  };

  const handlePassword = e => {
    let pass = e;
    setErrorMessage(null);
    setPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setPassword(pass);
      setPasswordVerify(true);
    }
  };

  const handleConfirmPassword = e => {
    let pass = e;
    setErrorMessage(null);
    setConfirmPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setConfirmPassword(pass);
      setPasswordVerify(true);
    }
  };

  const changePasswordMutation = useMutation({
    mutationKey: ['generate-new-password'],
    mutationFn: async () => {
      const res = await axios.post(
        CHANGE_PASSWORD_API,
        {
          email: email,
          new_password: password,
        },
        {
          //headers: {
          //  Authorization: `Bearer ${user_token}`,
          // }
        },
      );
      return res.data as any;
    },
    onSuccess: () => {
      Alert.alert('Password reset successfully');
      navigation.navigate('LoginScreen');
    },

    onError: (error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Error', 'User not found');
            break;
          case 402:
            Alert.alert(
              'Error',
              'New password should not be same as old password',
            );
            break;
          default:
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    },
  });

  if (changePasswordMutation.isPending) {
    return <Loader />;
  }
  return (
    <Theme name="light">
      <SafeAreaView style={{flex: 1, backgroundColor: '#f7f6fb'}}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$4"
          padding="$6">
          <Card
            elevate
            bordered
            backgroundColor="white"
            width="100%"
            maxWidth={400}
            height="auto"
            p="$6"
            br="$8"
            shadowColor="#00000020"
            ai="center">
            {/* Icon Circle */}
            <Circle
              size={70}
              backgroundColor={ON_PRIMARY_COLOR}
              justifyContent="center"
              alignItems="center"
              marginBottom="$4">
              <AntDesign
                size={32}
                name="key"
                color={PRIMARY_COLOR}
                strokeWidth={2.2}
              />
            </Circle>

            {/* Title & Subtitle */}
            <Text
              fontSize={20}
              fontWeight="600"
              alignSelf="center"
              marginTop="$2"
              color="$color12"
              marginBottom="$2">
              Set your new password
            </Text>

            {/* Inputs */}
            <YStack space="$4" w="100%" marginTop="$4">
              <YStack space="$2">
                <Text fontWeight="600" color="$gray11">
                  Password
                </Text>

                <XStack alignItems="center" position="relative">
                  <Entypo
                    name="lock"
                    size={22}
                    color={isDarkMode ? 'white' : 'black'}
                    style={{
                      position: 'absolute',
                      left: 12,
                      zIndex: 1,
                    }}
                  />
                  <Input
                    flex={1}
                    height="$6"
                    borderRadius="$3"
                    placeholder="Password"
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                    onChangeText={handlePassword}
                    value={password}
                    color={isDarkMode ? '$color' : '$color10'}
                    paddingLeft="$8"
                    paddingRight="$8"
                  />
                  <Button
                    chromeless
                    size="$4"
                    circular
                    position="absolute"
                    right={6}
                    onPress={handleSecureEntryClickEvent}>
                    <Icon
                      name={secureTextEntry ? 'eye-off' : 'eye'}
                      size={22}
                      color={isDarkMode ? 'white' : 'black'}
                    />
                  </Button>
                </XStack>
              </YStack>

              <YStack space="$2">
                <Text fontWeight="600" color="$gray11">
                  Confirm your new password
                </Text>

                <XStack alignItems="center" position="relative">
                  <Entypo
                    name="lock"
                    size={22}
                    color={isDarkMode ? 'white' : 'black'}
                    style={{
                      position: 'absolute',
                      left: 12,
                      zIndex: 1,
                    }}
                  />
                  <Input
                    flex={1}
                    height="$6"
                    borderRadius="$3"
                    placeholder="Confirm Password"
                    secureTextEntry={secureNewTextEntry}
                    autoCapitalize="none"
                    onChangeText={handleConfirmPassword}
                    value={confirmPassword}
                    color={isDarkMode ? '$color' : '$color10'}
                    paddingLeft="$8"
                    paddingRight="$8"
                  />
                  <Button
                    chromeless
                    size="$4"
                    circular
                    position="absolute"
                    right={6}
                    onPress={handleSecureNewEntryClickEvent}>
                    <Icon
                      name={secureNewTextEntry ? 'eye-off' : 'eye'}
                      size={22}
                      color={isDarkMode ? 'white' : 'black'}
                    />
                  </Button>
                </XStack>
              </YStack>
            </YStack>

            {/* Error Message */}
            {errorMessage && (
              <Paragraph
                color="$red10"
                fontSize={14}
                fontWeight="600"
                textAlign="center"
                marginTop="$3">
                {errorMessage}
              </Paragraph>
            )}

            {/* Confirm Button */}
            <YStack width="100%" marginTop="$8">
              <Button
                backgroundColor="$blue10"
                width="100%" // Ensure the button stretches across full width
                height={50}
                borderRadius={10}
                hoverStyle={{backgroundColor: '$purple8'}}
                pressStyle={{backgroundColor: '$purple7'}}
                onPress={handlePasswordSubmit}>
                <Text fontSize={17} fontWeight="500" color="white">
                  Confirm
                </Text>
              </Button>
            </YStack>

            {/* Return Link */}
            <XStack marginTop="$6" alignItems="center" space="$2">
              <Icon
                color="$gray10"
                name="arrow-back-circle-outline"
                size={28}
              />
              <Text
                color="$purple10"
                fontWeight="600"
                fontSize={16}
                onPress={() => navigation.navigate('LoginScreen')}>
                Return to the login screen
              </Text>
            </XStack>
          </Card>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: PRIMARY_COLOR,
//   },
//   innerContainer: {
//     alignItems: 'center',
//     padding: 20,
//     borderColor: 'white',
//     marginTop: 80,
//     backgroundColor: 'white',
//     paddingHorizontal: 10,
//     paddingVertical: 20,
//     paddingTop: hp(10),
//     width: '100%',
//     height: '100%',
//   },
//   // title: {
//   //   fontSize: 24,
//   //   fontWeight: 'bold',
//   //   color: 'black',
//   //   marginBottom: 20,
//   // },
//   inputContainer: {
//     width: '90%',
//     marginVertical: 20,
//   },
//   error: {
//     color: 'red',
//     marginBottom: 10,
//     fontWeight: '400',
//     fontSize: 16,
//     marginHorizontal: 5,
//     width: '80%',
//   },
//   inputError: {
//     borderColor: 'red',
//   },
//   text: {
//     fontSize: 16,
//     color: '#808080',
//     marginBottom: 8,
//     fontWeight: '500',
//   },
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: PRIMARY_COLOR,
//     backgroundColor: 'white',
//     borderRadius: 8,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     paddingHorizontal: 10,
//     backgroundColor: 'white',
//     width: '100%',
//     borderRadius: 15,
//   },
//   button: {
//     backgroundColor: PRIMARY_COLOR,
//     padding: 15,
//     borderRadius: 30,
//     marginTop: 20,
//     alignItems: 'center',
//     width: '40%',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
// });
