import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import {CommentScreenProp} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
//import io from 'socket.io-client';
import {Comment} from '../type';
import Loader from '../components/Loader';
import CommentItem from '../components/CommentItem';
import {useSocket} from '../components/SocketContext';


const CommentScreen = ({navigation, route}: CommentScreenProp) => {
  const socket = useSocket();
  const { commentId} = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const flatListRef = useRef<FlatList<Comment>>(null);

  const [commentLoading, setCommentLoading] = useState<Boolean>(false);

  useEffect(() => {
    socket.emit('fetch-comments', {articleId: route.params.articleId});

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('comment-processing', (data: boolean) => {
      setCommentLoading(data);
    });

    socket.on('error', data => {
      console.log('connection error', data);
    });

    socket.on('fetch-comments', data => {
      // console.log('comment loaded');
      if (data.articleId === route.params.articleId) {
        setComments(data.comments);
      }
    });

    return () => {
      socket.off('fetch-comments');
    
    };
  }, [socket, route.params.articleId]);

  if (commentLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Feedback</Text>

      {/* Comments List */}
      <FlatList
        ref={flatListRef}
        data={comments}
        renderItem={({item}) => (
          <CommentItem
            item={item}
            isSelected={commentId === item._id}
            handleMentionClick={() => {}}
          />
        )}
        keyExtractor={item => item._id}
        style={styles.commentsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  commentsList: {
    flex: 1,
    marginBottom: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  avatar: {
    fontSize: 30,
    marginRight: 10,
    alignSelf: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginEnd: 4, // Small gap between user handle and content
  },
  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 4,
  },

  profileImage2: {
    height: 30,
    width: 30,
    borderRadius: 15,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 4,
  },
  commentContent: {
    flex: 1,
  },
  username2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',
  },
  comment: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  replyContainer: {
    marginLeft: 20,
    marginTop: 10,
  },
  replyText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  textInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CommentScreen;
