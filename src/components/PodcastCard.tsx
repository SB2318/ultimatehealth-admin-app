import React from 'react';
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import {AntDesign, Entypo, Ionicons, Feather} from '@expo/vector-icons';
import ArticleFloatingMenu from './ArticleFloatingMenu';
import {fp, hp, wp} from '../helper/Metric';
import {PodcastData} from '../type';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  STATUS_COLORS,
  BORDER_COLOR,
  CARD_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  CLINICAL_SHADOW,
} from '../helper/Theme';
import {msToTime, StatusEnum} from '../helper/Utils';
import {GET_STORAGE_DATA} from '../helper/APIUtils';

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
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

  const getStatusTheme = () => {
    const s = item.status?.toLowerCase() || '';
    if (s.includes('published')) return STATUS_COLORS.approved;
    if (s.includes('in-progress') || s.includes('progress')) return STATUS_COLORS.in_progress;
    if (s.includes('discard')) return STATUS_COLORS.discarded;
    return STATUS_COLORS.pending;
  };

  const statusTheme = getStatusTheme();

  const imageUri = item.cover_image
    ? item.cover_image.startsWith('https')
      ? item.cover_image
      : `${GET_STORAGE_DATA}/${item.cover_image}`
    : 'https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg';

  const hostName = item.user_id?.user_name || 'Medical Contributor';

  const menuActions =
    item.status === 'review-pending'
      ? [
          {
            name: 'Self-Assign Podcast',
            action: () => {
              handleClick(item, 0, '');
              toggleMenu();
            },
            icon: 'hand-point-right',
            color: PRIMARY_COLOR,
          },
          {
            name: 'Listen & Review',
            action: () => {
              handleClick(item, 3, '');
              toggleMenu();
            },
            icon: 'eye',
            color: PRIMARY_COLOR,
          },
          {
            name: 'Discard Episode',
            action: () => {
              handleClick(item, 1, '');
              toggleMenu();
            },
            icon: 'times-circle',
            color: '#DC2626',
          },
        ]
      : [
          {
            name: 'Listen & Review',
            action: () => {
              handleClick(item, 3, '');
              toggleMenu();
            },
            icon: 'eye',
            color: PRIMARY_COLOR,
          },
          {
            name: 'Discard Episode',
            action: () => {
              handleClick(item, 1, '');
              toggleMenu();
            },
            icon: 'ban',
            color: '#DC2626',
          },
          {
            name: 'Unassign Yourself',
            action: () => {
              handleClick(item, 2, '');
              toggleMenu();
            },
            icon: 'minus-circle',
            color: '#059669',
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
        {/* Cover Image & Overlay */}
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" />

          {/* Clinical Status Chip on Image */}
          <View
            style={[
              styles.floatingStatusBadge,
              {
                backgroundColor: statusTheme.bg,
                borderColor: statusTheme.border,
              },
            ]}>
            <View
              style={[styles.statusDot, {backgroundColor: statusTheme.text}]}
            />
            <Text style={[styles.statusBadgeText, {color: statusTheme.text}]}>
              {item.status?.replace(/-/g, ' ').toUpperCase() || 'QUEUED'}
            </Text>
          </View>

          {/* Centered Clinical Play Pill */}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={26} color="#FFFFFF" style={{marginLeft: 3}} />
            </View>
          </View>

          {/* Three Dots Overflow */}
          {item.status !== StatusEnum.PUBLISHED && (
            <TouchableOpacity
              style={styles.menuIconContainer}
              onPress={toggleMenu}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Entypo name="dots-three-vertical" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Audio Duration Badge */}
          {item.duration ? (
            <View style={styles.durationBadge}>
              <Feather name="headphones" size={12} color="#FFFFFF" style={{marginRight: 4}} />
              <Text style={styles.durationText}>{msToTime(item.duration)}</Text>
            </View>
          ) : null}
        </View>

        {/* Content Section */}
        <View style={styles.textContainer}>
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Host & Meta */}
          <View style={styles.hostRow}>
            <View style={styles.hostAvatar}>
              <Text style={styles.hostAvatarText}>
                {hostName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.hostText} numberOfLines={1}>
              {hostName}
            </Text>
            {item.status === StatusEnum.PUBLISHED && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Feather name="eye" size={12} color={TEXT_MUTED} />
                <Text style={styles.statsText}>
                  {item?.viewUsers?.length || 0} listens
                </Text>
              </>
            )}
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Bottom Action Row */}
          <View style={styles.bottomRow}>
            <View style={styles.audioHint}>
              <Feather name="mic" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.audioHintText}>Medical Podcast</Text>
            </View>

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => handleClick(item, 3, '')}
              activeOpacity={0.85}>
              <Text style={styles.reviewButtonText}>Review Episode</Text>
              <AntDesign name="arrow-right" size={14} color="#FFFFFF" style={{marginLeft: 6}} />
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
    backgroundColor: CARD_BG,
    borderRadius: 20,
    marginVertical: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...CLINICAL_SHADOW,
    elevation: 3,
  },

  imageContainer: {
    position: 'relative',
    width: '100%',
    height: hp(20),
    backgroundColor: '#0F172A',
  },

  image: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },

  floatingStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  menuIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  textContainer: {
    padding: 16,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },

  tagChip: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },

  tagChipText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '600',
  },

  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },

  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  hostAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  hostAvatarText: {
    color: PRIMARY_DARK,
    fontSize: 11,
    fontWeight: '700',
  },

  hostText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    maxWidth: wp(45),
  },

  dotSeparator: {
    marginHorizontal: 6,
    color: TEXT_MUTED,
    fontSize: 12,
  },

  statsText: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginLeft: 4,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  audioHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  audioHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },

  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  floatingMenu: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 25,
  },
});
