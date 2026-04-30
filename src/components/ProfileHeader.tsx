import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import EllipseSvg from '../../assets/svg/EllipseSvg';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR, TEXT_PRIMARY, TEXT_SECONDARY} from '../helper/Theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcon from '@expo/vector-icons/MaterialCommunityIcons';
import {fp, hp, wp} from '../helper/Metric';
import {ProfileHeaderProps} from '../type';
import {GET_STORAGE_DATA} from '../helper/APIUtils';

const ProfileHeader = ({
  username,
  userhandle,
  profileImg,
  onOverviewClick,
  onEditProfileClick,
  onLogoutClick,
}: ProfileHeaderProps) => {
  
  const avatarUri = profileImg
    ? profileImg.startsWith('https')
      ? profileImg
      : `${GET_STORAGE_DATA}/${profileImg}`
    : 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

  return (
    <View style={styles.container}>
      <EllipseSvg style={styles.ellipseSvg} />

      <View style={styles.content}>
        {/* Profile Image with Ring */}
        <View style={styles.avatarContainer}>
          <Image
            source={{uri: avatarUri}}
            style={styles.profileImage}
          />
          <View style={styles.avatarRing} />
        </View>

        {/* Name & Handle */}
        <Text style={styles.nameText}>{username}</Text>
        <Text style={styles.usernameText}>@{userhandle}</Text>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEditProfileClick}>
            <MaterialIcons name="edit" size={22} color={PRIMARY_COLOR} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onOverviewClick}>
            <MaterialCommunityIcon
              name="view-dashboard"
              size={22}
              color={PRIMARY_COLOR}
            />
            <Text style={styles.buttonText}>Work History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={onLogoutClick}>
            <MaterialIcons name="logout" size={22} color="#EF4444" />
            <Text style={[styles.buttonText, {color: '#EF4444'}]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: ON_PRIMARY_COLOR,
    paddingBottom: hp(4),
  },

  ellipseSvg: {
    position: 'absolute',
    top: -hp(8),
    left: 0,
    right: 0,
  },

  content: {
    alignItems: 'center',
    marginTop: hp(10),
  },

  avatarContainer: {
    position: 'relative',
    marginBottom: hp(2),
  },

  profileImage: {
    width: hp(18),
    height: hp(18),
    borderRadius: hp(9),
    borderWidth: 5,
    borderColor: 'white',
    backgroundColor: '#F3F4F6',
  },

  avatarRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: hp(10),
    borderWidth: 2,
    borderColor: PRIMARY_COLOR + '30',
  },

  nameText: {
    fontSize: fp(7.5),
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: hp(1),
  },

  usernameText: {
    fontSize: fp(4.4),
    color: TEXT_SECONDARY,
    marginTop: 2,
    marginBottom: hp(3),
  },

  buttonsContainer: {
    width: '88%',
    gap: hp(1.8),
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderRadius: 16,
    gap: 12,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  logoutButton: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },

  buttonText: {
    fontSize: fp(4.2),
    fontWeight: '600',
    color: '#374151',
  },
});