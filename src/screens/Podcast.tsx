import { StyleSheet, Text, View } from "react-native";
import { PodcastProps } from "../type";
import { ON_PRIMARY_COLOR } from "../helper/Theme";

export default function Podcast({navigation}:PodcastProps){
    return(
    <View style={styles.container}>
            <Text style={styles.text}>Podcast</Text>
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