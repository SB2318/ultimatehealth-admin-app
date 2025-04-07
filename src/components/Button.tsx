import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { fp, hp, wp } from "../helper/Metric";
import { PRIMARY_COLOR } from "../helper/Theme";

const Button = ({callback, title}:{callback: ()=>void, title: string}) => {
  return (
    <View style={styles.loginButtonContainer}>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={callback}>
        <Text style={styles.loginText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({

     loginButtonContainer: {marginVertical: hp(2)},
        loginButton: {
          backgroundColor: PRIMARY_COLOR,
          paddingVertical: hp(1.2),
          paddingHorizontal: wp(1.3),
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          width: '100%',
        },
        loginText: {
          fontSize: fp(5),
          fontWeight: '700',
          color: '#fff',
        },
})
