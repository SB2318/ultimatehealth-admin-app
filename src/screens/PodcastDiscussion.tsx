// import {FC, useEffect, useMemo, useRef, useState} from 'react';
// import {
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   Alert,
//   Pressable,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   TextInput,
//   Keyboard,
//   Platform,
// } from 'react-native';
// // eslint-disable-next-line import/no-duplicates
// import {PodcastData, PodcastDiscussionProp, User, Comment} from '../type';
// import {PRIMARY_COLOR} from '../helper/Theme';
// //import io from 'socket.io-client';
// import {useDispatch, useSelector} from 'react-redux';
// import Loader from '../components/Loader';
// import CommentItem from '../components/CommentItem';
// import {useSocket} from '../components/SocketContext';
// import {
//   useMentions,
//   replaceTriggerValues,
//   TriggersConfig,
//   PatternsConfig,
//   SuggestionsProvidedProps,
//   parseValue,
// } from 'react-native-controlled-mentions';
// import {
//   GET_IMAGE,
//   GET_PODCAST_DETAILS,
//   GET_STORAGE_DATA,
// } from '../helper/APIUtils';
// import {
//   Button,
//   H3,
//   Paragraph,
//   ScrollView,
//   YStack,
//   Text,
//   View,
//   Image,
// } from 'tamagui';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {wp} from '../helper/Metric';
// import {useQuery} from '@tanstack/react-query';
// import axios from 'axios';
// import {StatusEnum} from '../helper/Utils';

// const PodcastDiscussion = ({navigation, route}: PodcastDiscussionProp) => {
//   const {podcastId, mentionedUsers} = route.params;
//   const [comments, setComments] = useState<Comment[]>([]);
//   const [newComment, setNewComment] = useState('');
//   const flatListRef = useRef<FlatList<Comment>>(null);
//   const {user_id, user_token} = useSelector((state: any) => state.user);
//    const {isConnected} = useSelector((state: any) => state.network);
//   const [selectedCommentId, setSelectedCommentId] = useState<string>('');
//   const [editMode, setEditMode] = useState<boolean>(false);
//   const [editCommentId, setEditCommentId] = useState<string | null>(null);
//   const [commentLoading, setCommentLoading] = useState<boolean>(false);
//   const [commentLikeLoading, setCommentLikeLoading] = useState<boolean>(false);
//   const [mentions, setMentions] = useState<User[]>([]);

//   const socket = useSocket();
//   const dispatch = useDispatch();

//   const {data: podcast, refetch} = useQuery({
//     queryKey: ['get-podcast-details'],
//     queryFn: async () => {
//       try {
//         if (user_token === '') {
//           throw new Error('No token found');
//         }
//         const response = await axios.get(
//           `${GET_PODCAST_DETAILS}?podcast_id=${podcastId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${user_token}`,
//             },
//           },
//         );
//         return response.data as PodcastData;
//       } catch (err) {
//         console.error('Error fetching podcast:', err);
//       }
//     },
//     enabled: !!isConnected && !!user_token
//   });

//   // mention triggers for v3
//   // Create as constants outside component or memoize with useMemo
//   const triggersConfig: TriggersConfig<'mention' | 'hashtag'> = {
//     mention: {
//       trigger: '@',
//       textStyle: {fontWeight: 'bold', color: 'blue'},
//     },
//     hashtag: {
//       trigger: '#',
//       allowedSpacesCount: 0,
//       textStyle: {fontWeight: 'bold', color: 'grey'},
//     },
//   };

//   const patternsConfig: PatternsConfig = {
//     url: {
//       pattern:
//         /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
//       textStyle: {color: 'blue'},
//     },
//   };

//   // useMentions hook for v3
//   const {textInputProps, triggers} = useMentions({
//     value: newComment,
//     onChange: setNewComment,
//     triggersConfig,
//     patternsConfig,
//   });

//   const Suggestions: FC<SuggestionsProvidedProps & {suggestions: User[]}> = ({
//     keyword,
//     onSelect,
//     suggestions,
//   }) => {
//     if (keyword == null) {
//       return null;
//     }

