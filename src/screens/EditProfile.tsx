import {
  ScrollView,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';
import GeneralTab from '../components/GeneralTab';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {
  GET_PROFILE_API,
  GET_STORAGE_DATA,
  UPDATE_USER_DETAILS,
} from '../helper/APIUtils';
import {Admin, EditProfileProp} from '../type';
import Loader from '../components/Loader';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import useUploadImage from '../hooks/useUploadImage';
import APILoader from '../components/APILoader';

const EditProfile = ({navigation}:EditProfileProp) => {
  const {uploadImage, loading} = useUploadImage();

  // Get safe area insets for handling notches and status bars on device
  const insets = useSafeAreaInsets();

  // Initialize state variables
  const [user_profile_image, setUserProfileImage] = useState('');
  const [username, setUsername] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [old_password, setOldPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const {user_token} = useSelector((state: any) => state.user);
  const [profileImage, setProfileImage] = useState<string>('');

  const {data: user, isLoading} = useQuery({
    queryKey: ['get-user-details-by-id'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });

      return response.data as Admin;
    },
  });

  const userGeneralDetailsMutation = useMutation({
    mutationKey: ['user-general-details-updation'],
    mutationFn: async () => {
      const response = await axios.post(
        `${UPDATE_USER_DETAILS}`,
        {
          user_name: username,
          user_Handle: userHandle,
          password: new_password,
          profile_avtar: profileImage,
        },
        {
         // headers: {
         //   Authorization: `Bearer ${user_token}`,
         // },
        },
      );
      return response.data as any;
    },
    onSuccess: _data => {
      Alert.alert('Success', 'Details submitted successfully');
      navigation.goBack();
    },

    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            // Handle bad request errors (missing fields or email/user handle already in use)
            Alert.alert(
              'Update Failed',
              err?.response?.data?.error ||
                'Please fill in all fields correctly.',
            );
            break;
          case 404:
            // Handle user not found
            Alert.alert(
              'Update Failed',
              'User not found. Please check your information.',
            );
            break;
          case 409:
            // Handle conflict errors (duplicate email/user handle)
            Alert.alert(
              'Update Failed',
              'Email or user handle already exists.',
            );
            break;
          case 500:
            // Handle internal server errors
            Alert.alert(
              'Update Failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            // Handle any other errors
            Alert.alert(
              'Update Failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        // Handle network errors
        console.log('General Update Error', err);
        Alert.alert(
          'Update Failed',
          'Network error. Please check your connection.',
        );
      }
    },
  });

 

  useEffect(() => {
    if (user) {
      //console.log(user);
      setUserProfileImage(
        user.Profile_avtar ? `${GET_STORAGE_DATA}/${user.Profile_avtar}` : '',
      );
      setUsername(user.user_name || '');
      setUserHandle(user.user_handle || '');
      
    }
  }, [user]);

  if (isLoading) {
    return <Loader />;
  }

  const validateGeneralFields = () => {
    if (!username) {
      return 'Username is required';
    }
    if (!userHandle) {
      return 'User Handle is required';
    }
    if(!profileImage){
        setProfileImage(user? user.Profile_avtar: "");
    }

    return null; // No errors
  };

  const handleSubmitGeneralDetails = () => {
    const errorMessage = validateGeneralFields();
    const validatePassword = validateSubmitPassword();

    if (errorMessage || !validatePassword) {
      if (errorMessage) {
        Alert.alert('Validation Error', errorMessage);
      } else {
        Alert.alert('Validation Error', 'Please select a valid password');
      }

      return;
    }
    userGeneralDetailsMutation.mutate();
  };
  const validateSubmitPassword = () => {
    if (old_password === '' && new_password !== user?.password) {
      Alert.alert('Error', 'Please enter your current password.');
      return false;
    }

    if (new_password === '') {
      Alert.alert('Error', 'Please enter a new password.');
      return false;
    }

    if (confirm_password === '' && new_password !== user?.password) {
      Alert.alert('Error', 'Please confirm your new password.');
      return false;
    }

    if (old_password === new_password && new_password !== user?.password) {
      Alert.alert(
        'Error',
        'The new password must be different from the current password.',
      );
      return false;
    }

    if (new_password.length < 6) {
      Alert.alert(
        'Error',
        'The new password must be at least 6 characters long.',
      );
      return false;
    }

    if (new_password !== confirm_password && new_password !== user?.password) {
      Alert.alert('Error', 'The new password and confirmation do not match.');
      return false;
    }

    return true;
  };
  const selectImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        //console.log('User cancelled image picker');
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
              Alert.alert(
                '',
                'Are you sure you want to use this image?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      setUserProfileImage(user?.Profile_avtar || '');
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: async () => {
                      try {
                        // Upload the resized image
                        const result = await uploadImage(resizedImageUri.uri);
                        setProfileImage(result ? result : "");
                      } catch (err) {
                        console.error('Upload failed');
                        Alert.alert('Error', 'Upload failed');
                      }
                    },
                  },
                ],
                {cancelable: false},
              );
            })
            .catch(err => {
              //console.log(err);
              Alert.alert('Error', 'Could not resize the image.');
            });
        }
      }
    });
  };

  if (
    loading ||
    userGeneralDetailsMutation.isPending
  ) {
    return (
     <APILoader />
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={[
          styles.contentContainer,
          {paddingBottom: insets.bottom},
        ]}>
        <ScrollView style={styles.tabContent}>
          <GeneralTab
            username={username}
            setUsername={setUsername}
            userhandle={userHandle}
            setUserHandle={setUserHandle}
            new_password={new_password}
            old_password={old_password}
            confirm_password={confirm_password}
            setConfirmPassword={setConfirmPassword}
            setOldPassword={setOldPassword}
            setNewPassword={setNewPassword}
            imgUrl={user_profile_image}
            handleSubmitGeneralDetails={handleSubmitGeneralDetails}
            selectImage={selectImage}
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 0, // Will be adjusted dynamically based on insets
  },
  horizontalScroll: {
    marginTop: 10,
  },
  horizontalScrollContent: {
    columnGap: 2, // Space between tabs
  },
  tabButton: {
    paddingHorizontal: 18,
    borderRadius: 100,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: PRIMARY_COLOR, // Highlight the active tab
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500', // Font weight '500' for normal tabs
    color: '#B1B2B2',
  },
  activeTabText: {
    fontWeight: 'bold', // Bold font for active tab text
    color: 'white',
  },
  tabContent: {
    marginTop: 25,
    minHeight: Dimensions.get('window').height - hp(25), // Ensure content takes full screen height
  },
  overlay: {
    flex: 1,
    //backgroundColor: 'rgba(0,0,0,0.4)',
    backgroundColor: ON_PRIMARY_COLOR,
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EditProfile;
