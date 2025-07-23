import {Image, StyleSheet, Text, View} from 'react-native';
import {PodcastData, PodcastProps} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';
import {FAB} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {MaterialTabBar, Tabs} from 'react-native-collapsible-tab-view';
import {hp, wp} from '../helper/Metric';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PodcastCard from '../components/PodcastCard';
import {msToTime} from '../helper/Utils';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {FETCH_AVAILABLE_PODCAST, FETCH_PROGRESS_PODCAST} from '../helper/APIUtils';
import axios from 'axios';

export default function Podcast({navigation}: PodcastProps) {
  const insets = useSafeAreaInsets();
  

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
  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          initialIndex={0}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Availables Tab */}
          <Tabs.Tab name="Availables">
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
                    id={item._id}
                    title={item.title}
                    tags={item.tags}
                    host={item.user_id?.user_name ?? 'Unknown'}
                    duration={msToTime(item.duration)}
                    handleClick={() => {}}
                    imageUri={item.cover_image}
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
          </Tabs.Tab>

          {/* Inprogress Tab */}
          <Tabs.Tab name="Inprogress">
            <Tabs.FlatList
              data={progressPodcasts ? progressPodcasts : []}
              keyExtractor={(item, index) =>
                item?._id?.toString() ?? index.toString()
              }
              refreshing={isProgressPodcastLoading}
              onRefresh={progressPodcastRefetch}
              renderItem={({item}: {item: PodcastData}) => {
                if (!item) {
                  return null;
                }
                return (
                  <PodcastCard
                    id={item._id}
                    title={item.title}
                    tags={item.tags}
                    host={item.user_id?.user_name ?? 'Unknown'}
                    duration={msToTime(item.duration)}
                    handleClick={() => {}}
                    imageUri={item.cover_image}
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
    backgroundColor: ON_PRIMARY_COLOR,
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
    marginTop: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
    backgroundColor: ON_PRIMARY_COLOR,
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
    backgroundColor: 'white',
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 14,
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
    backgroundColor: '#F9FAFB',
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
