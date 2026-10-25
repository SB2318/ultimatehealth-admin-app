import React from 'react';
import {
  Image,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {YStack, XStack, Text} from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {Feather} from '@expo/vector-icons';

import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {ProfileHeaderProps} from '../type';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  BORDER_COLOR,
  CARD_BG,
  SCREEN_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  DARK_THEME,
  CLINICAL_SHADOW,
} from '../helper/Theme';

const ProfileHeader = ({
  username,
  userhandle,
  profileImg,
  onOverviewClick,
  onEditProfileClick,
  onLogoutClick,
  isSuperAdmin,
  onSuperAdminClick,
}: ProfileHeaderProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  const avatarUri = profileImg && profileImg.trim() !== ''
    ? profileImg.startsWith('http://') || profileImg.startsWith('https://')
      ? profileImg
      : `${GET_STORAGE_DATA}/${profileImg}`
    : 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

  const bgColor = isDarkMode ? DARK_THEME.screenBg : SCREEN_BG;
  const surfaceColor = isDarkMode ? DARK_THEME.cardBg : CARD_BG;
  const borderColor = isDarkMode ? DARK_THEME.borderColor : BORDER_COLOR;
  const textColor = isDarkMode ? DARK_THEME.textPrimary : TEXT_PRIMARY;
  const secondaryTextColor = isDarkMode ? DARK_THEME.textSecondary : TEXT_SECONDARY;

  return (
    <YStack backgroundColor={bgColor} paddingBottom="$6" alignItems="center">
      {/* Top Clinical Curved Header Banner */}
      <YStack
        height={130}
        width="100%"
        backgroundColor={PRIMARY_COLOR}
        position="absolute"
        borderBottomRightRadius={40}
        borderBottomLeftRadius={40}
        top={0}
      />

      <YStack alignItems="center" marginTop={50}>
        {/* Avatar Container with Clinical White Rim */}
        <YStack
          position="relative"
          marginBottom="$3"
          shadowColor="#0F172A"
          shadowOffset={{width: 0, height: 6}}
          shadowOpacity={0.15}
          shadowRadius={14}
          elevation={10}>
          <Image
            source={{uri: avatarUri}}
            style={{
              width: 114,
              height: 114,
              borderRadius: 57,
              borderWidth: 4,
              borderColor: surfaceColor,
            }}
          />
        </YStack>

        {/* Name & Handle */}
        <Text fontSize={22} fontWeight="800" color={textColor} letterSpacing={0.2}>
          {username}
        </Text>
        <Text fontSize={14} color={secondaryTextColor} marginTop="$1" marginBottom="$2">
          @{userhandle}
        </Text>

        {/* Clinical Role Badge */}
        <View
          style={[
            styles.roleBadge,
            isSuperAdmin && {
              backgroundColor: isDarkMode ? '#1E1B4B' : '#EEF2FF',
              borderColor: isDarkMode ? '#4338CA' : '#C7D2FE',
            },
          ]}>
          <Feather
            name={isSuperAdmin ? 'award' : 'shield'}
            size={12}
            color={isSuperAdmin ? '#6366F1' : PRIMARY_COLOR}
          />
          <Text
            style={[
              styles.roleBadgeText,
              isSuperAdmin && {color: isSuperAdmin ? '#4F46E5' : PRIMARY_COLOR},
            ]}>
            {isSuperAdmin ? 'Super Admin • Executive' : 'Clinical Moderator'}
          </Text>
        </View>

        {isSuperAdmin && (
          <TouchableOpacity
            onPress={onSuperAdminClick}
            activeOpacity={0.8}
            style={{width: '85%', maxWidth: 340, marginTop: 12}}>
            <XStack
              backgroundColor={isDarkMode ? '#3E2A10' : '#FEF3C7'}
              paddingHorizontal={14}
              paddingVertical={10}
              borderRadius={14}
              borderWidth={1}
              borderColor="#F59E0B"
              alignItems="center"
              justifyContent="space-between">
              <XStack alignItems="center" gap="$2.5" flex={1}>
                <MaterialCommunityIcons name="crown" size={20} color="#F59E0B" />
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="700" color={isDarkMode ? '#FDE68A' : '#92400E'}>
                    Super Admin Console
                  </Text>
                  <Text fontSize={11} color={isDarkMode ? '#FCD34D' : '#B45309'} marginTop={1}>
                    Platform Governance & Analytics
                  </Text>
                </YStack>
              </XStack>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isDarkMode ? '#543810' : '#FDE68A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
                }}>
                <Feather name="arrow-right" size={15} color={isDarkMode ? '#FDE68A' : '#92400E'} />
              </View>
            </XStack>
          </TouchableOpacity>
        )}

        {/* Action Buttons Row */}
        <XStack gap="$2.5" alignItems="center" marginTop="$4" paddingHorizontal={12}>
          {/* Edit Profile */}
          <TouchableOpacity onPress={onEditProfileClick} activeOpacity={0.8}>
            <XStack
              backgroundColor={surfaceColor}
              paddingHorizontal={15}
              paddingVertical={12}
              borderRadius={14}
              borderWidth={1}
              borderColor={borderColor}
              alignItems="center"
              gap="$2">
              <MaterialIcons name="edit" size={20} color={PRIMARY_COLOR} />
              <Text fontSize={14.5} fontWeight="700" color={textColor}>
                Edit Profile
              </Text>
            </XStack>
          </TouchableOpacity>

          {/* Work History */}
          <TouchableOpacity onPress={onOverviewClick} activeOpacity={0.8}>
            <XStack
              backgroundColor={surfaceColor}
              paddingHorizontal={15}
              paddingVertical={12}
              borderRadius={14}
              borderWidth={1}
              borderColor={borderColor}
              alignItems="center"
              gap="$2">
              <MaterialCommunityIcons
                name="clipboard-text-clock-outline"
                size={20}
                color={PRIMARY_COLOR}
              />
              <Text fontSize={14.5} fontWeight="700" color={textColor}>
                Work History
              </Text>
            </XStack>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity onPress={onLogoutClick} activeOpacity={0.8}>
            <XStack
              backgroundColor="#FEF2F2"
              paddingHorizontal={14}
              paddingVertical={12}
              borderRadius={14}
              borderWidth={1}
              borderColor="#FECACA"
              alignItems="center"
              gap="$1.5">
              <MaterialIcons name="logout" size={20} color="#DC2626" />
              <Text fontSize={14.5} fontWeight="700" color="#DC2626">
                Logout
              </Text>
            </XStack>
          </TouchableOpacity>
        </XStack>
      </YStack>
    </YStack>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A5F3FC',
    gap: 5,
  },
  roleBadgeText: {
    color: PRIMARY_DARK,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});