//     return (
//       <View>
//         {suggestions
//           .filter(one =>
//             one.user_handle
//               .toLocaleLowerCase()
//               .includes(keyword.toLocaleLowerCase()),
//           )
//           .map(one => (
//             <Pressable
//               key={one._id}
//               onPress={() => {
//                 onSelect({id: one._id, name: one.user_handle});
//                 setMentions(prev => [...prev, one]);
//               }}
//               style={{flex: 0, padding: 12, flexDirection: 'row'}}>
//               {one.Profile_image ? (
//                 <Image
//                   source={{
//                     uri: one.Profile_image.startsWith('https')
//                       ? one.Profile_image
//                       : `${GET_STORAGE_DATA}/${one.Profile_image}`,
//                   }}
//                   style={[
//                     styles.profileImage2,
//                     !one.Profile_image && {
//                       borderWidth: 0.5,
//                       borderColor: 'black',
//                     },
//                   ]}
//                 />
//               ) : (
//                 <Image
//                   source={{
//                     uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
//                   }}
//                   style={[
//                     styles.profileImage2,
//                     {borderWidth: 0.5, borderColor: 'black'},
//                   ]}
//                 />
//               )}

//               <Text style={styles.username2} color="black">
//                 {one.user_handle}
//               </Text>
//             </Pressable>
//           ))}
//       </View>
//     );
//   };

//   const usedUserIds = useMemo(
//     () =>
//       parseValue(newComment, [triggersConfig.mention]).parts.reduce(
//         (acc, part) => {
//           if (part.data?.id) {
//             acc.push(part.data.id);
//           }
//           return acc;
//         },
//         [] as string[],
//       ),
//     [newComment, triggersConfig.mention],
//   );

//   const filteredUsers = useMemo(
//     () => mentionedUsers.filter(user => !usedUserIds.includes(user._id)),
//     [mentionedUsers, usedUserIds],
//   );

//   useEffect(() => {
//     //console.log('Fetching comments for articleId:', route.params.articleId);

//     if (podcast && podcast.status === StatusEnum.PUBLISHED && isConnected) {
//       socket.emit('fetch-comments', {podcastId: route.params.podcastId});
//     }

//     socket.on('connect', () => {
//       console.log('connection established');
//     });

//     socket.on('comment-processing', (data: boolean) => {
//       setCommentLoading(data);
//     });

//     socket.on('like-comment-processing', (data: boolean) => {
//       setCommentLikeLoading(data);
//     });

//     socket.on('error', data => {
//       console.log('connection error', data);
//     });

//     socket.on('fetch-comments', data => {
//       console.log('comment loaded');
//       if (data.podcastId === route.params.podcastId) {
//         setComments(data.comments);
//       }
//     });

//     // Listen for new comments
//     socket.on('comment', data => {
//       //console.log('new comment loaded', data);
//       if (data.podcastId === route.params.podcastId) {
//         setComments(prevComments => {
//           const newComments = [data.comment, ...prevComments];
//           if (flatListRef.current && newComments.length > 1) {
//             flatListRef?.current.scrollToIndex({index: 0, animated: true});
//           }

//           return newComments;
//         });
//       }
//     });

//     // Listen for new replies
//     socket.on('new-reply', data => {
//       if (data.podcastId === route.params.podcastId) {
//         setComments(prevComments => {
//           return prevComments.map(comment =>
//             comment._id === data.parentCommentId
//               ? {...comment, replies: [...comment.replies, data.reply]}
//               : comment,
//           );
//         });
//       }
//     });

//     // Listen to edit comment updates (e.g., when replies are added)
//     socket.on('edit-comment', data => {
//       setComments(prevComments => {
//         return prevComments.map(comment =>
//           comment._id === data._id
//             ? {...comment, ...data} // update the comment with new data
//             : comment,
//         );
//       });
//     });

