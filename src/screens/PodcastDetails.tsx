// import React, {useEffect, useState} from 'react';
// import {StyleSheet, Platform} from 'react-native';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import {PodcastData, PodcastDetailScreenProp} from '../type';
// import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// import Slider from '@react-native-community/slider';

// import {useAudioPlayer} from 'expo-audio';

// import {useMutation, useQuery} from '@tanstack/react-query';
// import axios from 'axios';
// import {
//   APPROVE_PODCAST,
//   DISCARD_PODCAST,
//   GET_IMAGE,
//   GET_PODCAST_DETAILS,
//   PICK_PODCAST,
// } from '../helper/APIUtils';
// import {useSelector} from 'react-redux';
// import {msToTime, StatusEnum} from '../helper/Utils';
// import Snackbar from 'react-native-snackbar';
// import {hp, wp} from '../helper/Metric';
// import Loader from '../components/Loader';
// import {Button, Theme, XStack, YStack, Text} from 'tamagui';
// import LottieView from 'lottie-react-native';
// import DiscardReasonModal from '../components/DiscardReasonModal';
// import {ActionButtonBar} from '../components/PodcastAction';

// const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
//   //const [progress, setProgress] = useState(10);
//   const {trackId, audioUrl} = route.params;

//   //console.log('Podcast Detail Audio URL:', audioUrl);

//   const [playing, setIsPlaying] = useState(false);

//   const {user_token, user_id} = useSelector((state: any) => state.user);
//   const {isConnected} = useSelector((state: any) => state.network);
//   const [isLoading, setLoading] = useState<boolean>(false);
//   const [duration, setDuration] = useState(0);
//   const [position, setPosition] = useState(0);

//   const [discardModalVisible, setDiscardModalVisible] =
//     useState<boolean>(false);

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
//     enabled: !!isConnected && !!user_token,
//   });

//   // const [source, setSource] = useState<string  | null>(null);
//   useEffect(() => {
//     if (podcast) {
//       setDuration(Number(podcast.duration));
//     }
//   }, [podcast]);

//   const source = audioUrl?.startsWith('http')
//     ? audioUrl
//     : `${GET_IMAGE}/${audioUrl}`;

