import {Image, StyleSheet, Text, View} from 'react-native';
import {PodcastData, PodcastProps} from '../type';
import {BUTTON_COLOR} from '../helper/Theme';
import {FAB} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {MaterialTabBar, Tabs} from 'react-native-collapsible-tab-view';
import {hp, wp} from '../helper/Metric';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PodcastCard from '../components/PodcastCard';
import {useMutation, useQuery} from '@tanstack/react-query';
import {
  APPROVE_PODCAST,
  DISCARD_PODCAST,
  FETCH_AVAILABLE_PODCAST,
  FETCH_PROGRESS_PODCAST,
  PICK_PODCAST,
} from '../helper/APIUtils';
import axios from 'axios';
import {useState} from 'react';
import Snackbar from 'react-native-snackbar';
import Loader from '../components/Loader';

export default function Podcast({navigation}: PodcastProps) {
  const insets = useSafeAreaInsets();
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>('');

  const {
    data: availablePodcasts,
    refetch: availablePodcastRefetch,
    isLoading: isAvailablePodcastLoading,
  } = useQuery({
    queryKey: ['get-available-podcasts'],
    queryFn: async () => {
      const response = await axios.get(`${FETCH_AVAILABLE_PODCAST}`);
      return response.data as PodcastData[];
    },
  });

  const {
    data: progressPodcasts,
    refetch: progressPodcastRefetch,
    isLoading: isProgressPodcastLoading,
  } = useQuery({
    queryKey: ['get-progress-podcasts'],
    queryFn: async () => {
      const response = await axios.get(`${FETCH_PROGRESS_PODCAST}`);
      return response.data as PodcastData[];
    },
  });

  const handlePodcastClick = (
    item: PodcastData,
    index: number,
    reason: string,
  ) => {
    // 0 -> pick podcast
    if (index === 0) {
      pickPodcastMutation.mutate(item._id);
    }
    // 3 -> View podcast details
    if(index === 3){
      navigateToDetails(item._id);
    }
    // 1 -> Discard podcast
    if (index === 1) {
      discardPodcastMutation.mutate({
        id: item._id,
        reason: reason,
      });
    }
    // 2 -> Approve podcast
    if (index === 2) {
      approvePodcastMutation.mutate(item._id);
    }
  };

  const navigateToDetails = (id: string) =>{
    navigation.navigate('PodcastDetail', {
      trackId: id,
    });
  }

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

  const renderTabBar = props => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={styles.indicatorStyle}
        style={styles.tabBarStyle}
        activeColor={BUTTON_COLOR}
        inactiveColor="#9098A3"
        labelStyle={styles.labelStyle}
        contentContainerStyle={styles.contentContainerStyle}
      />
    );
  };

  if (
    pickPodcastMutation.isPending ||
    approvePodcastMutation.isPending ||
    discardPodcastMutation.isPending
  ) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          initialIndex={0}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Availables Tab */}
          <Tabs.Tab name="Availables">
            <View style={{flex: 1, marginTop: hp(7)}}>
              <View style={styles.reasonTabContainer}>
                <Tabs.FlatList
                  data={availablePodcasts ? availablePodcasts : []}
                  keyExtractor={(item, index) =>
                    item?._id?.toString() ?? index.toString()
                  }
                  refreshing={isAvailablePodcastLoading}
                  onRefresh={availablePodcastRefetch}
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
                    <View style={styles.emptyContainer}>
                      <Image
                        source={require('../../assets/identify-audience.png')}
                        style={styles.image}
                      />
                      <Text style={styles.message}>
                        No podcasts available for review
                      </Text>
                    </View>
                  }
                />
              </View>
            </View>
          </Tabs.Tab>

          {/* Inprogress Tab */}
          <Tabs.Tab name="Inprogress">
            <View style={{flex: 1, marginTop: hp(7)}}>
              <View style={styles.reasonTabContainer}>
                <Tabs.FlatList
                  data={Array.isArray(progressPodcasts) ? progressPodcasts : []}
                  keyExtractor={(item, index) =>
                    item?._id?.toString() ?? `progress-${index}`
                  }
                  refreshing={isProgressPodcastLoading}
                  onRefresh={progressPodcastRefetch}
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
                    <View style={styles.emptyContainer}>
                      <Image
                        source={require('../../assets/identify-audience.png')}
                        style={styles.image}
                      />
                      <Text style={styles.message}>
                        No podcasts available for review
                      </Text>
                    </View>
                  }
                />
              </View>
            </View>
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

        <FAB
          style={styles.fab}
          small
          icon={({size, color}) => (
            <AntDesign color="white" name="menu-fold" size={25} />
          )}
          onPress={() => {
            // handlePresentModalPress();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: ON_PRIMARY_COLOR,
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 20,
    color: '#000',
  },

  innerContainer: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
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
    marginTop: 16,
    //backgroundColor: ON_PRIMARY_COLOR,
    backgroundColor: '#ffffff',
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
    // backgroundColor: ON_PRIMARY_COLOR,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 16,
    color: 'black',
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
    backgroundColor: '#ffffff',
  },
  message: {
    fontSize: 17,
    color: '#555',
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
    paddingHorizontal: wp(2),
    paddingTop: hp(2),
    backgroundColor: '#ffffff',
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
  list: {
    paddingBottom: hp(15),
    paddingTop: hp(1),
    gap: hp(1.5),
  },
});
