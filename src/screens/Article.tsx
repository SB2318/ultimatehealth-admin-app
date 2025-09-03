import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {BUTTON_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';
import {useEffect, useRef} from 'react';
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
  GET_AVILABLE_ARTICLES_API,
  GET_INPROGRESS_ARTICLES_API,
  HTTP_CATEGORY,
  PICK_ARTICLE,
  UNASSIGN_ARTICLE,
} from '../helper/APIUtils';
import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ReviewCard from '../components/ReviewCard';
import {hp, wp} from '../helper/Metric';
import FilterModal from '../components/FilterModal';
import Loader from '../components/Loader';
import Snackbar from 'react-native-snackbar';
import Config from 'react-native-config';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  setFilteredAvailableArticles,
  setFilteredProgressArticles,
  setFilterMode,
  setSelectedTags,
  setSortType,
  setTags,
} from '../stores/articleSlice';
import HomeArticle from './tabs/HomeArticle';
import Improvement from './tabs/Improvement';
import TagItemCard from '../components/TagItemCard';
import AddTagModal from '../components/AddTagModal';

export default function HomeScreen({navigation}: ArticleProps) {
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const {
    filteredAvailableArticles,
    filteredProgressArticles,
    selectedTags,
    sortType,
  } = useSelector((state: any) => state.article);
  //const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const dispatch = useDispatch();
  const [articleRefreshing, setArticleRefreshing] = useState<boolean>(false);
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [sortingType, setSortingType] = useState<string>('');
  const [addTagModalVisible, setAddTagModalVisible] = useState<boolean>(false);
  const [selectCategoryList, setSelectCategoryList] = useState<
    CategoryType['name'][]
  >([]);

  const [tagRefresh, setTagRefresh] = useState<boolean>(false);
  const [availablePage, setAvailablePage] = useState(1);
  const [totalAvailablePage, setTotalAvailablePage] = useState(0);

  const [progressPage, setProgressPage] = useState(1);
  const [totalProgressPage, setTotalProgressPage] = useState(0);
  //const bottomBarHeight = useBottomTabBarHeight();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const getAllCategories = useCallback(async () => {
    const {data: categoryData} = await axios.get(
      `${Config.PROD_URL + ARTICLE_TAGS_API}`,
    );
    if (
      selectedTags === undefined ||
      (selectedTags && selectedTags.length === 0)
    ) {
      //console.log('Category Data', categoryData);
      dispatch(
        setSelectedTags({
          selectedTags: categoryData.map((category: Category) => category.name),
        }),
      );
      //setSelectedCategory(categoryData[0]?.name);
    } else {
      //  setSelectedCategory(selectedTags[0]);
    }
    // console.log("Article data", categoryData.length);
    setArticleCategories(categoryData);
    dispatch(setTags({tags: categoryData}));
  },[dispatch, selectedTags]);

  useEffect(() => {
    getAllCategories();

    return () => {};
  }, [getAllCategories]);

  const onAvailablePageEnd = ()=>{
    if(availablePage < totalAvailablePage){
      setAvailablePage(prev => prev + 1);
    }
  };

  const onProgressPageEnd = ()=>{
    if(progressPage < totalProgressPage){
      setProgressPage(prev => prev + 1);
    }
  };

  const {
    data: availableArticles,
    refetch: availableAticleRefetch,
    isLoading: isAvailableArticleLoading,
  } = useQuery({
    queryKey: ['get-available-articles', availablePage],
    queryFn: async () => {
      const response = await axios.get(`${GET_AVILABLE_ARTICLES_API}?page=${availablePage}`);

      if(Number(availablePage) === 1){
       if(response.data.totalPages){
         const pages = response.data.totalPages;
         setTotalAvailablePage(pages);
       }
       if(response.data.articles){
        updateAvailableArticles(response.data.articles);
       }
      }else{
        let d = response.data.articles as ArticleData[];
        updateAvailableArticles([...filteredAvailableArticles, ...d]);
      }
      return response.data.articles as ArticleData[];
    },
    enabled : !!user_token,
  });

  const {
    data: progressArticles,
    refetch: refetchProgressArticles,
    isLoading: isProgressArticleLoading,
  } = useQuery({
    queryKey: ['get-progress-articles', progressPage],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_INPROGRESS_ARTICLES_API}/${user_id}?page=${progressPage}`,
      );

      if(Number(progressPage) === 1){
       if(response.data.totalPages){
         const pages = response.data.totalPages;
         setTotalProgressPage(pages);
       }
       if(response.data.articles){
        updateProgressArticles(response.data.articles);
       }
      }else{
        let d = response.data.articles as ArticleData[];
        updateProgressArticles([...filteredProgressArticles, ...d]);
      }
      return response.data.articles as ArticleData[];
    },
    enabled : !!user_token,
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
      onArticleRefresh(1);
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
      // show snackbar
      Snackbar.show({
        text: 'Article discarded',
        duration: Snackbar.LENGTH_SHORT,
      });
      onArticleRefresh(2);
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });

  const unassignFromArticleMutation = useMutation({
    mutationKey: ['unassign-article'],
    mutationFn: async ({articleId}: {articleId: string}) => {
      const res = await axios.post(UNASSIGN_ARTICLE, {
        articleId: articleId,
      });

      return res.data as any;
    },

    onSuccess: d => {
      Snackbar.show({
        text: 'You have unassign yourself successfully',
        duration: Snackbar.LENGTH_SHORT,
      });
      onArticleRefresh(2);
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });

  const onAddTagModalClose = () => {
    setAddTagModalVisible(false);
    setSelectedCategory(null);
  };

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

    dispatch(
      setFilteredAvailableArticles({filteredArticles: availableArticles}),
    );
    dispatch(setFilteredProgressArticles({filteredArticles: progressArticles}));
  };

  const handleFilterApply = () => {
    // Update Redux State Variables
    console.log('Handle filter apply called');
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

  const updateAvailableArticles = (articleData: ArticleData[]) => {
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
  };

  const updateProgressArticles = (articleData: ArticleData[]) => {
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
  };

  const updateArticles = () => {
    console.log('Update article called');

    let filterdAvailable: ArticleData[] = availableArticles
      ? availableArticles
      : [];
    let filterProgress: ArticleData[] = progressArticles
      ? progressArticles
      : [];

    if (selectedTags.length > 0) {
      filterdAvailable = filterdAvailable.filter(article =>
        selectedTags.some(tag =>
          article.tags.some(category => category.name === tag),
        ),
      );

      filterProgress = filterProgress.filter(article =>
        selectedTags.some(tag =>
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
      if (filterdAvailable.length > 1) {
        filterdAvailable.sort(
          (a, b) =>
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime(),
        );
      }

      if (filterProgress.length > 1) {
        filterProgress.sort(
          (a, b) =>
            new Date(a.lastUpdated).getTime() -
            new Date(b.lastUpdated).getTime(),
        );
      }
    } else if (sortType === 'popular') {
      if (filterdAvailable.length > 1) {
        filterdAvailable.sort((a, b) => b.viewCount - a.viewCount);
      }

      if (filterProgress.length > 1) {
        filterProgress.sort((a, b) => b.viewCount - a.viewCount);
      }
    }

    dispatch(
      setFilteredAvailableArticles({filteredArticles: filterdAvailable}),
    );
    dispatch(setFilteredProgressArticles({filteredArticles: filterProgress}));
  };

  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        <ReviewCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          //navigation={navigation}
          onclick={(item, index, reason) => {
            if (index === 0) {
              // Pick article
              pickArticleMutation.mutate(item._id);
            } else if (index === 2) {
              // unassign yourself
              unassignFromArticleMutation.mutate({
                articleId: item._id,
              });
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
              recordId: item.pb_recordId,
            });
          }}
        />
      );
    },
    [
      discardArticleMutation,
      navigation,
      pickArticleMutation,
      selectedCardId,
      unassignFromArticleMutation,
    ],
  );

  const onArticleRefresh = (num: number) => {
    setArticleRefreshing(true);
    if(num === 1){
      setAvailablePage(1);
      availableAticleRefetch();
    }else{

      refetchProgressArticles();
    }
    setArticleRefreshing(false);
  };

  const onTagRefresh = async () => {
    setTagRefresh(true);
    await getAllCategories();
    setTagRefresh(false);
  };
  useFocusEffect(
    useCallback(() => {
      availableAticleRefetch();
      refetchProgressArticles();
    }, [availableAticleRefetch, refetchProgressArticles]),
  );

  const handleImprovementReviewNav = (
    requestId: string,
    authorId: string,
    destination: string,
    recordId: string,
    articleRecordId: string,
  ) => {
    navigation.navigate('ImprovementReviewScreen', {
      requestId: requestId,
      authorId: authorId,
      destination: destination,
      recordId: recordId,
      articleRecordId: recordId,
    });
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

  const addTagMutation = useMutation({
    mutationKey: ['add-tag-mutation-key'],
    mutationFn: async (name: string) => {
      const res = await axios.post(`${HTTP_CATEGORY}`, {
        name: name,
      });

      //console.log("Tag res", res);
      return res.data as Category;
    },
    onSuccess: (data: Category) => {
      setArticleCategories(prev => [data, ...prev]);
      Snackbar.show({
        text: 'Tag added',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Error adding tag',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const updateTagMutation = useMutation({
    mutationKey: ['update-tag-mutation-key'],
    mutationFn: async ({name, id}: {name: string; id: string}) => {
      const res = await axios.put(`${HTTP_CATEGORY}/${id}`, {
        name: name,
      });

      return res.data as Category;
    },
    onSuccess: (data: Category) => {
      setArticleCategories(prev =>
        prev.map(item => (item.id === data.id ? data : item)),
      );
      Snackbar.show({
        text: 'Tag added',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Error adding tag',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const deleteTagMutation = useMutation({
    mutationKey: ['delete-tag-mutation-key'],
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${HTTP_CATEGORY}/${id}`);

      return res.data.data as Category;
    },
    onSuccess: (data: Category) => {
      setArticleCategories(prev => prev.filter(item => item.id !== data.id));
      Snackbar.show({
        text: 'Tag deleted',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: error => {
      console.log(error);
      Snackbar.show({
        text: error.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  if (
    deleteTagMutation.isPending ||
    updateTagMutation.isPending ||
    addTagMutation.isPending ||
    isAvailableArticleLoading ||
    isProgressArticleLoading
  ) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          // renderHeader={renderHeader}
          initialIndex={0}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 1 */}

          <Tabs.Tab name="Tags">
            <View style={{flex: 1}}>
              <View style={styles.reasonTabContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setAddTagModalVisible(true);
                  }}>
                  <Text style={styles.addButtonText}>+ Add New Tag</Text>
                </TouchableOpacity>

                <Tabs.FlatList
                  data={articleCategories ? articleCategories : []}
                  keyExtractor={item => item._id}
                  refreshing={tagRefresh}
                  onRefresh={onTagRefresh}
                  renderItem={({item}: {item: Category}) => (
                    <TagItemCard
                      reason={item}
                      onEditAction={(item: Category) => {
                        setSelectedCategory(item);
                        setAddTagModalVisible(true);
                      }}
                      onDeleteAction={(item: Category) => {
                        Alert.alert(
                          'Alert!',
                          'Are you sure you want to delete this category?',
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Confirm',
                              onPress: () => deleteTagMutation.mutate(item._id),
                              style: 'destructive',
                            },
                          ],
                        );
                      }}
                    />
                  )}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Image
                        source={require('../../assets/identify-audience.png')}
                        style={styles.image}
                      />

                      <Text style={styles.message}>No tags found</Text>
                    </View>
                  }
                />
              </View>
            </View>
          </Tabs.Tab>
          <Tabs.Tab name="Articles">
            <HomeArticle
              availableArticle={filteredAvailableArticles}
              inProgressArticle={filteredProgressArticles}
              refreshing={articleRefreshing}
              onRefresh={onArticleRefresh}
              renderItem={renderItem}
              onAvailablePageEnd ={onAvailablePageEnd}
              onProgressPageEnd = {onProgressPageEnd}
            />
          </Tabs.Tab>

          {/* Available Improvements articles */}
          <Tabs.Tab name="Improvements">
            <Improvement handleNav={handleImprovementReviewNav} />
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

        <AddTagModal
          type={1}
          reason={null}
          tag={selectedCategory}
          visible={addTagModalVisible}
          onTagChange={(tag, name) => {
            if (tag) {
              updateTagMutation.mutate({
                name: name,
                id: tag.id.toString(),
              });
            } else {
              addTagMutation.mutate(name);
            }
          }}
          onReasonChange={() => {}}
          onDismiss={onAddTagModalClose}
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
