import { View, Text, StyleSheet } from "react-native";
import { PRIMARY_COLOR } from "../helper/Theme";

export default function HomeScreen(){

    return(
        <View style={styles.container}>
            <Text style={styles.title}>Home Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({

    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor: PRIMARY_COLOR
    },

    title:{
        fontSize:24,
        color:'#fff',
        fontWeight: '600',
    }
});