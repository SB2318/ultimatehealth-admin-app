import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {Comment} from '../type';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import moment from 'moment';

export default function CommentItem({
  item,
  isSelected,
  handleMentionClick,
}: {
  item: Comment;
  isSelected: boolean;
  handleMentionClick: (user_handle: string) => void;
}) {
  const formatDate = (date: string) => {
    return moment(date).format('D MMM, ddd • h:mm a');
  };

  const avatarUri = item.userId?.Profile_image
    ? item.userId.Profile_image.startsWith('https')
      ? item.userId.Profile_image
      : `${GET_STORAGE_DATA}/${item.userId.Profile_image}`
    : 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500';

  // Fixed: Returns only Text components for proper inline rendering
  const renderTextWithMentions = (text: string) => {
    const regex = /(@\w+)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(regex)) {
        return (
          <Text
            key={index}
            style={styles.mention}
            onPress={() => handleMentionClick(part)}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View
      style={[
        styles.commentContainer,
        isSelected && styles.selectedContainer,
      ]}>
      {/* Avatar */}
      <Image
        source={{uri: avatarUri}}
        style={styles.profileImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.commentContent}>
        {/* Name + Edited */}
        <View style={styles.headerRow}>
          <Text style={styles.username}>
            {item.userId?.user_handle || 'Anonymous'}
          </Text>
          {item.isEdited && <Text style={styles.editedText}>(edited)</Text>}
        </View>

        {/* Comment with Mentions */}
        <Text style={styles.commentText}>
          {renderTextWithMentions(item.content)}
        </Text>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {formatDate(item.updatedAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    //borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },

  selectedContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFCCCC',
  },

  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },

  commentContent: {
    flex: 1,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  username: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1C1C1E',
  },

  editedText: {
    fontSize: 13.5,
    color: '#8E8E93',
    marginLeft: 6,
    fontStyle: 'italic',
  },

  commentText: {
    fontSize: 16,
    lineHeight: 23.5,
    color: '#2C2C2E',
    marginBottom: 8,
  },

  timestamp: {
    fontSize: 12.8,
    color: '#8E8E93',
  },

  mention: {
    color: '#007AFF',
    fontWeight: '700',
  },
});