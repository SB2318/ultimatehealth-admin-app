import React from 'react';
import {View, Image, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Comment} from '../type';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import moment from 'moment';

export default function CommentItem({
  item,
  isSelected,
  handleMentionClick,
}: {
  item: Comment;
  isSelected: Boolean;
  handleMentionClick: (user_handle: string) => void;
}) {
  const formatWithOrdinal = date => {
    return moment(date).format('D MMM, ddd, h:mm a');
  };

  const renderTextWithMentions = (text: string) => {
    const regex = /(@\w+)/g; // Match mentions starting with '@'
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(regex)) {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              handleMentionClick(part);
            }}>
            <Text key={index} style={styles.mention}>
              {part}
            </Text>
          </TouchableOpacity>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View
      style={{
        ...styles.commentContainer,
        backgroundColor: isSelected ? '#EF9F9FFF' : '#f0f0f0',
      }}>
      {item.userId && item.userId.Profile_image ? (
        <Image
          source={{
            uri: item.userId.Profile_image.startsWith('https')
              ? item.userId.Profile_image
              : `${GET_STORAGE_DATA}/${item.userId.Profile_image}`,
          }}
          style={[
            styles.profileImage,
            !item.userId.Profile_image && {
              borderWidth: 0.5,
              borderColor: 'black',
            },
          ]}
        />
      ) : (
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
          }}
          style={[
            styles.profileImage,
            {borderWidth: 0.5, borderColor: 'black'},
          ]}
        />
      )}

      <View style={styles.commentContent}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <Text style={styles.username}>{item.userId.user_handle}</Text>
          {item.isEdited && (
            <Text style={{...styles.comment, marginStart: 4, marginTop: 2}}>
              (edited)
            </Text>
          )}
        </View>

        <Text style={styles.comment}>
          {renderTextWithMentions(item.content)}
        </Text>
        <Text style={styles.timestamp}>
          Last updated {formatWithOrdinal(item.updatedAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginTop: 5, // Reduced top margin
  },
  profileImage: {
    height: 50,
    width: 50,
    borderRadius: 30,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 6,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginEnd: 4,
  },
  comment: {
    fontSize: 15,
    color: '#555',
    marginVertical: 0,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    marginStart: 3,
    marginVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  mention: {
    color: 'blue',
    fontWeight: 'bold',
    paddingTop: 4,
  },
  shareIconContainer: {
    position: 'absolute',
    top: 1,
    right: 7,
    zIndex: 1,
  },
});
