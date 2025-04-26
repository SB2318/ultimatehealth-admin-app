import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import React, {memo, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {PRIMARY_COLOR} from '../helper/Theme';
import {ProfileEditProps} from '../type';

const GeneralTab = ({
  username,
  userhandle,
  imgUrl,
  setUsername,
  setUserHandle,
  handleSubmitGeneralDetails,
  selectImage,
  old_password,
  new_password,
  confirm_password,
  setOldPassword,
  setNewPassword,
  setConfirmPassword,
}: ProfileEditProps) => {
  //const user_fallback_profile = Image.resolveAssetSource(fallback_profile).uri;

  const [isVisibleOldPassword, setisVisibleOldPassword] = useState(false);
      const [isVisibleNewPassword, setisVisibleNewPassword] = useState(false);
      const [isVisibleConfirmPassword, setisVisibleConfirmPassword] =
        useState(false);
      // Toggle functions to change password visibility
      const toggleOldPassword = () => {
        setisVisibleOldPassword(!isVisibleOldPassword);
      };
      const toggleNewPassword = () => {
        setisVisibleNewPassword(!isVisibleNewPassword);
      };
      const toggleConfirmPassword = () => {
        setisVisibleConfirmPassword(!isVisibleConfirmPassword);
      };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri:
                imgUrl ||
                'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
            }}
            style={[
              styles.profileImage,
              !imgUrl && {borderWidth: 0.5, borderColor: 'black'},
            ]}
          />
          <View style={styles.editIconContainer}>
            <TouchableOpacity style={styles.editIcon} onPress={selectImage}>
              <Feather name="edit-3" color="black" size={25} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Username Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={username}
            onChangeText={text => setUsername(text)}
          />
        </View>

        {/* User Handle Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>User handle</Text>
          <TextInput
            placeholder="Enter your userhandle"
            placeholderTextColor="#6b7280"
            style={styles.inputControl}
            value={userhandle}
            onChangeText={text => setUserHandle(text)}
          />
        </View>

        {/* Old Password Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Old Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isVisibleOldPassword}
              placeholder="Enter your old password"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={old_password}
              onChangeText={text => setOldPassword(text)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={toggleOldPassword}>
              {isVisibleOldPassword ? (
                <Feather name="eye-off" color={'#6b7280'} size={20} />
              ) : (
                <Feather name="eye" color={'#6b7280'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isVisibleNewPassword}
              placeholder="Enter your new password"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={new_password}
              onChangeText={text => setNewPassword(text)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={toggleNewPassword}>
              {isVisibleNewPassword ? (
                <Feather name="eye-off" color={'#6b7280'} size={20} />
              ) : (
                <Feather name="eye" color={'#6b7280'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isVisibleConfirmPassword}
              placeholder="Enter your confirm password"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={confirm_password}
              onChangeText={text => setConfirmPassword(text)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={toggleConfirmPassword}>
              {isVisibleConfirmPassword ? (
                <Feather name="eye-off" color={'#6b7280'} size={20} />
              ) : (
                <Feather name="eye" color={'#6b7280'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity onPress={handleSubmitGeneralDetails} style={styles.btn}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(GeneralTab);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    flexDirection: 'column',
  },
  content: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
  },
  editIconContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 100,
    bottom: 0,
    right: 0,
    overflow: 'hidden',
  },
  editIcon: {
    backgroundColor: '#F2F2F2',
    borderRadius: 100,
    padding: 5,
  },
  input: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  aboutInput: {
    height: 150,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  btn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_COLOR,
    marginVertical: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    alignItems: 'center',
  },
});