//     // Listen to like and dislike comment
//     socket.on('like-comment', data => {
//       setComments(prevComments => {
//         return prevComments.map(comment =>
//           comment._id === data._id ? {...comment, ...data} : comment,
//         );
//       });
//     });

//     socket.on('delete-comment', data => {
//       setComments(prevComments =>
//         prevComments.filter(comment => comment._id !== data.commentId),
//       );

//       //console.log('Comments Length', comments.length);
//     });

//     return () => {
//       socket.off('fetch-comments');
//       socket.off('comment');
//       socket.off('new-reply');
//       socket.off('edit-comment');
//       socket.off('delete-comment');
//       socket.off('like-comment');
//     };
//   }, [socket, route.params.podcastId, podcast]);

//   const handleEditAction = (comment: Comment) => {
//     setNewComment(comment.content);
//     setEditMode(true);
//     setEditCommentId(comment._id);
//   };

//   const handleMentionClick = (user_handle: string) => {
//     //console.log('user handle', user_handle);
//     //navigation.navigate('UserProfileScreen', {
//     //  author_handle: user_handle.substring(1),
//     //});
//   };

//   const handleDeleteAction = (comment: Comment) => {
//     //commentId, articleId, userId
//     Alert.alert(
//       'Alert',
//       'Are you sure you want to delete this comment.',
//       [
//         {
//           text: 'Cancel',
//           onPress: () => console.log('Cancel Pressed'),
//           style: 'cancel',
//         },
//         {
//           text: 'OK',
//           onPress: () => {
//             socket.emit('delete-comment', {
//               commentId: comment._id,
//               podcastId: route.params.podcastId,
//               userId: user_id,
//             });
//           },
//         },
//       ],
//       {cancelable: false},
//     );
//   };

//   const handleLikeAction = (comment: Comment) => {
//     socket.emit('like-comment', {
//       commentId: comment._id,
//       podcastId: route.params.podcastId,
//       userId: user_id,
//     });
//   };

//   const handleCommentSubmit = () => {
//     if (!socket) {
//       return;
//     }
//     if (!newComment.trim()) {
//       Alert.alert('Please enter a comment before submitting.');
//       // dispatch(
//       //   showAlert({
//       //     title: '',
//       //     message: 'Please enter a comment before submitting.',
//       //   }),
//       // );
//       return;
//     }

//     if (editMode) {
//       if (editCommentId) {
//         console.log('Edit Comment Id', editCommentId);
//         console.log('Edit Comment ', newComment);
//         console.log('Podcast Id', route.params.podcastId);
//         console.log('User Id', user_id);

//         socket.emit('edit-comment', {
//           commentId: editCommentId,
//           content: newComment,
//           podcastId: route.params.podcastId,
//           userId: user_id,
//         });

//         setNewComment('');
//         setEditCommentId(null);
//         setEditMode(false);
//       } else {
//         Alert.alert('Error: Comment Not Found');
//         //   dispatch(
//         //   showAlert({
//         //     title: 'Error!',
//         //     message: 'Comment not found',
//         //   }),
//         // );
//       }
//     } else {
//       const formatted = replaceTriggerValues(
//         newComment,
//         ({name}) => `@${name}`,
//       );
//       const newCommentObj = {
//         userId: user_id,
//         podcastId: route.params.podcastId,
//         content: formatted,
//         parentCommentId: null,
//         mentionedUsers: mentions,
//       };

//       console.log('Comment emitting', newCommentObj);
//       // Emit the new comment to the backend via socket
//       socket.emit('comment', newCommentObj);

//       setNewComment('');
//     }
//   };

//   if (commentLoading) {
//     return <Loader />;
//   }

