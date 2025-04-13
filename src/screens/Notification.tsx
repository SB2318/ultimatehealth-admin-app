import { StyleSheet, Text, View } from "react-native";
import { NotificationProps } from "../type";
import { ON_PRIMARY_COLOR } from "../helper/Theme";

export default function Notification({navigation}:NotificationProps){
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Notification</Text>
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