import { View, Text, StyleSheet } from "react-native";
import { ReportScreenProps } from "../type";
import { ON_PRIMARY_COLOR } from "../helper/Theme";


export default function Report({navigation}:ReportScreenProps){
    return(
        <View style={styles.container}>
            <Text style={styles.text}>Report</Text>
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