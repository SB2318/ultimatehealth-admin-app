// import React from 'react';
// import {useCallback, useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// import {PodcastData, PodcastDetailScreenProp} from '../type';
// import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// import Slider from '@react-native-community/slider';
// // import TrackPlayer, {
// //   State,
// //   usePlaybackState,
// //   useProgress,
// // } from 'react-native-track-player';
// import {useMutation, useQuery} from '@tanstack/react-query';
// import axios from 'axios';
// import {
//   APPROVE_PODCAST,
//   DISCARD_PODCAST,
//   GET_IMAGE,
//   GET_PODCAST_DETAILS,
//   GET_STORAGE_DATA,
//   PICK_PODCAST,
// } from '../helper/APIUtils';
// import {useSelector} from 'react-redux';
// import moment from 'moment';
// import Snackbar from 'react-native-snackbar';
// import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
// import {hp} from '../helper/Metric';
// import {StatusEnum} from '../helper/Utils';
// import DiscardReasonModal from '../components/DiscardReasonModal';

// const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
//   //const [progress, setProgress] = useState(10);
//   const insets = useSafeAreaInsets();
//   const {trackId} = route.params;
//  // const playbackState = usePlaybackState();
//  // const progress = useProgress();
//   const {user_token, user_id} = useSelector((state: any) => state.user);
//   const {isConnected} = useSelector((state: any) => state.network);
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);
//   const [discardModalVisible, setDiscardModalVisible] =
//     useState<boolean>(false);

//   const handleListenPress = async () => {
//     // const currentState = await TrackPlayer.getPlaybackState();

//     // console.log('Current state', currentState);
//     // console.log('State Playing', State.Playing);
//     // console.log('State Ready', State.Ready);
//     // console.log('State Stoped', State.Stopped);
//     // if (currentState.state === State.Playing) {
//     //   await TrackPlayer.pause();
//     // } else if (
//     //   currentState.state === State.Paused ||
//     //   currentState.state === State.Ready ||
//     //   currentState.state === State.Stopped
//     // ) {
//     //   await TrackPlayer.play();
//     // }
//   };

//   const {data: podcast, refetch} = useQuery({
//     queryKey: ['get-podcast-details'],
//     queryFn: async () => {
//       try {
//         if (user_token === '') {
//           throw new Error('No token found');
//         }
//         const response = await axios.get(
//           `${GET_PODCAST_DETAILS}?podcast_id=${trackId}`,
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
//   });

//   const addTrack = useCallback(async () => {
//     // await TrackPlayer.reset();
//     // if (podcast) {
//     //   await TrackPlayer.add({
//     //     id: trackId,
//     //     url: `${GET_IMAGE}/${podcast?.audio_url}`,
//     //     title: podcast?.title,
//     //     artist: podcast?.user_id.user_name,
//     //   });
//     // }
//   }, [podcast, trackId]);

//   useEffect(() => {
//     addTrack();
//     return () => {};
//   }, [addTrack]);

//   const formatTime = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     const secs = Math.floor(seconds % 60);

//     if (hours > 0) {
//       return `${hours}:${mins < 10 ? '0' : ''}${mins}:${
//         secs < 10 ? '0' : ''
//       }${secs}`;
//     } else {
//       return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//     }
//   };

//   const pickPodcastMutation = useMutation({
//     mutationKey: ['pick-podcast-key'],
//     mutationFn: async (id: string) => {
//       const res = await axios.post(PICK_PODCAST, {
//         podcast_id: id,
//       });
//       return res.data.message as string;
//     },
//     onSuccess: data => {
//       Snackbar.show({
//         text: data,
//         duration: Snackbar.LENGTH_SHORT,
//       });
//       refetch();
//     },

//     onError: err => {
//       console.log('Pick Podcast Error', err);
//       Snackbar.show({
//         text: 'Something went wrong, try again',
//         duration: Snackbar.LENGTH_SHORT,
//       });
//     },
//   });

