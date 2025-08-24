import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {MaterialTabBar, Tabs} from 'react-native-collapsible-tab-view';
import {PRIMARY_COLOR, ON_PRIMARY_COLOR, BUTTON_COLOR} from '../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ArticleData,
  EditRequest,
  PodcastData,
  Report,
  WorkHistoryProps,
} from '../type';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {FAB} from 'react-native-paper';
import ReviewCard from '../components/ReviewCard';
import {hp} from '../helper/Metric';
import {useSelector} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {
  GET_ASSIGNED_REPORTS,
  GET_COMPLETED_IMPROVEMENTS,
  GET_COMPLETED_PODCAST,
  GET_COMPLETED_TASK_API,
} from '../helper/APIUtils';
import Loader from '../components/Loader';
import {StatusEnum} from '../helper/Utils';
import ReportCard from '../components/ReportCard';
import ImprovementCard from '../components/ImprovementCard';
import PodcastCard from '../components/PodcastCard';

export default function WorkHistoryScreen({navigation}: WorkHistoryProps) {
  //const bottomBarHeight = useBottomTabBarHeight();
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const insets = useSafeAreaInsets();
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  const [improvePage, setImprovePage] = useState(1);
  const [totalImprovePage, setTotalImprovePage] = useState(0);

  const [articlePage, setArticlePage] = useState(1);
  const [totalArticlePage, setTotalArticlePage] = useState(0);
  const [completedImprovements, setCompletedImprovements] = useState<
    EditRequest[]
  >([]);
  const [completedArticles, setCompletedArticles] = useState<ArticleData[]>([]);

  const {
    refetch: refetchCompletedImprovements,
    isLoading: isCompletedImprovementLoading,
  } = useQuery({
    queryKey: ['get-publish-improvements', improvePage],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_COMPLETED_IMPROVEMENTS}?page=${improvePage}`,
      );

      if (Number(improvePage) === 1) {
        if (response.data.totalPages) {
          let d = response.data.totalPages;
          setTotalImprovePage(d);
        }
        if (response.data.articles) {
          setCompletedImprovements(response.data.articles);
        }
      } else {
        if (response.data.articles) {
          const oldData = completedImprovements;
          const newData = response.data.articles as EditRequest[];
          setCompletedImprovements([...oldData, ...newData]);
        }
      }

      return response.data.articles as EditRequest[];
    },
    enabled: !!user_token,
  });

  const {
    refetch: refetchCompletedArticles,
    isLoading: isCompletedArticleLoading,
  } = useQuery({
    queryKey: ['get-publish-articles', articlePage],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_COMPLETED_TASK_API}/${user_id}?page=${articlePage}`,
      );

      if (Number(articlePage) === 1) {
        if (response.data.totalPages) {
          const pages = response.data.totalPages;
          setTotalArticlePage(pages);
        }
        if (response.data.articles) {
          setCompletedArticles(response.data.articles);
        }
      } else {
        let d = response.data.articles as ArticleData[];
        setCompletedArticles([...completedArticles, ...d]);
      }

      return response.data.articles as ArticleData[];
    },
    enabled: !!user_token,
  });

  const {
    data: completedPodcasts,
    refetch: refetchCompletedPodcasts,
    isLoading: isCompletedPodcastLoading,
  } = useQuery({
    queryKey: ['get-publish-podcasts'],
    queryFn: async () => {
      const response = await axios.get(`${GET_COMPLETED_PODCAST}`);
      return response.data as PodcastData[];
    },
  });

  const {
    data: assignedReports,
    refetch: refetchAssignReports,
    isLoading: isRefetchAssignReportLoading,
  } = useQuery({
    queryKey: ['get-assigned-reports'],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_ASSIGNED_REPORTS}?isCompleted=${true}`,
      );

      return response.data as Report[];
    },
  });

  const onViewContent = (report: Report) => {
    if (report.commentId) {
      navigation.navigate('CommentScreen', {
        articleId: Number(report.articleId._id),
        commentId: report.commentId._id,
        podcastId: report.podcastId ? report.podcastId._id : null,
      });
    } else {
      navigation.navigate('ArticleReviewScreen', {
        articleId: Number(report.articleId._id),
        authorId: report.articleId.authorId,
        destination: report.articleId.status,
        recordId: report.articleId.pb_recordId,
      });
    }
  };

  const onTakeActionReport = (report: Report) => {
    if (report) {
      navigation.navigate('ReportActionScreen', {
        reportId: report._id,
        report_admin_id: report.admin_id ?? '',
      });
    }
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
            if (item?.status === StatusEnum.DISCARDED) {
              return;
            } else {
              navigation.navigate('ArticleReviewScreen', {
                articleId: Number(item._id),
                authorId: item.authorId,
                destination: item.status,
                recordId: item.pb_recordId,
              });
            }
          }}
        />
      );
    },
    [navigation, selectedCardId, setSelectedCardId],
  );

  const renderRevisionItem = useCallback(
    ({item}: {item: EditRequest}) => {
      return (
        <ImprovementCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          onClick={() => {}}
          onNavigate={item => {
            if (item?.status === StatusEnum.DISCARDED) {
              return;
            } else {
              navigation.navigate('ImprovementReviewScreen', {
                requestId: item._id,
                authorId: item.article.authorId,
                destination: item.status,
                recordId: item.pb_recordId,
                articleRecordId: item.article_recordId,
              });
            }
          }}
        />
      );
    },
    [navigation, selectedCardId, setSelectedCardId],
  );

  const renderPodcastItem = useCallback(
    ({item}: {item: PodcastData}) => {
      return (
        <PodcastCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          handleClick={() => {
            navigation.navigate('PodcastDetail', {
              trackId: item._id,
            });
          }}
        />
      );
    },
    [navigation, selectedCardId, setSelectedCardId],
  );

  if (isCompletedArticleLoading || isRefetchAssignReportLoading) {
    return <Loader />;
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
              data={completedArticles ? completedArticles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={isCompletedArticleLoading}
              onRefresh={refetchCompletedArticles}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../assets/identify-audience.png')}
                    style={styles.image}
                  />
                  <Text style={styles.message}>No articles available</Text>
                </View>
              }
              onEndReached={()=>{
                if(articlePage < totalArticlePage){
                  setArticlePage(prev => prev + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </Tabs.Tab>

          <Tabs.Tab name={'Revision'}>
            <Tabs.FlatList
              data={completedImprovements ? completedImprovements : []}
              renderItem={renderRevisionItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={isCompletedImprovementLoading}
              onRefresh={() => {
                setImprovePage(1);
                refetchCompletedImprovements();
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../assets/identify-audience.png')}
                    style={styles.image}
                  />
                  <Text style={styles.message}>No revisions available</Text>
                </View>
              }
              onEndReached={() => {
                if (improvePage < totalImprovePage) {
                  setImprovePage(prev => prev + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </Tabs.Tab>

          <Tabs.Tab name={'Podcast'}>
            <Tabs.FlatList
              data={completedPodcasts ? completedPodcasts : []}
              renderItem={renderPodcastItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={isCompletedPodcastLoading}
              onRefresh={refetchCompletedPodcasts}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image
                    source={require('../../assets/identify-audience.png')}
                    style={styles.image}
                  />
                  <Text style={styles.message}>No podcasts available</Text>
                </View>
              }
            />
          </Tabs.Tab>
          <Tabs.Tab name={'Reports'}>
            <View style={{flex: 1}}>
              <Tabs.FlatList
                data={assignedReports ? assignedReports : []}
                keyExtractor={item => item._id}
                renderItem={({item}) => (
                  <ReportCard
                    report={item}
                    onViewContent={() => {
                      onViewContent(item);
                    }}
                    onTakeActionReport={onTakeActionReport}
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Image
                      source={require('../../assets/identify-audience.png')}
                      style={styles.image}
                    />
                    <Text style={styles.message}>No report available</Text>
                  </View>
                }
                //contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
              />
            </View>
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
  image: {
    height: 160,
    width: 160,
    borderRadius: 80,
    resizeMode: 'cover',
    marginBottom: hp(4),
  },
});
