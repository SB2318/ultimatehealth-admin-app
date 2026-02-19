import React from 'react';
import {Pressable} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
//import io from 'socket.io-client';
import {Entypo} from '@expo/vector-icons';
import {hp, wp} from '../helper/Metric';
import {PodcastData} from '../type';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {msToTime, StatusEnum} from '../helper/Utils';

import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {XStack, YStack, Text, Image} from 'tamagui';

interface PodcastProps {
  item: PodcastData;
  handleClick: (item: PodcastData, index: number, reason: string) => void;
  isSelected: boolean;
  setSelectedCardId: (id: string) => void;
}

const PodcastCard = ({
  item,
  handleClick,
  isSelected,
  setSelectedCardId,
}: PodcastProps) => {
  type StatusType =
    | 'unassigned'
    | 'in-progress'
    | 'review-pending'
    | 'published'
    | 'discarded'
    | 'awaiting-user';

  type StatusStyle = {
    backgroundColor: string;
    textColor: string;
  };

  const STATUS_STYLES: Record<StatusType, StatusStyle> = {
    unassigned: {backgroundColor: '#A9A9A9', textColor: '#FFFFFF'},
    'in-progress': {backgroundColor: '#007AFF', textColor: '#FFFFFF'},
    'review-pending': {backgroundColor: '#FF9F0A', textColor: '#FFFFFF'},
    published: {backgroundColor: '#34C759', textColor: '#FFFFFF'},
    discarded: {backgroundColor: '#FF3B30', textColor: '#FFFFFF'},
    'awaiting-user': {backgroundColor: '#FFD60A', textColor: '#1C1C1E'},
  };

  const lowerStatus = item.status?.toLowerCase() as StatusType;
  const {backgroundColor} = STATUS_STYLES[lowerStatus] || {
    backgroundColor: '#D1D1D6',
    textColor: '#000000',
  };
  const width = useSharedValue(0);
  const yValue = useSharedValue(-10);

  const opacity = useSharedValue(0);

  const menuStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: yValue.value}, {translateX: width.value}],
      opacity: opacity.value,
    };
  });

  const handleAnimation = () => {
    const isOpening = width.value === 0;
    width.value = withTiming(isOpening ? -20 : 0, {duration: 150});
    yValue.value = withTiming(isOpening ? -1 : 100, {duration: 150});
    opacity.value = withTiming(isOpening ? 1 : 0, {duration: 150});
    setSelectedCardId(isOpening ? item._id : '');
  };

  const unAssignActions = [
    {
      name: 'Pick podcast',
      action: () => {
        handleClick(item, 0, '');
        handleAnimation();
      },
      icon: 'hand-point-right',
      color: BUTTON_COLOR,
    },
    {
      name: 'View details',
      action: () => {
        handleClick(item, 3, '');
        handleAnimation();
      },
      icon: 'eye',
      color: BUTTON_COLOR,
    },
    {
      name: 'Discard Podcast',
      action: () => {
        //setDiscardModalVisible(true);
        //onclick(item, 1);
        handleClick(item, 1, '');
        handleAnimation();
      },
      icon: 'times-circle',
      color: 'red',
    },
  ];

  const progressActions = [
    {
      name: 'View details',
      action: () => {
        handleClick(item, 3, '');
        handleAnimation();
      },
      icon: 'eye',
      color: BUTTON_COLOR,
    },
    {
      name: 'Discard Podcast',
      action: () => {
        //setDiscardModalVisible(true);
        //onclick(item, 1);
        handleClick(item, 1, '');
        handleAnimation();
      },
      icon: 'ban',
      color: 'red',
    },

    {
      name: 'Unassign Yourself',
      action: () => {
        handleClick(item, 2, '');
        handleAnimation();
      },
      icon: 'minus-circle',
      color: 'green',
    },
  ];

  return (
    <XStack
      width="94%"
      justifyContent="space-between"
      gap="$3"
      padding="$2"
      margin="$1"
      backgroundColor="white"
      borderRadius={16}
      // Android
      elevation={5}
      // iOS
      shadowColor="#000"
      shadowOffset={{width: 0, height: 2}}
      shadowOpacity={0.12}
      shadowRadius={4}
      onPress={() => {
        width.value = withTiming(0, {duration: 250});
        yValue.value = withTiming(100, {duration: 250});
        setSelectedCardId('');
        handleClick(item, 3, '');
      }}>
      {/* Image + Text */}
      <XStack flex={1} gap="$3">
        <Image
          source={{
            uri:
              item.cover_image && item.cover_image !== ''
                ? item.cover_image.startsWith('https')
                  ? item.cover_image
                  : `${GET_STORAGE_DATA}/${item.cover_image}`
                : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
          }}
          height={hp(16)}
          width={wp(29)}
          alignSelf='center'
          borderRadius={hp(4)}
        />

        <YStack flex={1}>
          {/* Floating menu */}
          {isSelected && (
            <Animated.View
              style={[
                menuStyle,
                {
                  position: 'absolute',
                  top: hp(-2),
                  right: wp(-25),
                  width: 300,
                  padding: 10,
                  borderRadius: 10,
                  zIndex: 1100,
                },
              ]}>
              <ArticleFloatingMenu
                items={
                  item.status === 'review-pending'
                    ? unAssignActions
                    : progressActions
                }
                top={hp(2)}
                left={wp(2)}
              />
            </Animated.View>
          )}

          {/* More options icon */}
          {item.status !== StatusEnum.PUBLISHED && (
            <Pressable
              position="absolute"
              bottom={hp(12)}
              left={wp(54)}
              zIndex={10}
              backgroundColor="white"
              onPress={handleAnimation}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </Pressable>
          )}

          {/* Title */}
          <Text
            fontSize="$4"
            fontWeight="700"
            color='black'
            numberOfLines={2}
            maxWidth={wp(80)}>
            {item.title}
          </Text>

          {/* Host */}
          <Text fontSize="$3" color="$gray700" marginTop={2}>
            {item.user_id.user_name}
          </Text>

          {/* Tags */}
          <XStack flexWrap="wrap" gap="$2" marginTop="$2">
            {item.tags?.slice(0, 2).map((tag, index) => (
              <Text
                key={index}
                fontSize="$2"
                paddingHorizontal="$3"
                //paddingVertical="$1"
                borderRadius="$6"
                backgroundColor="$gray3"
                color={PRIMARY_COLOR}>
                #{tag.name}
              </Text>
            ))}
          </XStack>

          {/* Status */}
          <Text
            fontSize="$4"
            fontWeight="500"
            color={backgroundColor}
            textTransform="capitalize"
            marginTop="$4">
            {item.status
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </YStack>
      </XStack>

      {/* Play */}
      <YStack
        alignItems="center"
        justifyContent="center"
        minWidth={60}
        marginLeft="$2"
        position="relative"
        top={hp(6)}>
        {/* <Pressable
          onPress={() => {
            width.value = withTiming(0, {duration: 250});
            yValue.value = withTiming(100, {duration: 250});
            setSelectedCardId('');
            handleClick(item, 3, '');
          }}>
          <Feather name="chevrons-right" size={26} color="black" />
        </Pressable> */}

        <Text fontSize="$3.5" color="$color10" marginTop="$1">
          {msToTime(item.duration)}
        </Text>
      </YStack>
    </XStack>
  );
};

export default PodcastCard;
