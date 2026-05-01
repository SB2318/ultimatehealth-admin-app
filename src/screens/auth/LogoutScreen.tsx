import React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

import {YStack, Text, Button, XStack} from 'tamagui';
import Icon from '@expo/vector-icons/Ionicons';

import {GET_STORAGE_DATA, ADMIN_LOGOUT} from '../../helper/APIUtils';
import {resetUserState} from '../../stores/UserSlice';
import {clearStorage} from '../../helper/Utils';
import { PRIMARY_COLOR } from '@/src/helper/Theme';

const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
    danger: '#EF4444',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    danger: '#F87171',
  },
};

const LogoutScreen = ({navigation, route}) => {
  const {profile_image, username} = route.params;
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const userLogoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post(ADMIN_LOGOUT, {}, {
        // headers: { Authorization: `Bearer ${user_token}` }
      });
    },
    onSuccess: async () => {
      await clearStorage();
      dispatch(resetUserState());
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    },
    onError: (err: AxiosError) => {
      Alert.alert('Logout Failed', 'Something went wrong. Please try again.');
    },
  });

  const handleLogout = () => {
    if (!isConnected) {
      Snackbar.show({text: 'You are offline', duration: Snackbar.LENGTH_SHORT});
      return;
    }
    userLogoutMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <YStack flex={1} justifyContent="center" padding="$5">

            {/* Main Card */}
            <YStack
              backgroundColor={colors.surface}
              borderRadius={24}
              padding="$8"
              shadowColor="#000"
              shadowOffset={{width: 0, height: 15}}
              shadowOpacity={0.1}
              shadowRadius={30}
              elevation={20}
              alignItems="center">

              {/* Avatar */}
              <YStack
                marginBottom="$6"
                borderWidth={4}
                borderColor={colors.surface}
                borderRadius={999}
                shadowColor="#000"
                shadowOpacity={0.15}
                shadowRadius={20}
                elevation={10}>
                <Image
                  source={{
                    uri: profile_image?.startsWith('https')
                      ? profile_image
                      : `${GET_STORAGE_DATA}/${profile_image}`,
                  }}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 70,
                    backgroundColor: '#E2E8F0',
                  }}
                />
              </YStack>

              {/* Title */}
              <Text
                fontSize={28}
                fontWeight="700"
                color={colors.text}
                textAlign="center"
                marginBottom="$3">
                Log out of{'\n'}{username}
              </Text>

              {/* Message */}
              <Text
                fontSize={16}
                lineHeight={24}
                color={colors.secondaryText}
                textAlign="center"
                marginBottom="$8">
                Are you sure you want to log out?{'\n'}
                You will need to sign in again to access the admin portal.
              </Text>

              {/* Logout Button (Destructive) */}
              <Button
                height={56}
                width="100%"
                backgroundColor={PRIMARY_COLOR}
                borderRadius={14}
                onPress={handleLogout}
                pressStyle={{scale: 0.98}}
                disabled={userLogoutMutation.isPending}>
                <Text color="white" fontSize={17} fontWeight="700">
                  {userLogoutMutation.isPending ? 'Logging out...' : 'Yes, Log Me Out'}
                </Text>
              </Button>

              {/* Cancel Button */}
              <Button
                height={56}
                width="100%"
                marginTop="$3"
                backgroundColor="transparent"
                borderWidth={1.5}
                borderColor={colors.border}
                onPress={() => navigation.goBack()}
                pressStyle={{backgroundColor: isDarkMode ? '#334155' : '#F1F5F9'}}>
                <Text
                  color={colors.text}
                  fontSize={17}
                  fontWeight="600">
                  Cancel
                </Text>
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LogoutScreen;