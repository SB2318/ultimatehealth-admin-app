import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { wp, hp } from "../helper/Metric";
import { PRIMARY_COLOR, BUTTON_COLOR } from "../helper/Theme";
import { Category } from "../type";
import Icon from "react-native-vector-icons/Feather";

interface Props {
   reason: Category,
   onEditAction: (item: Category) =>{},
   onDeleteAction: (item: Category) =>{},
}

export default function ReasonItemCard({reason, onEditAction, onDeleteAction}: Props) {
 
  return (
     <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.reasonText}>{reason.name}</Text>
        <View style={styles.iconGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onEditAction(reason)}
          >
            <Icon name="edit" size={20} color={BUTTON_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onDeleteAction(reason)}
          >
            <Icon name="trash-2" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: hp(2),
    color: PRIMARY_COLOR,
  },
  list: {
    paddingBottom: hp(5),
  },
  card: {
    backgroundColor: 'white',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderRadius: 12,
    marginBottom: hp(1.5),
    elevation: 1,
   // borderWidth: 1,
    //borderColor: '#ddd',
  },
  selectedCard: {
    backgroundColor: BUTTON_COLOR + '22',
    borderColor: BUTTON_COLOR,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },
  selectedText: {
    fontWeight: '600',
    color: BUTTON_COLOR,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconButton: {
    marginLeft: 12,
  },
});