//   return (
//     <ScrollView
//       style={{flex: 1}}
//       contentContainerStyle={{
//         flexGrow: 1,
//         paddingBottom: 120,
//         paddingHorizontal: 10,
//         backgroundColor: '#f8f9fb',
//       }}
//       showsVerticalScrollIndicator={false}>
//       <KeyboardAvoidingView
//         style={{flex: 1}}
//         behavior="padding"
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <SafeAreaView
//             style={{flex: 1, backgroundColor: '#f8f9fb', padding: wp(0.1)}}>
//             {/* Header Section */}
//             <YStack gap="$3">
//               <H3 fontSize={19} color="black" fontWeight={'600'}>
//                 {podcast?.title}
//               </H3>

//               <Image
//                 source={{
//                   uri: podcast?.cover_image.startsWith('http')
//                     ? podcast?.cover_image
//                     : `${GET_IMAGE}/${podcast?.cover_image}`,
//                 }}
//                 style={{
//                   width: '100%',
//                   height: 180,
//                   borderRadius: 8,
//                 }}
//               />

//               <Button
//                 onPress={() =>
//                   navigation.navigate('PodcastDetail', {
//                     trackId: podcastId,
//                     audioUrl: podcast?.audio_url ?? '',
//                   })
//                 }
//                 backgroundColor={PRIMARY_COLOR}
//                 pressStyle={{opacity: 0.9}}
//                 borderRadius="$4"
//                 size={'$6'}
//                 marginTop="$2"
//                 paddingVertical={'$3'}
//                 elevation="$2">
//                 <Text color="white" fontWeight="600" fontSize={16}>
//                   🎧 Listen Now
//                 </Text>
//               </Button>
//               <Paragraph color="$gray700" fontSize={17}>
//                 {podcast?.description}
//               </Paragraph>

//               <View style={styles.authorContainer}>
//                 <Pressable
//                   onPress={() => {
//                     //  if (article && article?.authorId) {
//                     //navigation.navigate('UserProfileScreen', {
//                     //  authorId: authorId,
//                     // });
//                   }}>
//                   {podcast?.user_id.Profile_image ? (
//                     <Image
//                       source={{
//                         uri: podcast?.user_id.Profile_image.startsWith('http')
//                           ? `${podcast?.user_id.Profile_image}`
//                           : `${GET_STORAGE_DATA}/${podcast?.user_id.Profile_image}`,
//                       }}
//                       style={styles.authorImage}
//                     />
//                   ) : (
//                     <Image
//                       source={{
//                         uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
//                       }}
//                       style={styles.authorImage}
//                     />
//                   )}
//                 </Pressable>
//                 <View>
//                   <Text style={styles.authorName} color="$color12">
//                     {podcast ? podcast?.user_id.user_name : ''}
//                   </Text>

//                   <Text color="$gray600" style={styles.authorFollowers}>
//                     {podcast?.user_id.followers
//                       ? podcast?.user_id.followers.length > 1
//                         ? `${podcast?.user_id.followers.length} followers`
//                         : `${podcast?.user_id.followers.length} follower`
//                       : '0 follower'}
//                   </Text>
//                 </View>
//               </View>

//               {podcast && podcast.status === StatusEnum.PUBLISHED && (
//                 <>
//                   <Suggestions
//                     suggestions={filteredUsers}
//                     {...triggers.mention}
//                   />

//                   <TextInput
//                     {...textInputProps}
//                     style={styles.textInput}
//                     placeholder="Add a comment..."
//                     multiline
//                   />

//                   {newComment.length > 0 && (
//                     <TouchableOpacity
//                       style={styles.submitButton}
//                       onPress={handleCommentSubmit}>
//                       <Text style={styles.submitButtonText} color={'white'}>
//                         {editMode ? '✏️ Update Comment' : '⏩ Submit Comment'}
//                       </Text>
//                     </TouchableOpacity>
//                   )}
//                   <YStack marginTop="$4" space="$3">
//                     <Text fontWeight="600" fontSize={20}>
//                       {comments.length} Comments
//                     </Text>

//                     {comments.map(item => (
//                       <CommentItem
//                         key={item._id}
//                         item={item}
//                         isSelected={selectedCommentId === item._id}
//                         // later will keep a comment delete action.
//                         // admin can delete any comment or any take action btn
//                         handleMentionClick={handleMentionClick}
//                       />
//                     ))}
//                   </YStack>
//                 </>
//               )}
//             </YStack>
//           </SafeAreaView>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     </ScrollView>
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

