import React, {useEffect, useState} from 'react';
import {
  Alert,
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
import {DEMO_PODCASTS} from '../helper/DemoData';

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
  const {user_token, user_id, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);

  const {
    data: fetchedPodcast,
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
    enabled: !!user_token && isConnected && !isGuest,
  });

  // Resolve active podcast with clinical demo fallback for guest exploration
  const podcast: PodcastData | undefined =
    fetchedPodcast ||
    DEMO_PODCASTS.find(p => p._id === trackId) ||
    DEMO_PODCASTS[0];

  const source = audioUrl?.startsWith('http')
    ? audioUrl
    : audioUrl
    ? `${GET_IMAGE}/${audioUrl}`
    : podcast?.audio_url?.startsWith('http')
    ? podcast.audio_url
    : podcast?.audio_url
    ? `${GET_IMAGE}/${podcast.audio_url}`
    : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

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
      console.error('Approve Podcast Error:', err);
      Snackbar.show({
        text: 'Failed to approve podcast',
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

  const handlePick = () => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode Simulation',
        'Audio broadcast has been claimed for moderation review in Guest Explorer mode.',
      );
      return;
    }
    pickMutation.mutate();
  };

  const handleApprove = () => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode Simulation',
        'Audio broadcast approved and released to the medical podcast directory.',
      );
      return;
    }
    approveMutation.mutate();
  };

  const handleDiscard = (reason: string) => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode Simulation',
        `Audio broadcast discarded in simulation.\nReason: "${reason}"`,
      );
      setDiscardModalVisible(false);
      return;
    }
    discardMutation.mutate(reason);
    setDiscardModalVisible(false);
  };

  if (isLoading) return <Loader />;

  const coverImageUri = podcast?.cover_image?.startsWith('http')
    ? podcast.cover_image
    : podcast?.cover_image
    ? `${GET_IMAGE}/${podcast.cover_image}`
    : 'https://images.pexels.com/photos/6823567/pexels-photo-6823567.jpeg';

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
                source={{uri: coverImageUri}}
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

            {/* Series & Episode Governance Card */}
            <YStack
              backgroundColor={COLORS.surface}
              borderRadius={16}
              padding="$4"
              borderWidth={1}
              borderColor="#334155"
              gap="$2.5">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <Icon name="radio" size={18} color={COLORS.primary} />
                  <Text fontSize={13.5} fontWeight="700" color={COLORS.text}>
                    Series Governance & Lineage
                  </Text>
                </XStack>
                <XStack
                  backgroundColor="#082F49"
                  paddingHorizontal="$2.5"
                  paddingVertical="$1"
                  borderRadius={8}>
                  <Text fontSize={11.5} fontWeight="700" color={COLORS.primary}>
                    Season 1 • Ep 4
                  </Text>
                </XStack>
              </XStack>

              <Text fontSize={12.5} color={COLORS.secondaryText} lineHeight={18}>
                Part of the Clinical Audio Knowledge Archive. All medical audio broadcasts undergo automated waveform speech-to-text verification and clinical claim moderation.
              </Text>

              {podcast?.user_id && (
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                  borderTopWidth={1}
                  borderTopColor="#334155"
                  paddingTop="$2"
                  marginTop="$1">
                  <Text fontSize={12} color={COLORS.secondaryText}>
                    Speaker: <Text fontWeight="700" color={COLORS.text}>{typeof podcast.user_id === 'object' ? (podcast.user_id as any).user_name : 'Medical Expert'}</Text>
                  </Text>
                  <Text fontSize={11.5} color={COLORS.primary} fontWeight="600">
                    44.1 kHz • AAC Audio
                  </Text>
                </XStack>
              )}
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
              user_id={isGuest ? 'guest_reviewer_id' : user_id}
              pick={handlePick}
              approve={handleApprove}
              discard={() => setDiscardModalVisible(true)}
            />
          </YStack>
        </ScrollView>
      </SafeAreaView>

      <DiscardReasonModal
        visible={discardModalVisible}
        callback={handleDiscard}
        dismiss={() => setDiscardModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default PodcastDetail;
