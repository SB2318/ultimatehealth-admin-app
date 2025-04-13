import { View, Text, StyleSheet } from "react-native";
import { ProfileScreenProps } from "../type";
import { ON_PRIMARY_COLOR } from "../helper/Theme";

export default function Profile({navigation}:ProfileScreenProps){
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Profile</Text>
        </View>
    )
}

const styles = StyleSheet.create({

     container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ON_PRIMARY_COLOR
     },
     text:{
        fontSize: 20,
        color: '#000',
     }

});