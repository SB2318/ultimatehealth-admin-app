import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Linking,
    Alert,
  } from 'react-native';
  import React from 'react';
  import EllipseSvg from '../../assets/svg/EllipseSvg';
  import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
  import {fp, hp, wp} from '../helper/Metric';
  import {ProfileHeaderProps} from '../type';
  
  import {GET_STORAGE_DATA} from '../helper/APIUtils';
  
  const ProfileHeader = ({
    username,
    userhandle,
    profileImg,
    onOverviewClick,
    onEditProfileClick,
    onLogoutClick
  }: ProfileHeaderProps) => {
    
   
    return (
      <View style={styles.container}>
        <EllipseSvg style={styles.ellipseSvg} />
        <View style={styles.contentContainer}>
          <Image
            source={{
              uri: profileImg ? profileImg.startsWith('https')
                ? profileImg
                : `${GET_STORAGE_DATA}/${profileImg}`:
                'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            }}
            style={[
              styles.profileImage,
              !profileImg && {borderWidth: 0.5, borderColor: 'black'},
            ]}
          />
          <Text style={styles.nameText}>{username}</Text>
          <Text style={[styles.usernameText, {color: PRIMARY_COLOR}]}>
            {userhandle}
          </Text>
        
           
            <TouchableOpacity
              onPress={() => {
              //  navigation.navigate('ProfileEditScreen');
              onEditProfileClick();
              }}>
              <View style={styles.btnSM}>
                <MaterialIcons name="edit" size={20} color="black" />
                <Text style={styles.btnSMText}>Edit Profile</Text>
              </View>
            </TouchableOpacity>
          
          <TouchableOpacity onPress={onOverviewClick}>
           
              <View style={styles.btnSM}>
                <MaterialCommunityIcon
                  name="view-dashboard"
                  size={20}
                  color="black"
                />
                <Text style={styles.btnSMText}>Work History</Text>
              </View>
            
          </TouchableOpacity>
  
          <TouchableOpacity
            onPress={onLogoutClick}>
           
              <View style={styles.btnSM}>
                <MaterialIcons name="logout" size={20} color="black" />
                <Text style={styles.btnSMText}>Logout</Text>
              </View>
            
          </TouchableOpacity>
       
          </View>
        </View>
      
    );
  };
  
  export default ProfileHeader;
  
  const styles = StyleSheet.create({
    container: {
      //marginBottom: 20,
      backgroundColor: ON_PRIMARY_COLOR,
    },
    ellipseSvg: {
      position: 'absolute',
      top: -2,
    },
    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: hp(12),
      // backgroundColor: ON_PRIMARY_COLOR
    },
    profileImage: {
      height: 130,
      width: 130,
      borderRadius: 100,
      objectFit: 'cover',
      resizeMode: 'contain',
    },
    nameText: {
      fontSize: fp(6),
      fontWeight: 'bold',
      color: 'black',
    },
    usernameText: {
      fontSize: fp(4),
      fontWeight: 'regular',
      marginTop: 1,
    },
    experienceContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    experienceText: {
      fontSize: 14,
      fontWeight: 'medium',
      color: 'black',
    },
    contactContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginVertical: 10,
    },
    iconButton: {
      height: 50,
      width: 50,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    editProfileButton: {
      borderWidth: 0.5,
      width: wp(70),
      alignItems: 'center',
      borderRadius: 10,
      paddingVertical: 5,
      marginVertical: 10,
    },
    editProfileButtonText: {
      fontSize: 16,
      fontWeight: 'semibold',
    },
    infoContainer: {
      width: wp(100),
      flexDirection: 'row',
      //numRows: 2,
      alignItems: 'center',
      justifyContent: 'space-evenly',
      marginVertical: 10,
    },
    infoBlock: {
      alignItems: 'center',
    },
    infoText: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    infoLabel: {
      fontSize: 18,
      fontWeight: 'regular',
      color: 'black',
    },
    btnSM: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      paddingVertical: 8,
      marginVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      backgroundColor: '#fff',
      borderColor: '#d1d5db',
      width: wp(70),
      gap: 10,
    },
    btnSMText: {
      fontSize: 17,
      lineHeight: 20,
      fontWeight: '600',
      color: '#374151',
    },
  });
  