//   const discardPodcastMutation = useMutation({
//     mutationKey: ['discard-podcast-mutation'],
//     mutationFn: async ({id, reason}: {id: string; reason: string}) => {
//       const res = await axios.post(DISCARD_PODCAST, {
//         podcast_id: id,
//         discardReason: reason,
//       });

//       return res.data.message as string;
//     },
//     onSuccess: data => {
//       Snackbar.show({
//         text: data,
//         duration: Snackbar.LENGTH_SHORT,
//       });
//       refetch();
//     },

//     onError: err => {
//       console.log('Discard Podcast Error', err);
//       Snackbar.show({
//         text: 'Something went wrong, try again',
//         duration: Snackbar.LENGTH_SHORT,
//       });
//     },
//   });

//   //console.log("podcast id", trackId);
//  // console.log('headers', axios.defaults.headers);
//   const approvePodcastMutation = useMutation({
//     mutationKey: ['publish-podcast-mutation'],
//     mutationFn: async (id: string) => {

//       const res = await axios.post(APPROVE_PODCAST, {
//         podcast_id: id,
//       });

//       return res.data.message as string;
//     },
//     onSuccess: data => {
//       Snackbar.show({
//         text: data,
//         duration: Snackbar.LENGTH_SHORT,
//       });
//       refetch();
//     },

//     onError: err => {
//       console.log('Approve Podcast Error', err);
//       Snackbar.show({
//         text: 'Something went wrong, try again',
//         duration: Snackbar.LENGTH_SHORT,
//       });
//     },
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView>
//         {podcast && podcast.cover_image ? (
//           <Image
//             source={{
//               uri: podcast?.cover_image,
//             }}
//             style={styles.podcastImage}
//           />
//         ) : (
//           <Image
//             source={{
//               uri: 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
//             }}
//             style={styles.podcastImage}
//           />
//         )}

//         <View
//           style={[
//             styles.footer,
//             {
//               paddingBottom:
//                 Platform.OS === 'ios' ? insets.bottom : insets.bottom + 20,
//             },
//           ]}>
//           <View style={styles.authorContainer}>
//             <TouchableOpacity
//               onPress={() => {
//                 //  if (article && article?.authorId) {
//                 //navigation.navigate('UserProfileScreen', {
//                 //  authorId: authorId,
//                 // });
//               }}>
//               {podcast?.user_id.Profile_image ? (
//                 <Image
//                   source={{
//                     uri: podcast?.user_id.Profile_image.startsWith('http')
//                       ? `${podcast?.user_id.Profile_image}`
//                       : `${GET_STORAGE_DATA}/${podcast?.user_id.Profile_image}`,
//                   }}
//                   style={styles.authorImage}
//                 />
//               ) : (
//                 <Image
//                   source={{
//                     uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
//                   }}
//                   style={styles.authorImage}
//                 />
//               )}
//             </TouchableOpacity>
//             <View>
//               <Text style={styles.authorName}>
//                 {podcast ? podcast?.user_id.user_name : ''}
//               </Text>
//               <Text style={styles.authorFollowers}>
//                 {podcast?.user_id.followers
//                   ? podcast?.user_id.followers.length > 1
//                     ? `${podcast?.user_id.followers.length} followers`
//                     : `${podcast?.user_id.followers.length} follower`
//                   : '0 follower'}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.footerOptions}>
//           {/**
//              * <TouchableOpacity
//             style={styles.footerItem}
//             onPress={() => {
//               if (isConnected) {
//                 if (podcast && podcast.status === StatusEnum.PUBLISHED) {
//                   navigation.navigate('PodcastDiscussion', {
//                     podcastId: podcast?._id,
//                     mentionedUsers: podcast?.mentionedUsers,
//                   });
//                 }
//               } else {
//                 Snackbar.show({
//                   text: 'You are currently offline',
//                   duration: Snackbar.LENGTH_SHORT,
//                 });
//               }
//             }}>
//             <Ionicons name="chatbubble-outline" size={24} color="#1E1E1E" />
//             <Text style={styles.likeCount}>
//               {podcast?.commentCount ? formatCount(podcast?.commentCount) : 0}
//             </Text>
//           </TouchableOpacity>
//              */}

