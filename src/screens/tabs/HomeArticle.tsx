import React, {useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {hp, wp} from '../../helper/Metric';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  SCREEN_BG,
  CARD_BG,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  CLINICAL_SHADOW_SUBTLE,
} from '../../helper/Theme';
import {ArticleData} from '../../type';
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';

type Props = {
  inProgressArticle: ArticleData[];
  availableArticle: ArticleData[];
  refreshing: boolean;
  onRefresh: (num: number) => void;
  renderItem: ({item}: {item: ArticleData}) => React.JSX.Element;
  onAvailablePageEnd: () => void;
  onProgressPageEnd: () => void;
};

export default function HomeArticle({
  inProgressArticle = [],
  availableArticle = [],
  refreshing,
  onRefresh,
  renderItem,
  onAvailablePageEnd,
  onProgressPageEnd,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<'Available' | 'Inprogress'>('Available');

  const availableCount = availableArticle?.length || 0;
  const inProgressCount = inProgressArticle?.length || 0;

  return (
    <View style={styles.outerContainer}>
      {/* Modern Clinical Segmented Pill Controller */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedCategory === 'Available' && styles.segmentButtonActive,
            ]}
            onPress={() => setSelectedCategory('Available')}
            activeOpacity={0.8}>
            <View style={styles.segmentContent}>
              <Text
                style={[
                  styles.segmentLabel,
                  selectedCategory === 'Available' && styles.segmentLabelActive,
                ]}>
                Available Queue
              </Text>
              <View
                style={[
                  styles.badge,
                  selectedCategory === 'Available'
                    ? styles.badgeActive
                    : styles.badgeInactive,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    selectedCategory === 'Available'
                      ? styles.badgeTextActive
                      : styles.badgeTextInactive,
                  ]}>
                  {availableCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentButton,
              selectedCategory === 'Inprogress' && styles.segmentButtonActive,
            ]}
            onPress={() => setSelectedCategory('Inprogress')}
            activeOpacity={0.8}>
            <View style={styles.segmentContent}>
              <Text
                style={[
                  styles.segmentLabel,
                  selectedCategory === 'Inprogress' && styles.segmentLabelActive,
                ]}>
                In Progress
              </Text>
              <View
                style={[
                  styles.badge,
                  selectedCategory === 'Inprogress'
                    ? styles.badgeActive
                    : styles.badgeInactive,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    selectedCategory === 'Inprogress'
                      ? styles.badgeTextActive
                      : styles.badgeTextInactive,
                  ]}>
                  {inProgressCount}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Moderation Queue Subtitle Bar */}
      <View style={styles.queueMetaBar}>
        <Feather
          name={selectedCategory === 'Available' ? 'inbox' : 'activity'}
          size={14}
          color={PRIMARY_COLOR}
        />
        <Text style={styles.queueMetaText}>
          {selectedCategory === 'Available'
            ? `${availableCount} article${availableCount === 1 ? '' : 's'} awaiting clinical moderation`
            : `${inProgressCount} article${inProgressCount === 1 ? '' : 's'} currently under review`}
        </Text>
      </View>

      {/* Articles List */}
      <View style={styles.listContainer}>
        <FlatList
          data={selectedCategory === 'Available' ? availableArticle : inProgressArticle}
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.flatListContent}
          refreshing={refreshing}
          onRefresh={() => {
            if (selectedCategory === 'Available') {
              onRefresh(1);
            } else {
              onRefresh(2);
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialCommunityIcons
                  name="clipboard-check-outline"
                  size={42}
                  color={PRIMARY_COLOR}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {selectedCategory === 'Available'
                  ? 'All Caught Up!'
                  : 'No Articles in Progress'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory === 'Available'
                  ? 'There are no pending articles in the review queue right now.'
                  : 'Self-assign articles from the Available Queue to start reviewing.'}
              </Text>
            </View>
          }
          onEndReached={() => {
            if (selectedCategory === 'Available') {
              onAvailablePageEnd();
            } else {
              onProgressPageEnd();
            }
          }}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: SCREEN_BG,
    paddingTop: 8,
  },

  segmentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
  },

  segmentButton: {
    flex: 1,
    borderRadius: 11,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentButtonActive: {
    backgroundColor: CARD_BG,
    ...CLINICAL_SHADOW_SUBTLE,
  },

  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },

  segmentLabelActive: {
    color: TEXT_PRIMARY,
    fontWeight: '700',
  },

  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },

  badgeActive: {
    backgroundColor: '#E0F2FE',
  },

  badgeInactive: {
    backgroundColor: '#CBD5E1',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  badgeTextActive: {
    color: PRIMARY_DARK,
  },

  badgeTextInactive: {
    color: '#475569',
  },

  queueMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  queueMetaText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },

  listContainer: {
    flex: 1,
    marginBottom: hp(10), // Padding to avoid overlap with floating tab bar
  },

  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(10),
    paddingHorizontal: 28,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
});
