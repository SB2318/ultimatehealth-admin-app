import React, {useState} from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
//import io from 'socket.io-client';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import {hp, wp} from '../helper/Metric';
import {PodcastData} from '../type';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {msToTime, StatusEnum} from '../helper/Utils';
import DiscardReasonModal from './DiscardReasonModal';
import { GET_STORAGE_DATA } from '../helper/APIUtils';

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
  const [discardModalVisible, setDiscardModalVisible] =
    useState<boolean>(false);

 const opacity = useSharedValue(0);

const menuStyle = useAnimatedStyle(() => {
  return {
    transform: [
      { translateY: yValue.value },
      { translateX: width.value },
    ],
    opacity: opacity.value,
  };
});

const handleAnimation = () => {
  const isOpening = width.value === 0;
  width.value = withTiming(isOpening ? -20 : 0, { duration: 150 });
  yValue.value = withTiming(isOpening ? -1 : 100, { duration: 150 });
  opacity.value = withTiming(isOpening ? 1 : 0, { duration: 150 });
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
        setDiscardModalVisible(true);
        //onclick(item, 1);
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
        setDiscardModalVisible(true);
        //onclick(item, 1);
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
    // Main container for the podcast card
    <View style={styles.container}>
      <View style={styles.imageTextContainer}>
        {/* Display the podcast image */}
        <Image
          source={{
            uri:
              item.cover_image && item.cover_image !== ''
                ? item.cover_image.startsWith("https") ? item.cover_image : `${GET_STORAGE_DATA}/${item.cover_image}`
                : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
          }}
          style={styles.image}
        />
        <View>
          {/* Share Icon */}
          {isSelected && (
            <Animated.View style={[menuStyle, styles.animatedMenu]}>
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

          {/* Icon for more options */}

          {item.status !== StatusEnum.PUBLISHED && (
            <TouchableOpacity
              style={styles.shareIconContainer}
              onPress={() => handleAnimation()}>
              <Entypo name="dots-three-vertical" size={20} color={'black'} />
            </TouchableOpacity>
          )}
          {/* Display the podcast title */}
          <Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
            {item.title}
          </Text>
          {/* Display the podcast host */}
          <Text style={styles.host}>{item.user_id.user_name}</Text>

          <View style={styles.tagsContainer}>
            {item.tags?.slice(0, 2).map((tag, index) => (
              <Text key={index} style={styles.tagText}>
                #{tag.name}
              </Text>
            ))}
          </View>

          <Text style={[styles.statusText, {color: backgroundColor}]}>
            {item.status
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
        </View>
      </View>

      <View style={styles.playContainer}>
        <TouchableOpacity
          onPress={() => {
            // navigate to details
            width.value = withTiming(0, {duration: 250});
            yValue.value = withTiming(100, {duration: 250});
            setSelectedCardId('');

            handleClick(item, 3, '');
          }}>
          <Feather name="chevrons-right" size={26} color={'black'} />
        </TouchableOpacity>

        <Text style={styles.durationText}>{msToTime(item.duration)}</Text>
      </View>

      <DiscardReasonModal
        visible={discardModalVisible}
        callback={(reason: string) => {
          handleClick(item, 1, reason);
          setDiscardModalVisible(false);
        }}
        dismiss={() => {
          setDiscardModalVisible(false);
        }}
      />
    </View>
  );
};

// Styles for the PodcastCard component
const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    padding: 7,
  },
  imageTextContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    height: hp(16),
    width: wp(29),
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
    maxWidth: wp(40),
  },
  host: {
    fontSize: 14,
    fontWeight: 'regular',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  playContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginLeft: 6,
    bottom: hp(2.2),
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    rowGap: 4,
    columnGap: 8,
  },

  tagText: {
    backgroundColor: '#f0f0f0',
    color: PRIMARY_COLOR,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },

 animatedMenu: {
  position: 'absolute',
  top: hp(0.1),
  right: wp(1),
  width: 300,
  padding: 10,
  borderRadius: 10,
  //elevation: 5,
  zIndex: 1100, 
 // shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3.84,
},

 shareIconContainer: {
  position: 'absolute',
  bottom: hp(14),
  left: wp(54),
  zIndex: 10,
  backgroundColor: '#fff',
},

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  stausTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1C1C1E',
  },
  statusBox: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});

export default PodcastCard;
