import React from 'react';
import {
  Image,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import {YStack, XStack, Text} from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {ProfileHeaderProps} from '../type';

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

const ProfileHeader = ({
  username,
  userhandle,
  profileImg,
  onOverviewClick,
  onEditProfileClick,
  onLogoutClick,
}: ProfileHeaderProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const avatarUri = profileImg
    ? profileImg.startsWith('https')
      ? profileImg
      : `${GET_STORAGE_DATA}/${profileImg}`
    : 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

  return (
    <YStack backgroundColor={colors.background} paddingBottom="$8" alignItems="center">

      {/* Top Gradient */}
      <YStack
        height={140}
        width="100%"
        backgroundColor={colors.primary}
        position="absolute"
        borderBottomRightRadius={65}
        borderBottomLeftRadius={65}
        top={0}
      />

      <YStack alignItems="center" marginTop={60}>

        {/* Avatar */}
        <YStack
          position="relative"
          marginBottom="$5"
          shadowColor="#000"
          shadowOffset={{width: 0, height: 10}}
          shadowOpacity={0.15}
          shadowRadius={20}
          elevation={15}>
          <Image
            source={{uri: avatarUri}}
            style={{
              width: 128,
              height: 128,
              borderRadius: 999,
              borderWidth: 6,
              borderColor: colors.surface,
            }}
          />
        </YStack>

        {/* Name & Handle */}
        <Text fontSize={26} fontWeight="700" color={colors.text}>
          {username}
        </Text>
        <Text fontSize={16} color={colors.secondaryText} marginTop="$1" marginBottom="$6">
          @{userhandle}
        </Text>

        {/* Buttons in One Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 20}}>
          <XStack gap="$3" alignItems="center">

            {/* Edit Profile */}
            <TouchableOpacity onPress={onEditProfileClick}>
              <XStack
                backgroundColor={colors.surface}
                paddingHorizontal={20}
                paddingVertical={14}
                borderRadius={16}
                borderWidth={1}
                borderColor={colors.border}
                alignItems="center"
                gap="$2.5"
                >
                <MaterialIcons name="edit" size={22} color={colors.primary} />
                <Text fontSize={15} fontWeight="600" color={colors.text}>
                  Edit Profile
                </Text>
              </XStack>
            </TouchableOpacity>

            {/* Work History */}
            <TouchableOpacity onPress={onOverviewClick}>
              <XStack
                backgroundColor={colors.surface}
                paddingHorizontal={20}
                paddingVertical={14}
                borderRadius={16}
                borderWidth={1}
                borderColor={colors.border}
                alignItems="center"
                gap="$2.5"
                >
                <MaterialCommunityIcons
                  name="view-dashboard"
                  size={22}
                  color={colors.primary}
                />
                <Text fontSize={15} fontWeight="600" color={colors.text}>
                  Work History
                </Text>
              </XStack>
            </TouchableOpacity>


          </XStack>
        </ScrollView>

          {/* Logout */}
            <TouchableOpacity onPress={onLogoutClick}>
              <XStack
                backgroundColor="#FEF2F2"
                paddingHorizontal={30}
                paddingVertical={14}
                borderRadius={16}
                borderWidth={1}
                marginTop="$3"
                borderColor="#FECACA"
                alignItems="center"
                gap="$2.5"
                >
                <MaterialIcons name="logout" size={22} color={colors.danger} />
                <Text fontSize={15} fontWeight="600" color={colors.danger}>
                  Logout
                </Text>
              </XStack>
            </TouchableOpacity>
      </YStack>
    </YStack>
  );
};

export default ProfileHeader;