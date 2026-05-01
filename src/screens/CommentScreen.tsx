// import React, {useEffect, useRef, useState} from 'react';
// import {View, Text, StyleSheet, FlatList} from 'react-native';
// import {CommentScreenProp} from '../type';
// import {PRIMARY_COLOR} from '../helper/Theme';
// //import io from 'socket.io-client';
// import {Comment} from '../type';
// import Loader from '../components/Loader';
// import CommentItem from '../components/CommentItem';
// import {useSocket} from '../components/SocketContext';

// const CommentScreen = ({navigation, route}: CommentScreenProp) => {
//   const socket = useSocket();
//   const {commentId} = route.params;
//   const [comments, setComments] = useState<Comment[]>([]);
//   const flatListRef = useRef<FlatList<Comment>>(null);

//   const [commentLoading, setCommentLoading] = useState<Boolean>(false);

//   useEffect(() => {
//     socket.emit('fetch-comments', {
//       articleId: route.params.podcastId ? null : route.params.articleId,
//       podcastId: route.params.podcastId,
//     });

//     socket.on('connect', () => {
//       console.log('connection established');
//     });

//     socket.on('comment-processing', (data: boolean) => {
//       setCommentLoading(data);
//     });

//     socket.on('error', data => {
//       console.log('connection error', data);
//     });

//     socket.on('fetch-comments', data => {
//       // console.log('comment loaded');
//      // if (data.articleId === route.params.articleId) {
//         setComments(data.comments);
//       //}
//     });

//     return () => {
//       socket.off('fetch-comments');
//     };
//   }, [socket, route.params.articleId, route.params.podcastId]);

//   if (commentLoading) {
//     return <Loader />;
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>💬 Feedback</Text>

//       {/* Comments List */}
//       <FlatList
//         ref={flatListRef}
//         data={comments}
//         renderItem={({item}) => (
//           <CommentItem
//             item={item}
//             isSelected={commentId === item._id}
//             handleMentionClick={() => {}}
//           />
//         )}
//         keyExtractor={item => item._id}
//         style={styles.commentsList}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: '#FFFFFF',
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   commentsList: {
//     flex: 1,
//     marginBottom: 20,
//   },
//   commentContainer: {
//     flexDirection: 'row',
//     marginBottom: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     paddingBottom: 10,
//   },
//   avatar: {
//     fontSize: 30,
//     marginRight: 10,
//     alignSelf: 'center',
//   },
//   username: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginEnd: 4, // Small gap between user handle and content
//   },
//   profileImage: {
//     height: 60,
//     width: 60,
//     borderRadius: 30,
//     objectFit: 'cover',
//     resizeMode: 'contain',
//     marginHorizontal: 4,
//   },

//   profileImage2: {
//     height: 30,
//     width: 30,
//     borderRadius: 15,
//     objectFit: 'cover',
//     resizeMode: 'contain',
//     marginHorizontal: 4,
//   },
//   commentContent: {
//     flex: 1,
//   },
//   username2: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#333',
//     alignSelf: 'center',
//   },
//   comment: {
//     fontSize: 14,
//     color: '#555',
//     marginVertical: 5,
//   },
//   timestamp: {
//     fontSize: 12,
//     color: '#888',
//   },
//   replyContainer: {
//     marginLeft: 20,
//     marginTop: 10,
//   },
//   replyText: {
//     fontSize: 14,
//     color: '#555',
//     fontStyle: 'italic',
//   },
//   textInput: {
//     height: 100,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//     textAlignVertical: 'top',
//     backgroundColor: '#fff',
//     marginTop: 10,
//   },
//   submitButton: {
//     backgroundColor: PRIMARY_COLOR,
//     padding: 15,
//     marginTop: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });

// export default CommentScreen;

import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {CommentScreenProp} from '../type';
//import io from 'socket.io-client';
import Loader from '../components/Loader';
import CommentItem from '../components/CommentItem';
import {useSocket} from '../components/SocketContext';
import {YStack, XStack} from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    border: '#E2E8F0',
    primary: '#2563EB',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    border: '#334155',
    primary: '#3B82F6',
  },
};

const CommentScreen = ({navigation, route}: CommentScreenProp) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const socket = useSocket();
  const {commentId, articleId, podcastId} = route.params;

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    socket.emit('fetch-comments', {
      articleId: podcastId ? null : articleId,
      podcastId: podcastId,
    });

    socket.on('fetch-comments', data => {
      setComments(data.comments || []);
      setLoading(false);

      // Scroll to latest comment
      setTimeout(() => {
        if (flatListRef.current && data.comments?.length > 0) {
          flatListRef.current.scrollToEnd({animated: true});
        }
      }, 300);
    });

    socket.on('new-feedback', data => {
      setComments(prev => [...prev, data]);
      setTimeout(() => flatListRef.current?.scrollToEnd({animated: true}), 100);
    });

    return () => {
      socket.off('fetch-comments');
      socket.off('new-feedback');
    };
  }, [socket, articleId, podcastId]);

  if (loading) return <Loader />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <YStack
          backgroundColor={colors.surface}
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor={colors.border}>
          <XStack alignItems="center" gap="$3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <YStack>
              <Text fontSize={20} fontWeight="700" color={colors.text}>
                Feedback
              </Text>
              <Text fontSize={13} color={colors.secondaryText}>
                {comments.length} comments
              </Text>
            </YStack>
          </XStack>
        </YStack>

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
          contentContainerStyle={{padding: 16, paddingBottom: 100}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              padding="$10">
              <Text fontSize={18} color={colors.secondaryText}>
                No comments yet
              </Text>
            </YStack>
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CommentScreen;