//   authorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flex: 1,
//     marginVertical: 10,
//   },
//   authorImage: {
//     height: 45,
//     width: 45,
//     borderRadius: 45,
//   },
//   authorName: {
//     fontWeight: '700',
//     fontSize: 15,
//   },
//   authorFollowers: {
//     fontWeight: '400',
//     fontSize: 13,
//   },
//   followButton: {
//     backgroundColor: PRIMARY_COLOR,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     paddingVertical: 8,
//   },
//   followButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
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
//     fontSize: wp(5),
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

// export default PodcastDiscussion;

import React, {useEffect, useRef, useState, useMemo, FC} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  useColorScheme,
  View,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {YStack, Text, TextArea, Button, Image} from 'tamagui';
import {useSocket} from '../components/SocketContext';
import CommentItem from '../components/CommentItem';
import Loader from '../components/Loader';

import {
  useMentions,
  replaceTriggerValues,
  TriggersConfig,
  PatternsConfig,
  parseValue,
  SuggestionsProvidedProps,
} from 'react-native-controlled-mentions';
import {PodcastDiscussionProp, User} from '../type';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {GET_PODCAST_DETAILS, GET_STORAGE_DATA} from '../helper/APIUtils';
import {StatusEnum} from '../helper/Utils';
import {useSelector} from 'react-redux';

const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    primary: '#2563EB',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    primary: '#3B82F6',
    border: '#334155',
  },
};

