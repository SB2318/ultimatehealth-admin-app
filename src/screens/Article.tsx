import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import { useEffect, useRef } from 'react';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ArticleData, ArticleProps, Category, CategoryType} from '../type';
import {FAB} from 'react-native-paper';
import {
  ARTICLE_TAGS_API,
  DISCARD_ARTICLE,
  EC2_BASE_URL,
  GET_AVILABLE_ARTICLES_API,
  GET_COMPLETED_TASK_API,
  GET_INPROGRESS_ARTICLES_API,
  PICK_ARTICLE,
} from '../helper/APIUtils';
import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ReviewCard from '../components/ReviewCard';
import {hp} from '../helper/Metric';
import FilterModal from '../components/FilterModal';
import Loader from '../components/Loader';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { setFilteredAvailableArticles, setFilteredProgressArticles, setFilterMode, setSelectedTags, setSortType, setTags } from '../stores/articleSlice';

export default function HomeScreen({navigation}: ArticleProps) {
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {
    filteredAvailableArticles,
    filteredProgressArticles,
    filterMode,
    selectedTags,
    sortType,
  } = useSelector((state: any) => state.article);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const dispatch = useDispatch();

  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortingType, setSortingType] = useState<string>('');
  const [selectCategoryList, setSelectCategoryList] = useState<
    CategoryType['name'][]
  >([]);

  //const bottomBarHeight = useBottomTabBarHeight();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();


  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const getAllCategories = async () => {
    if (user_token === '') {
      Alert.alert('No token found');
      return;
    }
    const {data: categoryData} = await axios.get(
      `${EC2_BASE_URL + ARTICLE_TAGS_API}`,
      {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      },
    );
    if (
      selectedTags === undefined ||
      (selectedTags && selectedTags.length === 0)
    ) {
      //console.log('Category Data', categoryData);
      dispatch(
        setSelectedTags({
          selectedTags: categoryData.map((category:Category) => category.name),
        }),
      );
      setSelectedCategory(categoryData[0]?.name);
    } else {
      setSelectedCategory(selectedTags[0]);
    }
    setArticleCategories(categoryData);
    dispatch(setTags({tags: categoryData}));
  };

  useEffect(() => {
    getAllCategories();
   
    return () => {};
  }, []);

  const {
    data: availableArticles,
    refetch: availableAticleRefetch,
    isLoading: isAvailableArticleLoading,
  } = useQuery({
    queryKey: ['get-available-articles'],
    queryFn: async () => {
      const response = await axios.get(`${GET_AVILABLE_ARTICLES_API}`, {
       // headers: {
       //   Authorization: `Bearer ${user_token}`,
       // },
      });
      let d = response.data as ArticleData[];
      updateAvailableArticles(d);
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
         // headers: {
          //  Authorization: `Bearer ${user_token}`,
         // },
        },
      );
      let d = response.data as ArticleData[];
      updateProgressArticles(d);
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
    mutationFn: async ({
      articleId,
      reason,
    }: {
      articleId: string;
      reason: string;
    }) => {
      const res = await axios.post(DISCARD_ARTICLE, {
        articleId: articleId,
        discardReason: reason,
      });

      return res.data as any;
    },

    onSuccess: d => {
      onRefresh();
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });

  const handleCategorySelection = (category: CategoryType['name']) => {
    // Update Redux State
    setSelectCategoryList(prevList => {
      const updatedList = prevList.includes(category)
        ? prevList.filter(item => item !== category)
        : [...prevList, category];
      return updatedList;
    });
  };
  const handleFilterReset = () => {
    // Update Redux State Variables
    setSelectCategoryList([]);
    setSortingType('');
    dispatch(
      setSelectedTags({
        selectedTags: articleCategories.map(category => category.name),
      }),
    );
    dispatch(setSortType({sortType: ''}));
    dispatch(setFilterMode({filterMode: false}));

    
    dispatch(setFilteredAvailableArticles({filteredArticles: availableArticles}));
    dispatch(setFilteredProgressArticles({filteredArticles: progressArticles}));
  };

  const handleFilterApply = () => {
    // Update Redux State Variables
    console.log("Handle filter apply called");
    if (selectCategoryList.length > 0) {
      dispatch(setSelectedTags({selectedTags: selectCategoryList}));
    } else {
      dispatch(
        setSelectedTags({
          selectedTags: articleCategories.map(category => category.name),
        }),
      );
    }

    dispatch(setSortType({sortType: sortingType}));
    dispatch(setFilterMode({filterMode: true}));
    updateArticles();
  };


  const updateAvailableArticles = (articleData: ArticleData[])=>{

    if (!articleData) {
      return;
    }

    let filtered = articleData;

    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        selectedTags.some(tag =>
          article.tags.some(category => category.name === tag),
        ),
      );
    }
    // console.log('Filtered before sort', filtered);
    if (sortType === 'recent' && filtered.length > 1) {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
      );
    } else if (sortType === 'oldest' && filtered.length > 1) {
      filtered.sort(
        (a, b) =>
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      );
    } else if (sortType === 'popular' && filtered.length > 1) {
      filtered.sort((a, b) => b.viewCount - a.viewCount);
    }

    dispatch(setFilteredAvailableArticles({filteredArticles: filtered}));
  }

  const updateProgressArticles = (articleData: ArticleData[])=>{

    if (!articleData) {
      return;
    }

    let filtered = articleData;
  
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        selectedTags.some(tag =>
          article.tags.some(category => category.name === tag),
        ),
      );
    }
  
    if (sortType === 'recent' && filtered.length > 1) {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
      );
    } else if (sortType === 'oldest' && filtered.length > 1) {
      filtered.sort(
        (a, b) =>
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      );
    } else if (sortType === 'popular' && filtered.length > 1) {
      filtered.sort((a, b) => b.viewCount - a.viewCount);
    }
  
    dispatch(setFilteredProgressArticles({filteredArticles: filtered}));
  }


  const updateArticles = () => {
    
    console.log("Update article called");

    let filterdAvailable:ArticleData[] = availableArticles? availableArticles: [];
    let filterProgress:ArticleData[] = progressArticles ? progressArticles: [];
   
   
    
    if (selectedTags.length > 0) {
    
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filterdAvailable = filterdAvailable.filter(article =>
        selectedTags.some((tag) =>
          article.tags.some(category => category.name === tag),
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      filterProgress = filterProgress.filter(article =>
        selectedTags.some((tag) =>
          article.tags.some(category => category.name === tag),
        ),
      );

     

    }
  
    if (sortType === 'recent') {

      
        filterdAvailable = filterdAvailable.sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
        );
      
      

      filterProgress = filterProgress.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
      );

    } else if (sortType === 'oldest') {

      if(filterdAvailable.length > 1){

        filterdAvailable.sort(
          (a, b) =>
            new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
        );
      }
     
      if(filterProgress.length > 1){

        filterProgress.sort(
          (a, b) =>
            new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
        );
      }

    } else if (sortType === 'popular') {


      if(filterdAvailable.length > 1){

        filterdAvailable.sort(
          (a, b) => b.viewCount - a.viewCount
        );
      }
     
      if(filterProgress.length > 1){

        filterProgress.sort(
          (a, b) => b.viewCount - a.viewCount
        );
      }


    }
  
    dispatch(setFilteredAvailableArticles({filteredArticles: filterdAvailable}));
    dispatch(setFilteredProgressArticles({filteredArticles: filterProgress}));
   
  };


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
                reason: reason,
              });
            }
          }}
          onNavigate={item => {
            navigation.navigate('ArticleReviewScreen', {
              articleId: Number(item._id),
              authorId: item.authorId,
              destination: item.status,
            });
          }}
        />
      );
    },
    [discardArticleMutation, navigation, pickArticleMutation, selectedCardId],
  );

  const onRefresh = () => {
    setRefreshing(true);
    availableAticleRefetch();
    refetchProgressArticles();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      availableAticleRefetch();
      refetchProgressArticles();
    }, [
      availableAticleRefetch,
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

  if(isAvailableArticleLoading || isProgressArticleLoading){
    return (
      <Loader />
    )
  }
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
              data={filteredAvailableArticles}
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

            {/* Available Improvements articles */}
            <Tabs.Tab name="Improvement">
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
              data={filteredProgressArticles}
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
        <FAB
        style={styles.fab}
        small
        icon={({size, color}) => (
          <AntDesign color="white" name="menu-fold" size={25} />
        )}
        onPress={() => {
          //navigation.goBack();
          handlePresentModalPress();
        }}
      />
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
});
