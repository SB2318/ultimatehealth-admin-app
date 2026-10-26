import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Tabs} from 'react-native-collapsible-tab-view';
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
import {getFallbackArticles, getFallbackProgressArticles} from '../../helper/DemoData';
import {Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import EmptyState from '../../components/EmptyState';
import {useSelector} from 'react-redux';

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
  const {isGuest} = useSelector((state: any) => state.user);
  const [selectedCategory, setSelectedCategory] = useState<'Available' | 'Inprogress'>('Available');

  // Wrap with realistic clinical demo articles only in guest mode; real data when authenticated
  const effectiveAvailable = isGuest ? getFallbackArticles(availableArticle) : availableArticle;
  const effectiveInProgress = isGuest ? getFallbackProgressArticles(inProgressArticle) : inProgressArticle;

  const availableCount = effectiveAvailable.length;
  const inProgressCount = effectiveInProgress.length;

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
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
          size={18}
          color={PRIMARY_COLOR}
        />
        <Text style={styles.queueMetaText}>
          <Text style={styles.queueMetaCount}>
            {selectedCategory === 'Available' ? availableCount : inProgressCount}
          </Text>
          {selectedCategory === 'Available'
            ? ` article${availableCount === 1 ? '' : 's'} awaiting clinical moderation`
            : ` article${inProgressCount === 1 ? '' : 's'} currently under review`}
        </Text>
      </View>
    </View>
  );

  return (
    <Tabs.FlatList
      data={selectedCategory === 'Available' ? effectiveAvailable : effectiveInProgress}
      renderItem={renderItem}
      keyExtractor={item => item._id.toString()}
      ListHeaderComponent={renderHeader}
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
        <EmptyState
          icon={selectedCategory === 'Available' ? 'clipboard-check-outline' : 'file-document-edit-outline'}
          iconType="material"
          title={selectedCategory === 'Available' ? 'All Caught Up!' : 'No Articles in Progress'}
          subtitle={
            selectedCategory === 'Available'
              ? 'There are no pending articles in the review queue right now.'
              : 'Self-assign articles from the Available Queue to start reviewing.'
          }
        />
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
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingTop: 12,
    backgroundColor: SCREEN_BG,
  },

  segmentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
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
    paddingVertical: 9.5,
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
    gap: 7,
  },

  segmentLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 0.1,
  },

  segmentLabelActive: {
    color: TEXT_PRIMARY,
    fontWeight: '800',
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },

  badgeActive: {
    backgroundColor: '#E0F2FE',
  },

  badgeInactive: {
    backgroundColor: '#CBD5E1',
  },

  badgeText: {
    fontSize: 12.5,
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
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 10,
  },

  queueMetaText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },

  queueMetaCount: {
    fontSize: 17,
    fontWeight: '800',
    color: PRIMARY_COLOR,
  },

  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: hp(16),
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(8),
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
