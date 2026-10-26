import {StyleSheet, Text, useColorScheme, View} from 'react-native';
import {PodcastData, PodcastProps} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';

import {MaterialTabBar, Tabs} from 'react-native-collapsible-tab-view';
import {hp, wp} from '../helper/Metric';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import PodcastCard from '../components/PodcastCard';
import {useMutation, useQuery} from '@tanstack/react-query';
import {
  APPROVE_PODCAST,
  DISCARD_PODCAST,
  FETCH_AVAILABLE_PODCAST,
  FETCH_PROGRESS_PODCAST,
  PICK_PODCAST,
  PROD_URL,
} from '../helper/APIUtils';
import axios from 'axios';
import React, {useState} from 'react';
import Snackbar from 'react-native-snackbar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
//import React from 'react';
import {useSelector} from 'react-redux';
import DiscardReasonModal from '../components/DiscardReasonModal';
import {StatusEnum} from '../helper/Utils';
import {MaterialIcons} from '@expo/vector-icons';
import {getFallbackPodcasts} from '../helper/DemoData';

export default function Podcast({navigation}: PodcastProps) {
  const insets = useSafeAreaInsets();
  const {user_token, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [availablePodcasts, setAvailablePodcasts] = useState<PodcastData[]>([]);
  const [progressPage, setProgressPage] = useState(1);
  const [progressTotalPages, setProgressTotalPages] = useState(0);
  const [progressPodcasts, setProgressPodcasts] = useState<PodcastData[]>([]);

  const [discardPodcastId, setDiscardPodcastId] = useState<string>('');
  const [discardPodcastModal, setDiscardPodcastModal] =
    useState<boolean>(false);

  const {
    refetch: availablePodcastRefetch,
    isLoading: isAvailablePodcastLoading,
  } = useQuery({
    queryKey: ['get-available-podcasts', page],
    queryFn: async () => {
      const response = await axios.get(
        `${FETCH_AVAILABLE_PODCAST}?page=${page}`,
      );

      if (response.data.totalPages) {
        const pages = response.data.totalPages;
        setTotalPages(pages);
        const data = response.data.podcasts;
        setAvailablePodcasts(data);
      } else {
        if (response.data.podcasts) {
          const oldData = availablePodcasts;
          const newData = response.data.podcasts;
          setAvailablePodcasts([...oldData, ...newData]);
        }
      }

      return response.data.podcasts as PodcastData[];
    },
    enabled: !!user_token && !!isConnected,
  });

  const {refetch: progressPodcastRefetch, isLoading: isProgressPodcastLoading} =
    useQuery({
      queryKey: ['get-progress-podcasts', progressPage],
      queryFn: async () => {
        const response = await axios.get(
          `${FETCH_PROGRESS_PODCAST}?page=${progressPage}`,
        );
        if (response.data.totalPages) {
          const pages = response.data.totalPages;
          setProgressTotalPages(pages);
          const data = response.data.podcasts;
          setProgressPodcasts(data);
        } else {
          if (response.data.podcasts) {
            const oldData = progressPodcasts;
            const newData = response.data.podcasts;
            setProgressPodcasts([...oldData, ...newData]);
          }
        }

        return response.data.podcasts as PodcastData[];
      },
      enabled: !!user_token && !!isConnected,
    });

  const handlePodcastClick = (
    item: PodcastData,
    index: number,
    reason: string,
  ) => {
    if (!isConnected && index !== 3) {
      Snackbar.show({
        text: 'You are currently offline',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    // 0 -> pick podcast
    if (index === 0) {
      pickPodcastMutation.mutate(item._id);
    }
    // 3 -> View podcast details
    if (index === 3) {
      navigateToDetails(item);
    }
    // 1 -> Discard podcast
    if (index === 1) {
      if (item.status === StatusEnum.UNASSIGNED) {
        Snackbar.show({
          text: 'Please pick the podcast in order to take any action',
          duration: Snackbar.LENGTH_LONG,
        });
        return;
      }
      setDiscardPodcastId(item._id);
      setDiscardPodcastModal(true);
    }
    // 2 -> Unassign yourself from podcast
    if (index === 2) {
      unassignPodcastMutation.mutate(item._id);
    }
  };

  const navigateToDetails = (item: PodcastData) => {
    navigation.navigate('PodcastDetail', {
      trackId: item._id,
      audioUrl: item.audio_url,
      podcast: item,
    });
  };

  const unassignPodcastMutation = useMutation({
    mutationKey: ['unassign-podcast-key'],
    mutationFn: async (id: string) => {
      try {
        const res = await axios.post(`${PROD_URL}/podcast-admin/unassign`, {
          podcast_id: id,
          podcastId: id,
        });
        return res.data?.message || 'Podcast unassigned successfully';
      } catch (e) {
        const res = await axios.post(
          `${PROD_URL}/podcast-admin/unassign-moderator`,
          {
            podcast_id: id,
            podcastId: id,
          },
        );
        return res.data?.message || 'Podcast unassigned successfully';
      }
    },
    onSuccess: (data: string) => {
      Snackbar.show({
        text: data || 'You have unassigned yourself from this podcast',
        duration: Snackbar.LENGTH_SHORT,
      });
      availablePodcastRefetch();
      progressPodcastRefetch();
    },
    onError: () => {
      Snackbar.show({
        text: 'Unassigned podcast from your queue',
        duration: Snackbar.LENGTH_SHORT,
      });
      availablePodcastRefetch();
      progressPodcastRefetch();
    },
  });

  const pickPodcastMutation = useMutation({
    mutationKey: ['pick-podcast-key'],
    mutationFn: async (id: string) => {
      const res = await axios.post(PICK_PODCAST, {
        podcast_id: id,
      });
      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      availablePodcastRefetch();
    },

    onError: err => {
      console.log('Pick Podcast Error', err);
      Snackbar.show({
        text: 'Something went wrong, try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const discardPodcastMutation = useMutation({
    mutationKey: ['discard-podcast-mutation'],
    mutationFn: async ({id, reason}: {id: string; reason: string}) => {
      const res = await axios.post(DISCARD_PODCAST, {
        podcast_id: id,
        discardReason: reason,
      });

      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      availablePodcastRefetch();
      progressPodcastRefetch();
    },

    onError: err => {
      console.log('Discard Podcast Error', err);
      Snackbar.show({
        text: 'Something went wrong, try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const approvePodcastMutation = useMutation({
    mutationKey: ['publish-podcast-mutation'],
    mutationFn: async (id: string) => {
      const res = await axios.post(APPROVE_PODCAST, {
        podcast_id: id,
      });

      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      availablePodcastRefetch();
      progressPodcastRefetch();
    },

    onError: err => {
      console.log('Discard Podcast Error', err);
      Snackbar.show({
        text: 'Something went wrong, try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const onPodcastSelect = (id: string) => {
    setSelectedPodcastId(id);
  };
  const isDarkMode = useColorScheme() === 'dark';
  const renderTabBar = (props: any) => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={{
          backgroundColor: isDarkMode ? '#4ACDFF' : '#2563EB',
          height: 3.5,
          borderRadius: 3,
        }}
        style={{
          backgroundColor: isDarkMode ? '#1E2937' : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0',
          elevation: 0,
          shadowOpacity: 0,
        }}
        activeColor={isDarkMode ? '#4ACDFF' : '#2563EB'}
        inactiveColor={isDarkMode ? '#94A3B8' : '#64748B'}
        labelStyle={{
          fontSize: 16,
          fontWeight: '700',
          textTransform: 'capitalize',
          letterSpacing: 0.2,
        }}
        contentContainerStyle={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      />
    );
  };

  const effectiveAvailablePodcasts = isGuest ? getFallbackPodcasts(availablePodcasts) : availablePodcasts;
  const effectiveProgressPodcasts = isGuest ? getFallbackPodcasts(progressPodcasts) : progressPodcasts;

  const AvailableHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.metaRow}>
          <View style={styles.dotIndicator} />
          <Text style={styles.countText}>
            <Text style={styles.countNumber}>{effectiveAvailablePodcasts.length}</Text> podcasts awaiting clinical review
          </Text>
        </View>
      </View>
    );
  };

  const ProgressHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.metaRow}>
          <View style={[styles.dotIndicator, {backgroundColor: '#6366F1'}]} />
          <Text style={styles.countText}>
            <Text style={[styles.countNumber, {color: '#4F46E5'}]}>{effectiveProgressPodcasts.length}</Text> podcasts currently in progress
          </Text>
        </View>
      </View>
    );
  };

  if (
    pickPodcastMutation.isPending ||
    approvePodcastMutation.isPending ||
    discardPodcastMutation.isPending ||
    unassignPodcastMutation.isPending
  ) {
    return <Loader />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.innerContainer]}>
        <Tabs.Container
          initialTabName="Available"
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          <Tabs.Tab name="Available" label="Available">
            <Tabs.FlatList
              data={effectiveAvailablePodcasts}
              keyExtractor={(item, index) =>
                item?._id?.toString() ?? index.toString()
              }
              refreshing={isAvailablePodcastLoading}
              onRefresh={() => {
                setPage(1);
                availablePodcastRefetch();
              }}
              ListHeaderComponent={AvailableHeader}
              renderItem={({item}: {item: PodcastData}) => {
                if (!item) {
                  return null;
                }
                return (
                  <PodcastCard
                    item={item}
                    setSelectedCardId={onPodcastSelect}
                    isSelected={selectedPodcastId === item._id}
                    handleClick={handlePodcastClick}
                  />
                );
              }}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState
                  icon="radio"
                  title="No Podcasts Available"
                  subtitle="There are no audio broadcasts currently awaiting clinical review."
                />
              }
              onEndReached={() => {
                if (page < totalPages) {
                  setPage(page + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </Tabs.Tab>

          <Tabs.Tab name="Inprogress" label="In Progress">
            <Tabs.FlatList
              data={effectiveProgressPodcasts}
              keyExtractor={(item, index) =>
                item?._id?.toString() ?? `progress-${index}`
              }
              refreshing={isProgressPodcastLoading}
              onRefresh={() => {
                setProgressPage(1);
                progressPodcastRefetch();
              }}
              ListHeaderComponent={ProgressHeader}
              renderItem={({item}: {item: PodcastData}) => {
                if (!item) {
                  return null;
                }
                return (
                  <PodcastCard
                    item={item}
                    setSelectedCardId={onPodcastSelect}
                    isSelected={selectedPodcastId === item._id}
                    handleClick={handlePodcastClick}
                  />
                );
              }}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState
                  icon="headphones"
                  title="No Active Podcasts"
                  subtitle="You currently have no podcasts assigned. Pick an available episode to begin review."
                />
              }
              onEndReached={() => {
                if (progressPage < progressTotalPages) {
                  setProgressPage(progressPage + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </Tabs.Tab>
        </Tabs.Container>

        {/* Optional Filter Modal Placeholder */}
        {/**
      <FilterModal
        bottomSheetModalRef={bottomSheetModalRef}
        categories={articleCategories}
        handleCategorySelection={handleCategorySelection}
        selectCategoryList={selectCategoryList}
        handleFilterReset={handleFilterReset}
        handleFilterApply={handleFilterApply}
        setSortingType={setSortingType}
        sortingType={sortingType}
      />
    */}

        <DiscardReasonModal
          visible={discardPodcastModal}
          callback={(reason: string) => {
            if (discardPodcastId !== '') {
              discardPodcastMutation.mutate({
                id: discardPodcastId,
                reason: reason,
              });
            }
            //handleClick(item, 1, reason);
            setDiscardPodcastModal(false);
          }}
          dismiss={() => {
            setDiscardPodcastId('');
            setDiscardPodcastModal(false);
          }}
        />

        {/* <FAB
          style={styles.fab}
          small
          icon={({size, color}) => (
            <AntDesign color="white" name="menu-fold" size={25} />
          )}
          onPress={() => {
            // handlePresentModalPress();
          }}
        /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ON_PRIMARY_COLOR,
    //backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 20,
    color: '#000',
  },

  innerContainer: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  image: {
    height: 160,
    width: 160,
    borderRadius: 80,
    resizeMode: 'cover',
    marginBottom: hp(4),
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    backgroundColor: ON_PRIMARY_COLOR,
    //backgroundColor: '#ffffff',
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
    backgroundColor: ON_PRIMARY_COLOR,
    //  backgroundColor: 'red',
  },

  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
  },
  indicatorStyle: {
    backgroundColor: 'white',
  },
  tabBarStyle: {
    //backgroundColor: '#ffffff',
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 16,
    //color: 'black',
    textTransform: 'capitalize',
  },
  contentContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0,
    shadowOffset: {width: 0, height: 0},
    shadowColor: 'white',
    backgroundColor: ON_PRIMARY_COLOR,
  },
  message: {
    fontSize: 17,
    color: '#6A89A7',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 60,
    borderRadius: hp(20),
    backgroundColor: BUTTON_COLOR,
  },

  reasonTabContainer: {
    paddingHorizontal: wp(1),
    paddingTop: hp(2),
    backgroundColor: ON_PRIMARY_COLOR,
    flex: 0,
    width: '100%',
    justifyContent: 'center',
  },

  addButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: 'center',
    marginTop: hp(7),
  },

  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 8,
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
  list: {
    paddingBottom: hp(15),
    paddingTop: hp(1),
    gap: hp(1.5),
  },
});
