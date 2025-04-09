import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import {useSelector} from 'react-redux';
import axios from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ArticleData, ArticleProps} from '../type';
import {
  DISCARD_ARTICLE,
  GET_AVILABLE_ARTICLES_API,
  GET_COMPLETED_TASK_API,
  GET_INPROGRESS_ARTICLES_API,
  PICK_ARTICLE,
} from '../helper/APIUtils';
import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ReviewCard from '../components/ReviewCard';
import { hp } from '../helper/Metric';

export default function HomeScreen({navigation}:ArticleProps) {
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');


  //const bottomBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const {
    data: availableArticles,
    refetch: availableAticleRefetch,
    isLoading: isAvailableArticleLoading,
  } = useQuery({
    queryKey: ['get-available-articles'],
    queryFn: async () => {
      const response = await axios.get(`${GET_AVILABLE_ARTICLES_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data as ArticleData[];
    },
  });

  const {
    data: progressArticles,
    refetch: refetchProgressArticles,
    isLoading: isProgressArticleLoading,
  } = useQuery({
    queryKey: ['get-progress-articles'],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_INPROGRESS_ARTICLES_API}/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as ArticleData[];
    },
  });

  const {
    data: completedArticles,
    refetch: refetchCompletedArticles,
    isLoading: isCompletedArticleLoading,
  } = useQuery({
    queryKey: ['get-progress-articles'],
    queryFn: async () => {
      const response = await axios.get(`${GET_COMPLETED_TASK_API}/${user_id}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data as ArticleData[];
    },
  });

  const pickArticleMutation = useMutation({
    mutationKey: ['pick-article'],
    mutationFn: async (articleId: string) => {
      const res = await axios.post(`${PICK_ARTICLE}`, {
        articleId: articleId,
        moderatorId: user_id,
      });

      return res.data as any;
    },
    onSuccess: data => {
      Alert.alert(data.message);
    },
    onError: error => {
      console.log('Error', error);
      Alert.alert(error.message);
    },
  });

  const discardArticleMutation = useMutation({
    mutationKey: ['discard-article'],
    mutationFn: async ({articleId,reason}:{articleId: string, reason: string}) => {

      const res = await axios.post(DISCARD_ARTICLE, {
        articleId: articleId,
        discardReason: reason,
      });

      return res.data as any;
    },

    onSuccess:(d)=>{
      onRefresh();
    },
    onError:(err)=>{
      console.log('Error', err);
      Alert.alert(err.message);
    }
  })

  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        // eslint-disable-next-line react/react-in-jsx-scope
        <ReviewCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          //navigation={navigation}
          onclick={(item, index, reason) => {
            if (index === 0) {
              // Pick article
              pickArticleMutation.mutate(item._id);
            } else {
              // Display discard reason or screen
              discardArticleMutation.mutate({
                articleId: item._id,
                reason: reason
              });
            }
          }}
        />
      );
    },
    [discardArticleMutation, pickArticleMutation, selectedCardId],
  );


  const onRefresh = () => {
    setRefreshing(true);
    availableAticleRefetch();
    refetchProgressArticles();
    refetchCompletedArticles();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      availableAticleRefetch();
      refetchProgressArticles();
      refetchCompletedArticles();
    }, [
      availableAticleRefetch,
      refetchCompletedArticles,
      refetchProgressArticles,
    ]),
  );

  const renderTabBar = props => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={styles.indicatorStyle}
        style={styles.tabBarStyle}
        activeColor={PRIMARY_COLOR}
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
          // renderHeader={renderHeader}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 1 */}
          <Tabs.Tab name="Articles">
            <Tabs.FlatList
              data={availableArticles !== undefined ? availableArticles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../assets/article_default.jpg')}
                    style={styles.image}
                  />
                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
            />
          </Tabs.Tab>

          <Tabs.Tab name="In Progress">
            <Tabs.FlatList
              data={progressArticles !== undefined ? progressArticles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../assets/article_default.jpg')}
                    style={styles.image}
                  />
                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
            />
          </Tabs.Tab>
          {/* Tab 3 */}
          <Tabs.Tab name="Completed">
            <Tabs.FlatList
              data={completedArticles !== undefined ? completedArticles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../assets/article_default.jpg')}
                    style={styles.image}
                  />

                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
            />
          </Tabs.Tab>
        </Tabs.Container>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CAFFF',
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
    marginBottom: hp(4)
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
    fontWeight:"500",
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
});