//   console.log('source', source);
//   // only initialize once a valid uri exists
//   const player = useAudioPlayer(
//     source ?? require('../../assets/sounds/funny-cartoon-sound-397415.mp3'),
//   );

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (player.playing) {
//         setPosition(player.currentTime || 0);
//         setDuration(player.duration || 1);
//         // setIsPlaying(player.playing || false);
//       }
//     }, 500);

//     return () => clearInterval(interval);
//   }, [player.currentTime, player.duration, player.playing]);

//   const SKIP_TIME = 5; // seconds

//   const handleForward = async () => {
//     if (!player) return;

//     let next = position + SKIP_TIME;

//     if (next > duration) {
//       next = duration;
//     }

//     await player.seekTo(next);
//     setPosition(next);
//   };

//   const handleBackward = async () => {
//     if (!player) return;

//     let next = position - SKIP_TIME;

//     if (next < 0) {
//       next = 0;
//     }

//     await player.seekTo(next);
//     setPosition(next);
//   };

//   const formatSecTime = (seconds: number) => {
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
//   // For position update

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       if (player) {
//         const status = player.currentStatus;
//         if (status.isLoaded) setPosition(status.currentTime);
//       }
//     }, 500);
//     return () => clearInterval(interval);
//   }, [player, player.currentTime, player.duration, player.playing]);

//   const handlePlay = async () => {
//     console.log('Play called', player.currentStatus);

//     if (!player) {
//       console.log('enter');
//       return;
//     }
//     //await player.seekTo(0);
//     player.play();
//     //setUiState('playing');
//     setIsPlaying(true);
//   };

//   const handlePause = async () => {
//     console.log('Pause called', player.currentStatus);
//     if (!player) return;

//     player.pause();
//     //  setUiState('paused');
//     setIsPlaying(false);
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

//   //   //console.log("podcast id", trackId);
//   //  // console.log('headers', axios.defaults.headers);
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

//   if (isLoading) {
//     return <Loader />;
//   }

//   return (
//     <Theme name="dark">
//       <YStack
//         flex={1}
//         backgroundColor="#0B1425"
//         padding="$4"
//         paddingTop="$6"
//         justifyContent="flex-start">
//         {/* TITLE */}

//         <YStack
//          // style={styles.footerOptions}
//           alignItems="center"
//           justifyContent="space-between">
//           <Text color="white" fontSize={20} fontWeight="700" marginTop={hp(7)}>
//             {podcast?.title}
//           </Text>
//           <Button
//             width={wp(43)}
//             height={hp(8)}
//             marginTop="$6"
//             borderRadius={wp(4)}
//             backgroundColor="#4ACDFF" // Blue color
//             onPress={() => {
//               if (!isConnected) {
//                 Snackbar.show({
//                   text: 'You are currently offline',
//                   duration: Snackbar.LENGTH_SHORT,
//                 });
//                 return;
//               }

//               if (podcast) {
//                 navigation.navigate('PodcastDiscussion', {
//                   podcastId: podcast._id,
//                   mentionedUsers: podcast.mentionedUsers,
//                 });
//               }
//             }}>
//             <Text style={{color: 'white', fontSize: 17, fontWeight: '600'}}>
//               See Description
//             </Text>
//           </Button>
//         </YStack>

//         {/* MAIN WAVE */}
//         <YStack alignItems="center" marginTop="$4">
//           <LottieView
//             source={require('../../assets/LottieAnimation/wave-loop.json')}
//             autoPlay
//             loop
//             style={{width: '100%', height: 150}}
//           />
//         </YStack>

//         {/* PLAYING VISUALIZER */}
//         {playing && (
//           <YStack alignItems="center" marginTop="$1">
//             <LottieView
//               source={require('../../assets/LottieAnimation/sound-voice-waves.json')}
//               autoPlay
//               loop
//               style={{width: '100%', height: 100}}
//             />
//           </YStack>
//         )}

//         {/* SLIDER + TIME */}
//         <YStack marginTop="$1">
//           <Slider
//             style={styles.slider}
//             minimumValue={0}
//             maximumValue={duration}
//             value={position}
//             minimumTrackTintColor={PRIMARY_COLOR}
//             maximumTrackTintColor="#ccc"
//             thumbTintColor={PRIMARY_COLOR}
//             onSlidingComplete={async v => {
//               if (player) {
//                 await player.seekTo(v);
//                 setPosition(v);
//                 setIsPlaying(false);
//               }
//             }}
//           />

//           <XStack justifyContent="space-between" marginTop="$1">
//             <Text color="#C0C9DA">{formatSecTime(position)}</Text>
//             <Text color="#C0C9DA">{formatSecTime(duration)}</Text>
//           </XStack>
//         </YStack>

//         {/* PLAYER BUTTONS */}
//         <XStack
//           justifyContent="space-around"
//           alignItems="center"
//           marginTop="$2">
//           <Button
//             height={60}
//             chromeless
//             onPress={handleBackward}
//             icon={<Ionicons name="play-back" size={26} color="#9BB3C8" />}
//           />

//           <Button
//             width={60}
//             height={60}
//             borderRadius={30}
//             backgroundColor="#4ACDFF"
//             onPress={() =>
//               player.currentStatus.playing ? handlePause() : handlePlay()
//             }
//             icon={
//               playing ? (
//                 <Ionicons name="pause" size={25} color="white" />
//               ) : (
//                 <Ionicons name="play" size={25} color="white" />
//               )
//             }
//             elevate
//             shadowColor="#4ACDFF"
//             shadowRadius={30}
//             shadowOffset={{width: 0, height: 0}}
//           />

//           <Button
//             height={60}
//             chromeless
//             onPress={handleForward}
//             icon={<Ionicons name="play-forward" size={26} color="#9BB3C8" />}
//           />
//         </XStack>

//         <ActionButtonBar
//           status={podcast?.status || StatusEnum.REVIEW_PENDING}
//           admin_id={podcast?.admin_id ?? ''}
//           user_id={user_id}
//           pick={() => {
//             if (isConnected) {
//               if (pickPodcastMutation.isPending || !podcast) {
//                 return;
//               } else {
//                 pickPodcastMutation.mutate(podcast?._id);
//               }
//             } else {
//               Snackbar.show({
//                 text: 'You are currently offline',
//                 duration: Snackbar.LENGTH_SHORT,
//               });
//             }
//           }}
//           approve={() => {
//             if (isConnected) {
//               if (approvePodcastMutation.isPending) {
//                 return;
//               } else {
//                 approvePodcastMutation.mutate(trackId);
//               }
//             } else {
//               Snackbar.show({
//                 text: 'You are currently offline',
//                 duration: Snackbar.LENGTH_SHORT,
//               });
//             }
//           }}
//           discard={() => {
//             if (isConnected) {
//               if (discardPodcastMutation.isPending) {
//                 return;
//               } else {
//                 setDiscardModalVisible(true);
//               }
//             } else {
//               Snackbar.show({
//                 text: 'You are currently offline',
//                 duration: Snackbar.LENGTH_SHORT,
//               });
//             }
//           }}
//         />

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
//       </YStack>
//     </Theme>
//   );
// };

// export default PodcastDetail;

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
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
//     marginTop: 2,
//     marginBottom: 1,
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
//     marginBottom: hp(6),
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
//     color: '#fff',
//   },
// });

import React, {useEffect, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {YStack, XStack, Text, Button} from 'tamagui';
import Icon from '@expo/vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';

import {useAudioPlayer} from 'expo-audio';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

import {
  APPROVE_PODCAST,
  DISCARD_PODCAST,
  GET_IMAGE,
  GET_PODCAST_DETAILS,
  PICK_PODCAST,
} from '../helper/APIUtils';
import Loader from '../components/Loader';
import DiscardReasonModal from '../components/DiscardReasonModal';
import {StatusEnum} from '../helper/Utils';
import {ActionButtonBar} from '../components/PodcastAction';
import {PodcastData, PodcastDetailScreenProp} from '../type';

const COLORS = {
  background: '#0B1425',
  surface: '#1C2533',
  text: '#F1F5F9',
  secondaryText: '#94A3B8',
  primary: '#4ACDFF',
  accent: '#22D3EE',
};

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  const {trackId, audioUrl} = route.params;
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);

  const {
    data: podcast,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['podcast-details', trackId],
    queryFn: async () => {
      const res = await axios.get(
        `${GET_PODCAST_DETAILS}?podcast_id=${trackId}`,
        {
          headers: {Authorization: `Bearer ${user_token}`},
        },
      );
      return res.data as PodcastData;
    },
    enabled: !!user_token && isConnected,
  });

  const source = audioUrl?.startsWith('http')
    ? audioUrl
    : `${GET_IMAGE}/${audioUrl}`;

  const player = useAudioPlayer(source);

  // Update progress and playing state
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setPosition(player.currentTime || 0);
        setDuration(player.duration || 0);
        setIsPlaying(player.playing || false);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [player]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${mins}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = async () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = async (value: number) => {
    if (player) {
      await player.seekTo(value);
      setPosition(value);
    }
  };

  const handleForward = async () => {
    if (player) await player.seekTo(Math.min(duration, position + 15));
  };

  const handleBackward = async () => {
    if (player) await player.seekTo(Math.max(0, position - 15));
  };

  const pickMutation = useMutation({
    mutationFn: async () => axios.post(PICK_PODCAST, {podcast_id: trackId}),
    onSuccess: () => {
      Snackbar.show({
        text: 'Podcast picked successfully',
        duration: Snackbar.LENGTH_SHORT,
      });
      refetch();
    },
    onError: (err: AxiosError) => {
      console.error('Pick Podcast Error:', err);
      Snackbar.show({
        text: 'Failed to pick podcast',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => axios.post(APPROVE_PODCAST, {podcast_id: trackId}),
    onSuccess: () => {
      Snackbar.show({
        text: 'Podcast approved',
        duration: Snackbar.LENGTH_SHORT,
      });
      refetch();
    },
    onError: (err: AxiosError) => {
      console.error('Pick Podcast Error:', err);
      Snackbar.show({
        text: 'Failed to pick podcast',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const discardMutation = useMutation({
    mutationFn: async (reason: string) =>
      axios.post(DISCARD_PODCAST, {podcast_id: trackId, discardReason: reason}),
    onSuccess: () => {
      Snackbar.show({
        text: 'Podcast discarded',
        duration: Snackbar.LENGTH_SHORT,
      });
      refetch();
    },
    onError: (err: AxiosError) => {
      console.error('Discard Podcast Error:', err);
      Snackbar.show({
        text: 'Failed to discard podcast',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  if (isLoading) return <Loader />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: COLORS.background}}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack padding="$5" gap="$7">
            {/* Large Cover Art */}
            <YStack alignItems="center">
              <Image
                source={{uri: podcast?.cover_image.startsWith('http') ? podcast.cover_image : `${GET_IMAGE}/${podcast?.cover_image}`}}
                style={{
                  width: 300,
                  height: 300,
                  borderRadius: 24,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 25},
                  shadowOpacity: 0.4,
                  shadowRadius: 30,
                }}
              />
            </YStack>

            {/* Title & Info */}
            <YStack alignItems="center" gap="$3">
              <Text
                fontSize={26}
                fontWeight="700"
                color={COLORS.text}
                textAlign="center">
                {podcast?.title}
              </Text>
              <Text
                fontSize={16}
                color={COLORS.secondaryText}
                textAlign="center">
                {podcast?.description}
              </Text>
            </YStack>

            {/* Audio Player */}
            <YStack gap="$5" paddingHorizontal="$2">
              <Slider
                style={{width: '100%', height: 45}}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor="#334155"
                thumbTintColor={COLORS.primary}
                onSlidingComplete={handleSeek}
              />

              <XStack justifyContent="space-between">
                <Text color={COLORS.secondaryText} fontSize={14}>
                  {formatTime(position)}
                </Text>
                <Text color={COLORS.secondaryText} fontSize={14}>
                  {formatTime(duration)}
                </Text>
              </XStack>

              {/* Controls */}
              <XStack
                justifyContent="space-around"
                alignItems="center"
                marginTop="$3">
                <TouchableOpacity onPress={handleBackward}>
                  <Icon
                    name="play-back"
                    size={42}
                    color={COLORS.secondaryText}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePlayPause}>
                  <YStack
                    backgroundColor={COLORS.primary}
                    width={82}
                    height={82}
                    borderRadius={999}
                    alignItems="center"
                    justifyContent="center"
                    shadowColor="#4ACDFF"
                    shadowOpacity={0.5}
                    shadowRadius={25}
                    elevation={25}>
                    <Icon
                      name={isPlaying ? 'pause' : 'play'}
                      size={38}
                      color="white"
                    />
                  </YStack>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForward}>
                  <Icon
                    name="play-forward"
                    size={42}
                    color={COLORS.secondaryText}
                  />
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Action Buttons */}
            <ActionButtonBar
              status={podcast?.status || StatusEnum.REVIEW_PENDING}
              admin_id={podcast?.admin_id ?? ''}
              user_id={user_id}
              pick={() => pickMutation.mutate()}
              approve={() => approveMutation.mutate()}
              discard={() => setDiscardModalVisible(true)}
            />
          </YStack>
        </ScrollView>
      </SafeAreaView>

      <DiscardReasonModal
        visible={discardModalVisible}
        callback={reason => {
          discardMutation.mutate(reason);
          setDiscardModalVisible(false);
        }}
        dismiss={() => setDiscardModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default PodcastDetail;
