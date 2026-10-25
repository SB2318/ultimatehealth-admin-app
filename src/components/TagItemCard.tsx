import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { wp, hp } from "../helper/Metric";
import { PRIMARY_COLOR, TEXT_PRIMARY } from "../helper/Theme";
import { Category } from "../type";
import Icon from "@expo/vector-icons/Feather";

interface Props {
  reason: Category;
  onEditAction: (item: Category) => void;
  onDeleteAction: (item: Category) => void;
}

export default function ReasonItemCard({
  reason,
  onEditAction,
  onDeleteAction,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardContent}>
        {/* Left Accent */}
        <View style={styles.accentBar} />

        <View style={styles.textContainer}>
          <Text style={styles.reasonText} numberOfLines={2}>
            {reason.name}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.iconGroup}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEditAction(reason)}
            hitSlop={8}>
            <Icon name="edit-2" size={18} color={PRIMARY_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeleteAction(reason)}
            hitSlop={8}>
            <Icon name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: wp(4),
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: wp(4),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  cardPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: "#F8FAFC",
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: PRIMARY_COLOR,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
  },

  textContainer: {
    flex: 1,
    paddingRight: wp(3),
  },

  reasonText: {
    fontSize: 15,
    lineHeight: 20,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },

  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  editButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
});