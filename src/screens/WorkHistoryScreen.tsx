import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {MaterialTabBar, Tabs} from 'react-native-collapsible-tab-view';
import {
  PRIMARY_COLOR,
  ON_PRIMARY_COLOR,
  BUTTON_COLOR,
} from '../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleData, WorkHistoryProps} from '../type';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {FAB} from 'react-native-paper';
import ReviewCard from '../components/ReviewCard';
import {hp} from '../helper/Metric';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GET_COMPLETED_TASK_API } from '../helper/APIUtils';
import Loader from '../components/Loader';
import { StatusEnum } from '../helper/Utils';

export default function WorkHistoryScreen({
  navigation,
}: WorkHistoryProps) {
  //const bottomBarHeight = useBottomTabBarHeight();
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  const {
    data: completedArticles,
    refetch: refetchCompletedArticles,
    isLoading: isCompletedArticleLoading,
  } = useQuery({
    queryKey: ['get-publish-articles'],
    queryFn: async () => {
      const response = await axios.get(`${GET_COMPLETED_TASK_API}/${user_id}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });
      return response.data as ArticleData[];
    },
  });
 


  const onRefresh = () => {
    setRefreshing(true);
     refetchCompletedArticles();
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        <ReviewCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          onClick={(item, index) => {
            // TODO: handle card click if needed
          }}
          onNavigate={item => {
            
            if(item?.status === StatusEnum.DISCARDED){
              return;
            }else{
              navigation.navigate('ArticleReviewScreen', {
              articleId: Number(item._id),
              authorId: item.authorId,
              destination: item.status,
              recordId: item.pb_recordId
            });
            }
          }}
        />
      );
    },
    [navigation, selectedCardId, setSelectedCardId],
  );
  
  if(isCompletedArticleLoading){
    return <Loader/>
}


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
          //renderHeader={renderHeader}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 2 */}
          <Tabs.Tab name={'Articles'}>
            <Tabs.FlatList
              data={
                completedArticles
                  ? completedArticles
                  : []
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
            />
          </Tabs.Tab>

          <Tabs.Tab name={'Improvement'}>
            <Tabs.FlatList
              data={[]}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
            />
          </Tabs.Tab>
          <Tabs.Tab name={'Reports'}>
            <Tabs.FlatList
              data={[]}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.message}>No Reports Found</Text>
                </View>
              }
            />
          </Tabs.Tab>
        </Tabs.Container>
      </View>
      <FAB
        style={styles.fab}
        small
        icon={({size, color}) => (
          <Ionicons name="arrow-back" size={size} color={'white'} />
        )}
        onPress={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CAFFF',
    // marginTop: hp(5)
  },
  innerContainer: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  tabsContainer: {
    backgroundColor: ON_PRIMARY_COLOR,
    overflow: 'hidden',
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
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
    //minHeight: 50,
  },
  tabBarStyle: {
    backgroundColor: 'white',
    minHeight: 65,
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 14.6,
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
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    borderRadius: hp(20),
    backgroundColor: BUTTON_COLOR, // Customize color
  },
});
