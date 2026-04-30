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
            hitSlop={12}>
            <Icon name="edit-2" size={22} color={PRIMARY_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDeleteAction(reason)}
            hitSlop={12}>
            <Icon name="trash-2" size={22} color="#EF4444" />
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
    marginVertical: hp(1.2),
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(5),
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 8,
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
    width: 6,
    backgroundColor: PRIMARY_COLOR,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 14,
  },

  textContainer: {
    flex: 1,
    paddingRight: wp(4),
  },

  reasonText: {
    fontSize: 16.5,
    lineHeight: 24,
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },

  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
  },

  editButton: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
  },

  deleteButton: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
  },
});