//           {podcast?.status === StatusEnum.REVIEW_PENDING && (
//             <TouchableOpacity
//               style={{...styles.footerItem, flexDirection: 'column'}}
//               onPress={() => {
//                 if (isConnected) {
//                   if (pickPodcastMutation.isPending) {
//                     return;
//                   } else {
//                     pickPodcastMutation.mutate(podcast._id);
//                   }
//                 } else {
//                   Snackbar.show({
//                     text: 'You are currently offline',
//                     duration: Snackbar.LENGTH_SHORT,
//                   });
//                 }
//               }}>
//               <MaterialIcons name="task-alt" size={30} color="#008080" />

//               <Text style={{...styles.likeCount, color: '#008080'}}>Pick</Text>
//             </TouchableOpacity>
//           )}

//           {podcast?.status !== StatusEnum.REVIEW_PENDING &&
//             podcast?.status !== StatusEnum.PUBLISHED &&
//             podcast?.admin_id === user_id && (
//               <TouchableOpacity
//                 style={{...styles.footerItem, flexDirection: 'column'}}
//                 onPress={() => {
//                   if (isConnected) {
//                     if (approvePodcastMutation.isPending) {
//                       return;
//                     } else {
//                       approvePodcastMutation.mutate(trackId);
//                     }
//                   } else {
//                     Snackbar.show({
//                       text: 'You are currently offline',
//                       duration: Snackbar.LENGTH_SHORT,
//                     });
//                   }
//                 }}>
//                 <MaterialIcons name="approval" size={30} color="#1E1E1E" />
//                 <Text style={{...styles.likeCount, color: '#008080'}}>
//                   Approve
//                 </Text>
//               </TouchableOpacity>
//             )}

//           {podcast?.status !== StatusEnum.PUBLISHED && (
//             <TouchableOpacity
//               style={{...styles.footerItem, flexDirection: 'column'}}
//               onPress={() => {
//                 if (isConnected) {
//                   if (discardPodcastMutation.isPending) {
//                     return;
//                   } else {
//                     setDiscardModalVisible(true);
//                   }
//                 } else {
//                   Snackbar.show({
//                     text: 'You are currently offline',
//                     duration: Snackbar.LENGTH_SHORT,
//                   });
//                 }
//               }}>
//               <MaterialIcons
//                 name="indeterminate-check-box"
//                 size={29}
//                 color="#DC143C"
//               />
//               <Text style={{...styles.likeCount, color: '#DC143C'}}>
//                 Discard
//               </Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         <Text style={styles.episodeTitle}>{podcast?.title}</Text>
//         <View>
//           <Text
//             style={styles.podcastTitle}
//             numberOfLines={isExpanded ? undefined : 3}
//             ellipsizeMode="tail">
//             {podcast?.description}
//           </Text>
//           {podcast &&
//             podcast.description &&
//             podcast?.description?.length > 100 && (
//               <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
//                 <Text style={styles.readMoreText}>
//                   {isExpanded ? 'Read Less ' : 'Read More '}
//                 </Text>
//               </TouchableOpacity>
//             )}
//         </View>

//         <View style={styles.tagsContainer}>
//           {podcast?.tags?.map((tag, index) => (
//             <Text key={index} style={styles.tagText}>
//               #{tag.name}
//             </Text>
//           ))}
//         </View>

//         <View style={styles.metaInfo}>
//           <Text style={styles.metaText}>
//             {moment(podcast?.updated_at).format('MMMM Do YYYY, h:mm A')}
//           </Text>
//         </View>

