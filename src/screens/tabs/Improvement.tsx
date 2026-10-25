import DiscardReasonModal from '../../components/DiscardReasonModal';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Tabs} from 'react-native-collapsible-tab-view';
import Snackbar from 'react-native-snackbar';
import {useSelector} from 'react-redux';
import ImprovementCard from '../../components/ImprovementCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import {
  DISCARD_IMPROVEMENT,
  GET_AVAILABLE_IMPROVEMENTS,
  GET_PROGRESS_IMPROVEMENTS,
  PICK_IMPROVEMENT,
  UNASSIGN_IMPROVEMENT,
} from '../../helper/APIUtils';
import {hp, wp} from '../../helper/Metric';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {EditRequest} from '../../type';
import {getFallbackImprovements} from '../../helper/DemoData';
import { Fontisto } from '@expo/vector-icons';

export default function Imrovement({
  handleNav,
}: {
  handleNav: (
    requestId: string,
    authorId: string,
    destination: string,
    recordId: string,
    articleRecordId: string,
  ) => void;
}) {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [discardReqId, setDiscardReId] = useState<string>('');
  const [discardReqModal, setDiscardReqModal] = useState<boolean>(false);
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [selectedCat, setSelectedCat] = useState<string>('Available');
  const categories = ['Available', 'Inprogress'];

  const [availablePage, setAvailablePage] = useState(1);
  const [totalAvailPage, setTotalAvailPage] = useState(0);
  const [availableImprovements, setAvailableImprovements] = useState<
    EditRequest[]
  >([]);

  const [progressPage, setProgressPage] = useState(1);
  const [totalProgressPage, setTotalProgressPage] = useState(0);
  const [progressImprovements, setProgressImprovements] = useState<
    EditRequest[]
  >([]);

  const {
    refetch: availableImprovementRefetch,
    isLoading: isAvailableImprovementLoading,
  } = useQuery({
    queryKey: ['get-available-improvements', availablePage],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_AVAILABLE_IMPROVEMENTS}?page=${availablePage}`,
      );

      console.log('response', response.data);
      if (Number(availablePage) === 1) {
        if (response.data.totalPages) {
          let d = response.data.totalPages;
          setTotalAvailPage(d);
        }
        if (response.data.articles) {
          setAvailableImprovements(response.data.articles);
        }
      } else {
        if (response.data.articles) {
          const oldData = availableImprovements;
          const newData = response.data.articles as EditRequest[];
          setAvailableImprovements([...oldData, ...newData]);
        }
      }
      return response.data.articles as EditRequest[];
    },
    enabled: !!isConnected && !!user_token,
  });

  const {
    refetch: refetchProgressImprovements,
    isLoading: isProgressImprovementLoading,
  } = useQuery({
    queryKey: ['get-progress-improvements', progressPage],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_PROGRESS_IMPROVEMENTS}?page=${progressPage}`,
      );

      if (Number(progressPage) === 1) {
        if (response.data.totalPages) {
          let d = response.data.totalPages;
          setTotalProgressPage(d);
        }
        if (response.data.articles) {
          setProgressImprovements(response.data.articles);
        }
      } else {
        if (response.data.articles) {
          const oldData = progressImprovements;
          const newData = response.data.articles as EditRequest[];
          setProgressImprovements([...oldData, ...newData]);
        }
      }

      return response.data.articles as EditRequest[];
    },
    enabled: !!progressPage && !!isConnected && !!user_token,
  });

  const onRefresh = () => {
    setRefreshing(true);
    if (selectedCat === categories[0]) {
      setAvailablePage(1);
      availableImprovementRefetch();
    } else {
      setProgressPage(1);
      refetchProgressImprovements();
    }
    setRefreshing(false);
  };

  const pickImprovementMutation = useMutation({
    mutationKey: ['pick-improvement'],
    mutationFn: async ({
      requestId,
      reviewerId,
    }: {
      requestId: string;
      reviewerId: string;
    }) => {
      const res = await axios.post(PICK_IMPROVEMENT, {
        requestId: requestId,
        reviewerId: reviewerId,
      });

      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      onRefresh();
    },
    onError: err => {
      console.log(err);
      Alert.alert('Try again!');
    },
  });

  const unassignFromImprovementMutation = useMutation({
    mutationKey: ['unassign-improvement'],

    mutationFn: async ({requestId}: {requestId: string}) => {
      const res = await axios.post(UNASSIGN_IMPROVEMENT, {
        requestId: requestId,
      });

      return res.data.message as string;
    },

    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      onRefresh();
    },

    onError: err => {
      console.log(err);
      Alert.alert('Try again');
    },
  });

  const discardImprovementMutation = useMutation({
    mutationKey: ['discard-improvement'],
    mutationFn: async ({
      requestId,
      discardReason,
    }: {
      requestId: string;
      discardReason: string;
    }) => {
      const res = await axios.post(DISCARD_IMPROVEMENT, {
        requestId: requestId,
        discardReason: discardReason,
      });

      return res.data.message as string;
    },

    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      onRefresh();
    },

    onError: err => {
      console.log(err);
      Alert.alert('Try again');
    },
  });

  const renderItem = useCallback(
    ({item}: {item: EditRequest}) => {
      return (
        <ImprovementCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          //navigation={navigation}
          onclick={(item: EditRequest, index: number, reason: string) => {
            if (!isConnected) {
              Snackbar.show({
                text: 'You are currently offline',
                duration: Snackbar.LENGTH_SHORT,
              });
              return;
            }
            if (index === 0) {
              // Pick article
              pickImprovementMutation.mutate({
                requestId: item._id,
                reviewerId: user_id,
              });
            } else if (index === 2) {
              // unassign yourself
              unassignFromImprovementMutation.mutate({
                requestId: item._id,
              });
            } else {
              // Display discard reason or screen
              // discardImprovementMutation.mutate({
              //   requestId: item._id,
              //   discardReason: reason,
              // });
              setDiscardReId(item._id);
              setDiscardReqModal(false);
            }
          }}
          onNavigate={item => {
            // navigation.navigate('ArticleReviewScreen', {
            //  articleId: Number(item._id),
            //  authorId: item.authorId,
            //  destination: item.status,
            //});
            handleNav(
              item._id,
              item.article.authorId,
              item.status,
              item.pb_recordId,
              item.article_recordId,
            );
          }}
        />
      );
    },
    [
      handleNav,
      pickImprovementMutation,
      selectedCardId,
      unassignFromImprovementMutation,
      user_id,
    ],
  );

  if (
    isAvailableImprovementLoading ||
    isProgressImprovementLoading ||
    pickImprovementMutation.isPending ||
    unassignFromImprovementMutation.isPending ||
    discardImprovementMutation.isPending
  ) {
    return <Loader />;
  }

  const activeCount =
    selectedCat === 'Available'
      ? getFallbackImprovements(availableImprovements).length
      : getFallbackImprovements(progressImprovements).length;

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.segmentWrapper}>
        <View style={styles.segmentContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.segmentButton,
                selectedCat === item && styles.segmentButtonActive,
              ]}
              onPress={() => setSelectedCat(item)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.segmentLabel,
                  selectedCat === item && styles.segmentLabelActive,
                ]}>
                {item === 'Available' ? 'Available Revisions' : 'In Progress'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.dotIndicator} />
        <Text style={styles.countText}>
          <Text style={styles.countNumber}>{activeCount}</Text>{' '}
          {selectedCat === 'Available'
            ? 'revisions awaiting clinical moderation'
            : 'revisions currently in review'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: ON_PRIMARY_COLOR}}>
      <Tabs.FlatList
        data={
          selectedCat === categories[0]
            ? getFallbackImprovements(availableImprovements)
            : getFallbackImprovements(progressImprovements)
        }
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.flatListContentContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="file-text"
            title="No Revisions Found"
            subtitle="All revision requests have been moderated or there are no pending submissions in this queue."
          />
        }
        onEndReached={() => {
          if (selectedCat === categories[0]) {
            if (availablePage < totalAvailPage) {
              setAvailablePage(prev => prev + 1);
            }
          } else if (selectedCat === categories[1]) {
            if (progressPage < totalProgressPage) {
              setProgressPage(prev => prev + 1);
            }
          }
        }}
        onEndReachedThreshold={0.5}
      />

      <DiscardReasonModal
        visible={discardReqModal}
        callback={(reason: string) => {
          console.log('discard modal click-', discardReqModal);
          if (discardReqId !== '') {
            discardImprovementMutation.mutate({
              requestId: discardReqId,
              discardReason: reason,
            });
          } else {
            Snackbar.show({
              text: 'Improvement id not found, please try again',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
        }}
        dismiss={() => {
          setDiscardReId('');
          setDiscardReqModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  segmentWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 6,
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.1,
  },
  segmentLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 4,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9',
  },
  countText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  countNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0284C7',
  },
  flatListContentContainer: {
    paddingBottom: hp(16),
    backgroundColor: ON_PRIMARY_COLOR,
  },

  image: {
    height: 190,
    width: 190,
    resizeMode: 'cover',
    marginTop: hp(10),
    marginBottom: hp(4),
  },

  message: {
    fontSize: 17,
    color: '#6A89A7',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: hp(2),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: hp(20),
  },
});