const PodcastDiscussion = ({navigation, route}: PodcastDiscussionProp) => {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const {podcastId, mentionedUsers} = route.params;
  const socket = useSocket();
  const {user_id, user_token} = useSelector((state: any) => state.user);

  const [comments, setComments] = useState<any[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [mentions, setMentions] = useState<User[]>([]);

  const flatListRef = useRef<any>(null);

  const handleMentionClick = (user_handle: string) => {
    //console.log('user handle', user_handle);
    //navigation.navigate('UserProfileScreen', {
    //  author_handle: user_handle.substring(1),
    //});
  };

  const patternsConfig: PatternsConfig = {
    url: {
      pattern:
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
      textStyle: {color: 'blue'},
    },
  };

  // Mentions Setup
  const triggersConfig: TriggersConfig<'mention'> = {
    mention: {
      trigger: '@',
      textStyle: {fontWeight: '600', color: colors.primary},
    },
  };

  const {textInputProps, triggers} = useMentions({
    value: newComment,
    onChange: setNewComment,
    triggersConfig,
    patternsConfig,
  });

  const {data: podcast} = useQuery({
    queryKey: ['podcast-details', podcastId],
    queryFn: async () => {
      const res = await axios.get(
        `${GET_PODCAST_DETAILS}?podcast_id=${podcastId}`,
      );
      return res.data;
    },
    enabled: !!podcastId,
  });

  const Suggestions: FC<SuggestionsProvidedProps & {suggestions: User[]}> = ({
    keyword,
    onSelect,
    suggestions,
  }) => {
    if (keyword == null) {
      return null;
    }

    return (
      <View>
        {suggestions
          .filter(one =>
            one.user_handle
              .toLocaleLowerCase()
              .includes(keyword.toLocaleLowerCase()),
          )
          .map(one => (
            <Pressable
              key={one._id}
              onPress={() => {
                onSelect({id: one._id, name: one.user_handle});
                setMentions(prev => [...prev, one]);
              }}
              style={{flex: 0, padding: 12, flexDirection: 'row'}}>
              {one.Profile_image ? (
                <Image
                  source={{
                    uri: one.Profile_image.startsWith('https')
                      ? one.Profile_image
                      : `${GET_STORAGE_DATA}/${one.Profile_image}`,
                  }}
                  style={[
                    styles.profileImage2,
                    !one.Profile_image && {
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
                    styles.profileImage2,
                    {borderWidth: 0.5, borderColor: 'black'},
                  ]}
                />
              )}

              <Text style={styles.username2} color="black">
                {one.user_handle}
              </Text>
            </Pressable>
          ))}
      </View>
    );
  };

  const usedUserIds = useMemo(
    () =>
      parseValue(newComment, [triggersConfig.mention]).parts.reduce(
        (acc, part) => {
          if (part.data?.id) {
            acc.push(part.data.id);
          }
          return acc;
        },
        [] as string[],
      ),
    [newComment, triggersConfig.mention],
  );

  const filteredUsers = useMemo(
    () => mentionedUsers.filter(user => !usedUserIds.includes(user._id)),
    [mentionedUsers, usedUserIds],
  );

  useEffect(() => {
    if (podcast?.status === StatusEnum.PUBLISHED) {
      socket.emit('fetch-comments', {podcastId});
    }

    socket.on('fetch-comments', data => {
      if (data.podcastId === podcastId) setComments(data.comments || []);
    });

    socket.on('comment', data => {
      if (data.podcastId === podcastId) {
        setComments(prev => [data.comment, ...prev]);
        flatListRef.current?.scrollToEnd({animated: true});
      }
    });

    socket.on('comment-processing', (data: boolean) => {
      setCommentLoading(data);
    });

    return () => {
      socket.off('fetch-comments');
      socket.off('comment');
      socket.off('comment-processing');
    };
  }, [socket, podcastId, podcast]);

  const handleSend = () => {
    if (!newComment.trim()) return;

    const formatted = replaceTriggerValues(newComment, ({name}) => `@${name}`);

    socket.emit('comment', {
      userId: user_id,
      podcastId,
      content: formatted,
      parentCommentId: null,
    });

    setNewComment('');
  };

  if (commentLoading) {
    return <Loader />;
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaView style={{flex: 1}}>
        {/* Podcast Header */}
        <YStack
          backgroundColor={colors.surface}
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor={colors.border}>
          <Image
            source={{uri: podcast?.cover_image}}
            style={{width: '100%', height: 180, borderRadius: 12}}
          />
          <Text
            fontSize={20}
            fontWeight="700"
            color={colors.text}
            marginTop="$3">
            {podcast?.title}
          </Text>
          <Text fontSize={15} color={colors.secondaryText}>
            {podcast?.description?.substring(0, 120)}...
          </Text>
        </YStack>

        {/* Comments */}
        <FlatList
          ref={flatListRef}
          data={comments}
          renderItem={({item}) => (
            <CommentItem
              key={item._id}
              item={item}
              isSelected={selectedCommentId === item._id}
              // later will keep a comment delete action.
              // admin can delete any comment or any take action btn
              handleMentionClick={handleMentionClick}
            />
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              padding="$10">
              <Text color={colors.secondaryText} fontSize={17}>
                No comments yet
              </Text>
            </YStack>
          }
        />

        {/* Input Bar */}
        {podcast?.status === StatusEnum.PUBLISHED && (
          <YStack
            backgroundColor={colors.surface}
            padding="$4"
            borderTopWidth={1}
            borderTopColor={colors.border}>
            <Suggestions suggestions={filteredUsers} {...triggers.mention} />

            <TextArea
              {...textInputProps}
              value={newComment}
              onChangeText={e => setNewComment(e.nativeEvent.text)}
              placeholder="Write a comment or mention someone..."
              height={100}
              borderWidth={1.5}
              borderColor={colors.border}
              focusStyle={{borderColor: colors.primary}}
              color={colors.text}
            />

            <Button
              marginTop="$3"
              backgroundColor={colors.primary}
              height={52}
              borderRadius={12}
              onPress={handleSend}
              disabled={!newComment.trim()}>
              <Text color="white" fontWeight="700" fontSize={17}>
                Send
              </Text>
            </Button>
          </YStack>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default PodcastDiscussion;

const styles = StyleSheet.create({
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
});