//         <Slider
//           style={styles.slider}
//           minimumValue={0}
//          // maximumValue={progress.duration}
//          // value={progress.position}
//           minimumTrackTintColor={PRIMARY_COLOR}
//           maximumTrackTintColor="#ccc"
//           thumbTintColor={PRIMARY_COLOR}
//           onSlidingComplete={async value => {
//             // seek to selected time
//             //await TrackPlayer.seekTo(value);
//           }}
//         />

//         {/* <View style={styles.timeRow}>
//           <Text style={styles.time}>{formatTime(progress.position)}</Text>
//           <Text style={styles.time}>{formatTime(progress.duration)}</Text>
//         </View> */}

//         <DiscardReasonModal
//           visible={discardModalVisible}
//           callback={(reason: string) => {
//             //onclick(item, 1, reason);
//             discardPodcastMutation.mutate({
//               id: trackId,
//               reason: reason,
//             });
//             setDiscardModalVisible(false);
//           }}
//           dismiss={() => {
//             setDiscardModalVisible(false);
//           }}
//         />

//         {/* {playbackState.state === State.Buffering && (
//           <Text style={styles.bufferingText}>⏳ Buffering... please wait</Text>
//         )} */}

//         {/* <TouchableOpacity
//           style={[
//             styles.listenButton,
//            // playbackState.state === State.Buffering &&
//               styles.listenButtonDisabled,
//           ]}
//           onPress={handleListenPress}
//           disabled={playbackState.state === State.Buffering}>
//           <Text style={styles.listenText}>
//             {playbackState.state === State.Playing
//               ? '⏸️Pause'
//               : '🎧 Listen Now'}
//           </Text>
//         </TouchableOpacity> */}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default PodcastDetail;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: ON_PRIMARY_COLOR,
//     paddingHorizontal: 12,
//     paddingTop: Platform.OS === 'android' ? 12 : 0,
//   },
//   header: {
//     fontSize: 20,
//     textAlign: 'center',
//     marginBottom: 6,
//     fontWeight: '600',
//     color: '#444',
//   },
//   podcastImage: {
//     width: '100%',
//     height: 160,
//     alignSelf: 'center',
//     borderRadius: hp(2),
//     marginBottom: 12,
//     resizeMode: 'cover',
//   },
//   episodeTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#1E1E1E',
//     marginBottom: 8,
//     paddingHorizontal: 6,
//   },
//   podcastTitle: {
//     fontSize: 16,
//     textAlign: 'justify',
//     color: '#555',
//     marginBottom: 2,
//     paddingHorizontal: 6,
//   },
//   readMoreText: {
//     color: '#007AFF',
//     marginTop: 2,
//     fontSize: 15,
//     fontWeight: '500',
//     paddingHorizontal: 6,
//   },
//   tagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 6,
//     marginVertical: 6,
//     paddingHorizontal: 6,
//   },
//   tagText: {
//     color: PRIMARY_COLOR,
//     fontSize: 15,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     backgroundColor: '#F0F0F0',
//   },
//   metaInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 6,
//     marginBottom: 10,
//   },
//   metaText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   slider: {
//     width: '100%',
//     height: 36,
//     marginTop: 6,
//     marginBottom: 2,
//   },
//   timeRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 4,
//     marginBottom: 12,
//   },
//   time: {
//     fontSize: 13,
//     color: '#777',
//   },
//   bufferingText: {
//     textAlign: 'center',
//     color: '#888',
//     marginBottom: 6,
//     fontStyle: 'italic',
//     fontSize: 14,
//   },
//   listenButton: {
//     backgroundColor: BUTTON_COLOR,
//     paddingVertical: 14,
//     borderRadius: 24,
//     alignItems: 'center',
//     marginVertical: 16,
//   },
//   listenButtonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   listenText: {
//     color: '#fff',
//     fontSize: 17,
//     fontWeight: '600',
//   },
//   footerOptions: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 12,
//     paddingHorizontal: 12,
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//     paddingTop: 12,
//     paddingBottom: 16,
//     paddingHorizontal: 12,
//     marginTop: 16,
//     gap: 10,
//   },
//   authorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flex: 1,
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
//   footerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 10,
//   },

