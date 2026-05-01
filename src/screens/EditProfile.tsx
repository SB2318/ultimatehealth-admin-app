import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {YStack, XStack, Text, Button, Input, View} from 'tamagui';
import Icon from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

import {
  GET_PROFILE_API,
  UPDATE_USER_DETAILS,
  GET_STORAGE_DATA,
  CHECK_USER_HANDLE,
} from '../helper/APIUtils';
import useUploadImage from '../hooks/useUploadImage';
import Loader from '../components/Loader';
import APILoader from '../components/APILoader';

const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
    success: '#10B981',
    error: '#EF4444',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
    success: '#34D399',
    error: '#F87171',
  },
};

const EditProfile = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const {uploadImage, loading: uploadLoading} = useUploadImage();
  const {isConnected} = useSelector((state: any) => state.network);
  const {user_token} = useSelector((state: any) => state.user);

  const [profileUri, setProfileUri] = useState('');
  const [username, setUsername] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const [isHandleAvailable, setIsHandleAvailable] = useState<boolean | null>(
    null,
  );
  const [handleMessage, setHandleMessage] = useState('');

  const {data: user, isLoading} = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {
      const res = await axios.get(GET_PROFILE_API);
      return res.data;
    },
    enabled: !!user_token && isConnected,
  });

  useEffect(() => {
    if (user) {
      setUsername(user.user_name || '');
      setUserHandle(user.user_handle || '');

      if (user.Profile_avtar) {
        const uri = user.Profile_avtar.startsWith('http')
          ? user.Profile_avtar
          : `${GET_STORAGE_DATA}/${user.Profile_avtar}`;
        setProfileUri(uri);
      }
    }
  }, [user]);

  // Real-time User Handle Availability Check
  const checkUserHandle = async (handle: string) => {
    if (handle.length < 3 || handle === user?.user_handle) {
      setIsHandleAvailable(true);
      setHandleMessage('');
      return;
    }

    try {
      const res = await axios.post(CHECK_USER_HANDLE, {userHandle: handle});
      const available = res.data.status === true;
      setIsHandleAvailable(available);
      setHandleMessage(available ? '✓ Available' : '✕ Already taken');
    } catch (err) {
      setIsHandleAvailable(false);
      setHandleMessage('Could not check availability');
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(UPDATE_USER_DETAILS, {
        user_name: username,
        user_Handle: userHandle,
        profile_avtar: uploadedImageUrl || user?.Profile_avtar || '',
      });
      return res.data;
    },
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    },
    onError: (err: AxiosError) => {
      const status = err.response?.status;
      if (status === 409) {
        Alert.alert('Error', 'User handle already exists');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    },
  });

  const selectImage = async () => {
    const options: ImageLibraryOptions = {mediaType: 'photo'};

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage || !response.assets?.[0])
        return;

      const {uri, fileSize} = response.assets[0];
      if (fileSize && fileSize > 1024 * 1024) {
        Alert.alert('Error', 'File size exceeds 1 MB.');
        return;
      }

      ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 100)
        .then(async resizedImageUri => {
          setProfileUri(resizedImageUri.uri);

          Alert.alert('', 'Are you sure you want to use this image?', [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'OK',
              onPress: async () => {
                try {
                  const result = await uploadImage(resizedImageUri.uri);
                  if (result) setUploadedImageUrl(result);
                } catch (err) {
                  Alert.alert('Error', 'Image upload failed');
                }
              },
            },
          ]);
        })
        .catch(() => Alert.alert('Error', 'Could not resize the image.'));
    });
  };

  const handleSave = () => {
    if (!isConnected) {
      Snackbar.show({text: 'You are offline', duration: Snackbar.LENGTH_SHORT});
      return;
    }
    if (!username.trim() || !userHandle.trim()) {
      Alert.alert('Error', 'Username and User Handle are required');
      return;
    }
    if (isHandleAvailable === false) {
      Alert.alert('Error', 'Please choose a different user handle');
      return;
    }

    updateMutation.mutate();
  };

  if (isLoading) return <Loader />;
  if (uploadLoading || updateMutation.isPending) return <APILoader />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack padding="$5" gap="$6">
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text fontSize={20} fontWeight="700" color={colors.text}>
                Edit Profile
              </Text>
              <View style={{width: 28}} />
            </XStack>

            {/* Avatar */}
            <YStack alignItems="center" marginBottom="$4">
              <TouchableOpacity onPress={selectImage} activeOpacity={0.8}>
                <YStack
                  position="relative"
                  shadowColor="#000"
                  shadowOffset={{width: 0, height: 12}}
                  shadowOpacity={0.15}
                  shadowRadius={20}
                  elevation={15}>
                  <Image
                    source={{
                      uri:
                        profileUri ||
                        'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
                    }}
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 70,
                      borderWidth: 5,
                      borderColor: colors.surface,
                    }}
                  />
                  <YStack
                    position="absolute"
                    bottom={8}
                    right={8}
                    backgroundColor={colors.primary}
                    padding={10}
                    borderRadius={999}
                    shadowColor="#000"
                    shadowOpacity={0.3}
                    elevation={8}>
                    <MaterialIcons name="edit" size={22} color="white" />
                  </YStack>
                </YStack>
              </TouchableOpacity>
              <Text marginTop="$3" color={colors.secondaryText} fontSize={14}>
                Tap to change profile photo
              </Text>
            </YStack>

            {/* Form */}
            <YStack
              backgroundColor={colors.surface}
              borderRadius={20}
              padding="$6"
              gap="$5"
              shadowColor="#000"
              shadowOffset={{width: 0, height: 10}}
              shadowOpacity={0.08}
              shadowRadius={20}
              elevation={12}>
              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600" color={colors.text}>
                  Full Name
                </Text>
                <Input
                  value={username}
                  onChangeText={setUsername}
                  height={56}
                  borderWidth={1.5}
                  backgroundColor={"white"}
                  borderRadius={16}
                  borderColor={colors.border}
                  focusStyle={{borderColor: colors.primary}}
                  color={colors.text}
                />
              </YStack>

              <YStack gap="$2">
                <Text fontSize={14} fontWeight="600" color={colors.text}>
                  User Handle
                </Text>
                <Input
                  value={userHandle}
                  onChangeText={setUserHandle}
  
                  height={56}
                  borderWidth={1.5}
                  backgroundColor={"white"}
                  borderRadius={16}
                  borderColor={
                    isHandleAvailable === false ? colors.error : colors.border
                  }
                  focusStyle={{borderColor: colors.primary}}
                  color={colors.text}
                />
                {handleMessage ? (
                  <Text
                    color={isHandleAvailable ? colors.success : colors.error}
                    fontSize={13}
                    fontWeight="600">
                    {handleMessage}
                  </Text>
                ) : null}
              </YStack>
            </YStack>

            {/* Save Button */}
            <Button
              height={58}
              backgroundColor={colors.primary}
              borderRadius={14}
              marginTop="$4"
              onPress={handleSave}
              disabled={isHandleAvailable === false}
              pressStyle={{scale: 0.98}}>
              <Text color="white" fontSize={18} fontWeight="700">
                Save Changes
              </Text>
            </Button>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
