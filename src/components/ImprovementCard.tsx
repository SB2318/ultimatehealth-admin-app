import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Entypo, Feather, Ionicons} from '@expo/vector-icons';

import ArticleFloatingMenu from './ArticleFloatingMenu';
import {ImprovementCardProps} from '../type';
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
import {StatusEnum} from '../helper/Utils';
import {hp, wp} from '../helper/Metric';

const ImprovementCard = ({
  item,
  onclick,
  isSelected,
  setSelectedCardId,
  onNavigate,
}: ImprovementCardProps) => {
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

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
      name: 'Pick Revision',
      action: () => {
        onclick(item, 0, '');
        handleAnimation();
      },
      icon: 'hand-point-right',
      color: PRIMARY_COLOR,
    },
    {
      name: 'Discard Revision',
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
      name: 'Discard Revision',
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

  // Clean HTML from edit_reason for a fast, beautiful plain-text preview
  const rawReason = item?.edit_reason || '';
  const cleanReason = rawReason
    ? rawReason.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : 'No revision notes provided';

  const articleTitle = item?.article?.title || 'Clinical Article Revision';
  const authorName = (item?.article as any)?.authorName || 'Medical Contributor';
  const updatedDate = item?.last_updated || item?.created_at || new Date();

  const statusStr = (item?.status || '').toLowerCase();
  const isAvailable =
    statusStr.includes('unassign') ||
    statusStr.includes('pending') ||
    (!item?.reviewer_id && !statusStr.includes('progress') && !statusStr.includes('publish') && !statusStr.includes('discard'));

  return (
    <Pressable
      onPress={() => {
        if (width.value > 0) {
          width.value = withTiming(0, {duration: 180});
          setSelectedCardId('');
        }
        onNavigate(item);
      }}
      style={({pressed}) => [{opacity: pressed ? 0.96 : 1}]}>
      <View style={styles.cardContainer}>
        {/* Floating Actions Menu */}
        {isSelected && (
          <Animated.View style={[menuStyle, styles.floatingMenu]}>
            <ArticleFloatingMenu
              items={isAvailable ? unAssignActions : progressActions}
              top={hp(1)}
              left={wp(2)}
              arrowPosition={0.88}
            />
          </Animated.View>
        )}

        <View style={styles.contentContainer}>
          {/* Header Row: Status Chip & Three Dots */}
          <View style={styles.headerRow}>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: statusTheme.bg, borderColor: statusTheme.border},
              ]}>
              <View
                style={[styles.statusDot, {backgroundColor: statusTheme.text}]}
              />
              <Text style={[styles.statusBadgeText, {color: statusTheme.text}]}>
                {item?.status ? item.status.replace(/-/g, ' ').toUpperCase() : 'QUEUED'}
              </Text>
            </View>

            {item.status !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={handleAnimation}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Entypo name="dots-three-vertical" size={16} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>

          {/* Tags Row */}
          {item?.article?.tags && item.article.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.article.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Article Title */}
          <Text style={styles.title} numberOfLines={2}>
            {articleTitle}
          </Text>

          {/* Request Reason Clinical Callout Box */}
          <View style={styles.reasonBox}>
            <View style={styles.reasonHeaderRow}>
              <Feather name="edit-3" size={13} color={PRIMARY_COLOR} />
              <Text style={styles.reasonLabel}>REQUESTED CHANGES</Text>
            </View>
            <Text style={styles.reasonText} numberOfLines={2}>
              {cleanReason}
            </Text>
          </View>

          {/* Author & Timestamp Bar */}
          <View style={styles.metaRow}>
            <View style={styles.authorGroup}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.authorName} numberOfLines={1}>
                {authorName}
              </Text>
            </View>

            <View style={styles.dateGroup}>
              <Feather name="clock" size={12} color={TEXT_MUTED} />
              <Text style={styles.dateText}>
                {moment(new Date(updatedDate)).format('MMM DD, YYYY')}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Footer Action Row */}
          <View style={styles.footerRow}>
            <View style={styles.badgeHint}>
              <Ionicons name="git-branch-outline" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.badgeHintText}>Revision Request</Text>
            </View>

            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => onNavigate(item)}
              activeOpacity={0.85}>
              <Text style={styles.reviewButtonText}>
                {item.status === StatusEnum.UNASSIGNED ? 'Review Request' : 'Continue Review'}
              </Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" style={{marginLeft: 4}} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default ImprovementCard;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: 'visible',
    position: 'relative',
    ...CLINICAL_SHADOW,
    elevation: 3,
  },

  contentContainer: {
    padding: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },

  tagChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  tagChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: PRIMARY_DARK,
  },

  title: {
    fontSize: 16.5,
    fontWeight: '700',
    lineHeight: 22,
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: -0.2,
  },

  reasonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: PRIMARY_COLOR,
    marginBottom: 12,
  },

  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },

  reasonLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    letterSpacing: 0.5,
  },

  reasonText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '60%',
  },

  avatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarMiniText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },

  authorName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },

  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  dateText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 10,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badgeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  badgeHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },

  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9,
  },

  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  floatingMenu: {
    position: 'absolute',
    top: 40,
    right: 14,
    zIndex: 9999,
  },
});
