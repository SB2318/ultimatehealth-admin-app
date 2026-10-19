import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import {fp, hp, wp} from '../helper/Metric';
import {ReviewCardProps} from '../type';
import moment from 'moment';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  STATUS_COLORS,
  CLINICAL_SHADOW,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_COLOR,
} from '../helper/Theme';
import {StatusEnum} from '../helper/Utils';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
import {Entypo, AntDesign, Feather, Ionicons} from '@expo/vector-icons';
import {GET_STORAGE_DATA} from '../helper/APIUtils';

const ReviewCard = ({
  item,
  onclick,
  isSelected,
  setSelectedCardId,
  onNavigate,
}: ReviewCardProps) => {
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

  // Status Theme Resolution
  const getStatusTheme = () => {
    switch (item?.status) {
      case StatusEnum.PUBLISHED:
        return STATUS_COLORS.approved;
      case StatusEnum.IN_PROGRESS:
        return STATUS_COLORS.in_progress;
      case StatusEnum.DISCARDED:
        return STATUS_COLORS.discarded;
      case StatusEnum.UNASSIGNED:
      default:
        return STATUS_COLORS.pending;
    }
  };

  const statusTheme = getStatusTheme();

  const menuStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{translateY: yValue.value}],
    opacity: width.value > 0 ? 1 : 0,
  }));

  const handleAnimation = () => {
    if (width.value === 0) {
      width.value = withTiming(260, {duration: 250});
      yValue.value = withTiming(4, {duration: 250});
      setSelectedCardId(item._id);
    } else {
      width.value = withTiming(0, {duration: 200});
      yValue.value = withTiming(70, {duration: 200});
      setSelectedCardId('');
    }
  };

  const unAssignActions = [
    {
      name: 'Self-Assign Article',
      action: () => {
        onclick(item, 0, '');
        handleAnimation();
      },
      icon: 'hand-point-right',
      color: PRIMARY_COLOR,
    },
    {
      name: 'Discard Article',
      action: () => {
        onclick(item, 1, '');
        handleAnimation();
      },
      icon: 'times-circle',
      color: '#DC2626',
    },
  ];

  const progressActions = [
    {
      name: 'Discard Article',
      action: () => {
        onclick(item, 1, '');
        handleAnimation();
      },
      icon: 'ban',
      color: '#DC2626',
    },
    {
      name: 'Unassign Yourself',
      action: () => {
        onclick(item, 2, '');
        handleAnimation();
      },
      icon: 'minus-circle',
      color: '#059669',
    },
  ];

  // Banner Image
  const bannerImage = item?.imageUtils?.[0]?.startsWith('http')
    ? item.imageUtils[0]
    : `${GET_STORAGE_DATA}/${item?.imageUtils?.[0] ?? ''}`;

  return (
    <Pressable
      onPress={() => {
        width.value = withTiming(0, {duration: 200});
        yValue.value = withTiming(70, {duration: 200});
        setSelectedCardId('');
        onNavigate(item);
      }}
      style={({pressed}) => [{opacity: pressed ? 0.96 : 1}]}>
      <View style={styles.cardContainer}>
        {isSelected && (
          <Animated.View style={[menuStyle, styles.floatingMenuContainer]}>
            <ArticleFloatingMenu
              items={
                item.status === StatusEnum.UNASSIGNED
                  ? unAssignActions
                  : progressActions
              }
              top={hp(1.5)}
              left={wp(2)}
            />
          </Animated.View>
        )}

        {/* Banner with Status & Overflow Action */}
        {bannerImage ? (
          <View style={styles.bannerContainer}>
            <Image
              source={{uri: bannerImage}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            {/* Status Pill on Top-Left */}
            <View
              style={[
                styles.floatingStatusBadge,
                {
                  backgroundColor: statusTheme.bg,
                  borderColor: statusTheme.border,
                },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: statusTheme.text},
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  {color: statusTheme.text},
                ]}>
                {item?.status ? item.status.toUpperCase() : 'QUEUED'}
              </Text>
            </View>

            {/* Menu Button Top-Right */}
            {item.status !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                style={styles.imageMoreButton}
                onPress={handleAnimation}
                activeOpacity={0.8}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Entypo name="dots-three-vertical" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        <View style={styles.contentContainer}>
          {/* Tag Chips */}
          {item?.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map((tag: any, idx: number) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag.name}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <View style={styles.tagMoreChip}>
                  <Text style={styles.tagMoreChipText}>+{item.tags.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item?.title}
          </Text>

          {/* Author & Timestamp Bar */}
          <View style={styles.authorRow}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {item?.authorName ? item.authorName.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <Text style={styles.authorName} numberOfLines={1}>
              {item?.authorName || 'Medical Contributor'}
            </Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Feather name="clock" size={12} color={TEXT_MUTED} />
            <Text style={styles.dateText}>
              {moment(new Date(item?.lastUpdated)).format('MMM DD, YYYY')}
            </Text>
          </View>

          {/* Description Preview */}
          {item?.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Card Footer Actions */}
          <View style={styles.footerRow}>
            {/* Left status badge if banner wasn't shown */}
            {!bannerImage && (
              <View
                style={[
                  styles.statusBadgeInline,
                  {
                    backgroundColor: statusTheme.bg,
                    borderColor: statusTheme.border,
                  },
                ]}>
                <View
                  style={[
                    styles.statusDot,
                    {backgroundColor: statusTheme.text},
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {color: statusTheme.text},
                  ]}>
                  {item?.status ? item.status.toUpperCase() : 'QUEUED'}
                </Text>
              </View>
            )}

            <View style={{flex: 1}} />

            {/* Quick Action Button */}
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => onNavigate(item)}
              activeOpacity={0.85}>
              <Text style={styles.reviewButtonText}>Review Article</Text>
              <AntDesign
                name="arrow-right"
                size={14}
                color="#FFFFFF"
                style={{marginLeft: 6}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...CLINICAL_SHADOW,
    elevation: 3,
  },

  floatingMenuContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
  },

  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: hp(19),
    backgroundColor: '#F1F5F9',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
  },

  floatingStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 5,
  },

  statusBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
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

  imageMoreButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentContainer: {
    padding: 16,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
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

  tagMoreChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  tagMoreChipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },

  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },

  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },

  avatarMiniText: {
    color: PRIMARY_DARK,
    fontSize: 11,
    fontWeight: '700',
  },

  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    maxWidth: wp(42),
  },

  dotSeparator: {
    marginHorizontal: 6,
    color: TEXT_MUTED,
    fontSize: 12,
  },

  dateText: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginLeft: 4,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});