//   likeCount: {
//     marginLeft: 4,
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '700',
//   },
// });

import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, Platform} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PodcastData, PodcastDetailScreenProp} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import Slider from '@react-native-community/slider';

import {useAudioPlayer} from 'expo-audio';

import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {
  APPROVE_PODCAST,
  DISCARD_PODCAST,
  GET_IMAGE,
  GET_PODCAST_DETAILS,
  PICK_PODCAST,
} from '../helper/APIUtils';
import {useSelector} from 'react-redux';
import {formatCount, StatusEnum} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp} from '../helper/Metric';
import Loader from '../components/Loader';
import {Button, Theme, XStack, YStack, Text} from 'tamagui';
import LottieView from 'lottie-react-native';
import {MaterialIcons} from '@expo/vector-icons';
import DiscardReasonModal from '../components/DiscardReasonModal';
import { ActionButtonBar } from '../components/PodcastAction';

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  const insets = useSafeAreaInsets();
  const {trackId, audioUrl} = route.params;

  const [playing, setIsPlaying] = useState(false);

  const {user_token, user_id, user_handle} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);

  const {data: podcast, refetch} = useQuery({
    queryKey: ['get-podcast-details'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(
          `${GET_PODCAST_DETAILS}?podcast_id=${trackId}`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );
        return response.data as PodcastData;
      } catch (err) {
        console.error('Error fetching podcast:', err);
      }
    },
  });

  // const [source, setSource] = useState<string  | null>(null);

  const source = audioUrl?.startsWith('http')
    ? audioUrl
    : `${GET_IMAGE}/${audioUrl}`;

  console.log('source', source);
  // only initialize once a valid uri exists
  const player = useAudioPlayer(
    source ?? require('../../assets/sounds/funny-cartoon-sound-397415.mp3'),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (player.playing) {
        setPosition(player.currentTime || 0);
        setDuration(player.duration || 1);
        // setIsPlaying(player.playing || false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player.currentTime, player.duration, player.playing]);

  const SKIP_TIME = 5; // seconds

  const handleForward = async () => {
    if (!player) return;

    let next = position + SKIP_TIME;

    if (next > duration) {
      next = duration;
    }

    await player.seekTo(next);
    setPosition(next);
  };

  const handleBackward = async () => {
    if (!player) return;

    let next = position - SKIP_TIME;

    if (next < 0) {
      next = 0;
    }

    await player.seekTo(next);
    setPosition(next);
  };

  const formatSecTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${
        secs < 10 ? '0' : ''
      }${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };
  // For position update

  useEffect(() => {
    const interval = setInterval(async () => {
      if (player) {
        const status = player.currentStatus;
        if (status.isLoaded) setPosition(status.currentTime);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player, player.currentTime, player.duration, player.playing]);

  const handlePlay = async () => {
    console.log('Play called');
    if (!player) {
      console.log('enter');
      return;
    }
    //await player.seekTo(0);
    player.play();
    //setUiState('playing');
    setIsPlaying(true);
  };

  const handlePause = async () => {
    console.log('Pause called');
    if (!player) return;

    player.pause();
    //  setUiState('paused');
    setIsPlaying(false);
  };

  const pickPodcastMutation = useMutation({
    mutationKey: ['pick-podcast-key'],
    mutationFn: async (id: string) => {
      const res = await axios.post(PICK_PODCAST, {
        podcast_id: id,
      });
      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      refetch();
    },

    onError: err => {
      console.log('Pick Podcast Error', err);
      Snackbar.show({
        text: 'Something went wrong, try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const discardPodcastMutation = useMutation({
    mutationKey: ['discard-podcast-mutation'],
    mutationFn: async ({id, reason}: {id: string; reason: string}) => {
      const res = await axios.post(DISCARD_PODCAST, {
        podcast_id: id,
        discardReason: reason,
      });

      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      refetch();
    },

    onError: err => {
      console.log('Discard Podcast Error', err);
      Snackbar.show({
        text: 'Something went wrong, try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  //   //console.log("podcast id", trackId);
  //  // console.log('headers', axios.defaults.headers);
  const approvePodcastMutation = useMutation({
    mutationKey: ['publish-podcast-mutation'],
    mutationFn: async (id: string) => {
      const res = await axios.post(APPROVE_PODCAST, {
        podcast_id: id,
      });

      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      refetch();
    },

    onError: err => {
      console.log('Approve Podcast Error', err);
      Snackbar.show({
        text: 'Something went wrong, try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Theme name="dark">
      <YStack
        flex={1}
        backgroundColor="#0B1425"
        padding="$4"
        paddingTop="$6"
        justifyContent="flex-start">
        {/* TITLE */}
       
          <Text color="white" fontSize={28} fontWeight="700" alignSelf='center'>
            {podcast?.title}
          </Text>
    

        {/* MAIN WAVE */}
        <YStack alignItems="center" marginTop="$1">
          <LottieView
            source={require('../../assets/LottieAnimation/wave-loop.json')}
            autoPlay
            loop
            style={{width: '100%', height: 130, backgroundColor:"red"}}
          />
        </YStack>

        {/* PLAYING VISUALIZER */}
        {playing && (
          <YStack alignItems="center" marginTop="$1">
            <LottieView
              source={require('../../assets/LottieAnimation/sound-voice-waves.json')}
              autoPlay
              loop
              style={{width: '100%', height: 100}}
            />
          </YStack>
        )}

        {/* SLIDER + TIME */}
        <YStack marginTop="$1">
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor={PRIMARY_COLOR}
            maximumTrackTintColor="#ccc"
            thumbTintColor={PRIMARY_COLOR}
            onSlidingComplete={async v => {
              if (player) {
                await player.seekTo(v);
                setPosition(v);
              }
            }}
          />

          <XStack justifyContent="space-between" marginTop="$1">
            <Text color="#C0C9DA">{formatSecTime(position)}</Text>
            <Text color="#C0C9DA">{formatSecTime(duration)}</Text>
          </XStack>
        </YStack>

        {/* PLAYER BUTTONS */}
        <XStack
          justifyContent="space-around"
          alignItems="center"
          backgroundColor='red'
          marginTop="$1">
          <Button
            height={60}
            chromeless
            onPress={handleBackward}
            icon={<Ionicons name="play-back" size={26} color="#9BB3C8" />}
          />

          <Button
            width={60}
            height={60}
            borderRadius={30}
            backgroundColor="#4ACDFF"
            onPress={() =>
              player.currentStatus.playing ? handlePause() : handlePlay()
            }
            icon={
              playing ? (
                <Ionicons name="pause" size={25} color="white" />
              ) : (
                <Ionicons name="play" size={25} color="white" />
              )
            }
            elevate
            shadowColor="#4ACDFF"
            shadowRadius={30}
            shadowOffset={{width: 0, height: 0}}
          />

          <Button
            height={60}
            chromeless
            onPress={handleForward}
            icon={<Ionicons name="play-forward" size={26} color="#9BB3C8" />}
          />
        </XStack>

        {/* FOOTER OPTIONS */}
        {
          /**
           * {podcast && podcast.status === StatusEnum.PUBLISHED ? (
          <XStack
            style={styles.footerOptions}
            alignItems="center"
            justifyContent="space-evenly">
            
            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => {
                if (!isConnected) {
                  Snackbar.show({
                    text: 'You are currently offline',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                  return;
                }

                if (podcast) {
                  // navigation.navigate('PodcastDiscussion', {
                  //   podcastId: podcast._id,
                  //   mentionedUsers: podcast.mentionedUsers,
                  // });
                }
              }}>
              <Ionicons name="chatbubble-outline" size={24} color="white" />
              <Text style={styles.likeCount}>
                {podcast?.commentCount ? formatCount(podcast.commentCount) : 0}
              </Text>
            </TouchableOpacity>
          </XStack>
        ) : (
          <XStack>
            {podcast?.status === StatusEnum.REVIEW_PENDING && (
              <TouchableOpacity
                style={{...styles.footerItem, flexDirection: 'column'}}
                onPress={() => {
                  if (isConnected) {
                    if (pickPodcastMutation.isPending) {
                      return;
                    } else {
                      pickPodcastMutation.mutate(podcast._id);
                    }
                  } else {
                    Snackbar.show({
                      text: 'You are currently offline',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                  }
                }}>
                <MaterialIcons name="task-alt" size={30} color="#008080" />

                <Text style={{...styles.likeCount, color: '#008080'}}>
                  Pick
                </Text>
              </TouchableOpacity>
            )}

            {podcast?.status !== StatusEnum.REVIEW_PENDING &&
              podcast?.status !== StatusEnum.PUBLISHED &&
              podcast?.admin_id === user_id && (
                <TouchableOpacity
                  style={{...styles.footerItem, flexDirection: 'column'}}
                  onPress={() => {
                    if (isConnected) {
                      if (approvePodcastMutation.isPending) {
                        return;
                      } else {
                        approvePodcastMutation.mutate(trackId);
                      }
                    } else {
                      Snackbar.show({
                        text: 'You are currently offline',
                        duration: Snackbar.LENGTH_SHORT,
                      });
                    }
                  }}>
                  <MaterialIcons name="approval" size={30} color="#1E1E1E" />
                  <Text style={{...styles.likeCount, color: '#008080'}}>
                    Approve
                  </Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity
              style={{...styles.footerItem, flexDirection: 'column'}}
              onPress={() => {
                if (isConnected) {
                  if (discardPodcastMutation.isPending) {
                    return;
                  } else {
                    setDiscardModalVisible(true);
                  }
                } else {
                  Snackbar.show({
                    text: 'You are currently offline',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                }
              }}>
              <MaterialIcons
                name="indeterminate-check-box"
                size={29}
                color="#DC143C"
              />
              <Text style={{...styles.likeCount, color: '#DC143C'}}>
                Discard
              </Text>
            </TouchableOpacity>
          </XStack>
        )}
           */
        }

        <ActionButtonBar/>

        <DiscardReasonModal
          visible={discardModalVisible}
          callback={(reason: string) => {
            //onclick(item, 1, reason);
            discardPodcastMutation.mutate({
              id: trackId,
              reason: reason,
            });
            setDiscardModalVisible(false);
          }}
          dismiss={() => {
            setDiscardModalVisible(false);
          }}
        />
      </YStack>
    </Theme>
  );
};

export default PodcastDetail;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
    color: '#444',
  },
  podcastImage: {
    width: '100%',
    height: 160,
    alignSelf: 'center',
    borderRadius: hp(2),
    marginBottom: 12,
    resizeMode: 'cover',
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E1E1E',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  podcastTitle: {
    fontSize: 16,
    textAlign: 'justify',
    color: '#555',
    marginBottom: 2,
    paddingHorizontal: 6,
  },
  readMoreText: {
    color: '#007AFF',
    marginTop: 2,
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
    paddingHorizontal: 6,
  },
  tagText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: 2,
    marginBottom: 1,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  time: {
    fontSize: 13,
    color: '#777',
  },
  bufferingText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 6,
    fontStyle: 'italic',
    fontSize: 14,
  },
  listenButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  listenButtonDisabled: {
    backgroundColor: '#ccc',
  },
  listenText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: hp(6),
    paddingHorizontal: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 10,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  authorImage: {
    height: 45,
    width: 45,
    borderRadius: 45,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
  },
  authorFollowers: {
    fontWeight: '400',
    fontSize: 13,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    borderRadius: 20,
    paddingVertical: 8,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#fff',
  },
});
