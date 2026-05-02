import React from 'react';
import {
  Pressable,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import {AntDesign, Entypo, Ionicons} from '@expo/vector-icons';
import ArticleFloatingMenu from './ArticleFloatingMenu';
import {fp, hp, wp} from '../helper/Metric';
import {PodcastData} from '../type';
import {
  BUTTON_COLOR,
  PRIMARY_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../helper/Theme';
import {msToTime, StatusEnum} from '../helper/Utils';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {Text, Image, View} from 'tamagui';

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
  const scale = useSharedValue(1);
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

  const STATUS_COLORS: Record<string, string> = {
    unassigned: '#6B7280',
    'in-progress': '#3B82F6',
    'review-pending': '#F59E0B',
    published: '#10B981',
    discarded: '#EF4444',
    'awaiting-user': '#8B5CF6',
  };

  const statusColor = STATUS_COLORS[item.status?.toLowerCase()] || '#6B7280';

  const imageUri = item.cover_image
    ? item.cover_image.startsWith('https')
      ? item.cover_image
      : `${GET_STORAGE_DATA}/${item.cover_image}`
    : 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg';

  const hostName = item.user_id?.user_name || 'Unknown Host';

  const menuActions =
    item.status === 'review-pending'
      ? [
          {
            name: 'Pick Podcast',
            action: () => {
              handleClick(item, 0, '');
              toggleMenu();
            },
            icon: 'hand-point-right',
            color: '#10B981',
          },
          {
            name: 'View Details',
            action: () => {
              handleClick(item, 3, '');
              toggleMenu();
            },
            icon: 'eye',
            color: PRIMARY_COLOR,
          },
          {
            name: 'Discard Podcast',
            action: () => {
              handleClick(item, 1, '');
              toggleMenu();
            },
            icon: 'times-circle',
            color: '#EF4444',
          },
        ]
      : [
          {
            name: 'View Details',
            action: () => {
              handleClick(item, 3, '');
              toggleMenu();
            },
            icon: 'eye',
            color: PRIMARY_COLOR,
          },
          {
            name: 'Discard Podcast',
            action: () => {
              handleClick(item, 1, '');
              toggleMenu();
            },
            icon: 'ban',
            color: '#EF4444',
          },
          {
            name: 'Unassign Yourself',
            action: () => {
              handleClick(item, 2, '');
              toggleMenu();
            },
            icon: 'minus-circle',
            color: '#10B981',
          },
        ];

  const toggleMenu = () => {
    const isOpening = width.value === 0;

    if (isOpening) {
      width.value = withSpring(270, {damping: 20, stiffness: 180});
      yValue.value = withSpring(0, {damping: 22});
      setSelectedCardId(item._id);
    } else {
      width.value = withTiming(0, {duration: 180});
      yValue.value = withTiming(70, {duration: 180});
      setSelectedCardId('');
    }
  };

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: yValue.value}],
    opacity: width.value > 50 ? 1 : 0,
    width: width.value,
  }));

  return (
    <Pressable
      onPress={() => {
        if (width.value > 0) toggleMenu();
        handleClick(item, 3, '');
      }}
      style={({pressed}) => [{opacity: pressed ? 0.96 : 1}]}>
      <View style={styles.cardContainer}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.image} />

          {/* Play Overlay */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={34} color={PRIMARY_COLOR} />
            </View>
          </View>

          {/* Three Dots Menu */}
          {item.status !== StatusEnum.PUBLISHED && (
            <TouchableOpacity
              style={styles.menuIconContainer}
              onPress={toggleMenu}
              hitSlop={12}>
              <Entypo name="dots-three-vertical" size={20} color="#1F2937" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.textContainer}>
          {/* Tags */}
          {item.tags?.length > 0 && (
            <Text style={styles.tags}>
              {item.tags.map(tag => `#${tag.name}`).join(' • ')}
            </Text>
          )}

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Host */}
          <View style={styles.hostContainer}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={PRIMARY_COLOR}
            />
            <Text style={styles.hostText}>{hostName}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {item.status === StatusEnum.PUBLISHED && (
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={16} color="#6B7280" />
                <Text style={styles.statText}>
                  {item?.viewUsers?.length || 0} views
                </Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.statText}>{msToTime(item.duration)}</Text>
            </View>
          </View>

          {/* Status + View Button */}
          <View style={styles.bottomRow}>
            <Text style={[styles.statusText, {color: statusColor}]}>
              {item.status?.replace(/-/g, ' ').toUpperCase() || 'PENDING'}
            </Text>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleClick(item, 3, '')}>
              <Text style={styles.viewText}>View</Text>
              <AntDesign name="arrow-right" size={16} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating Menu */}
        {isSelected && (
          <Animated.View style={[menuAnimatedStyle, styles.floatingMenu]}>
            <ArticleFloatingMenu
              items={menuActions}
              top={hp(1)}
              left={wp(2)}
              arrowPosition={0.88}
            />
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
};

export default PodcastCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: hp(1.8),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  imageContainer: {
    height: hp(23),
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  menuIconContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'white',
    padding: 9,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },

  textContainer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.2),
  },

  tags: {
    fontSize: fp(3.4),
    color: BUTTON_COLOR,
    fontWeight: '600',
    marginBottom: hp(0.8),
  },

  title: {
    fontSize: fp(5),
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 24,
    marginBottom: hp(1.2),
  },

  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: hp(1.4),
  },

  hostText: {
    fontSize: fp(3.7),
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },

  statsContainer: {
    flexDirection: 'row',
    gap: wp(5),
    marginBottom: hp(1.8),
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statText: {
    fontSize: fp(3.4),
    color: '#6B7280',
    fontWeight: '500',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  statusText: {
    fontSize: fp(3.6),
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: 12,
    gap: 4,
  },

  viewText: {
    fontSize: fp(3.8),
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },

  floatingMenu: {
    position: 'absolute',
    top: hp(6),
    right: wp(4),
    zIndex: 1000,
  },
});
