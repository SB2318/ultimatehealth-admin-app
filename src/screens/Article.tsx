import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  useColorScheme,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  BUTTON_COLOR,
  ON_PRIMARY_COLOR,
  PRIMARY_COLOR,
  BORDER_COLOR,
  DARK_THEME,
  SCREEN_BG,
} from '../helper/Theme';
import React, {useEffect, useRef, useCallback, useState, useMemo} from 'react';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {useMutation, useQuery} from '@tanstack/react-query';
import {ArticleData, ArticleProps, Category, CategoryType, GlossaryTerm} from '../type';
import {
  ARTICLE_TAGS_API,
  DISCARD_ARTICLE,
  GET_AVILABLE_ARTICLES_API,
  GET_INPROGRESS_ARTICLES_API,
  HTTP_CATEGORY,
  PICK_ARTICLE,
  PROD_URL,
  UNASSIGN_ARTICLE,
  GLOSSARY_API,
  GLOSSARY_REVIEW_QUEUE,
  GLOSSARY_IN_PROGRESS,
  PICK_GLOSSARY_API,
  APPROVE_GLOSSARY_API,
  REJECT_GLOSSARY_API,
} from '../helper/APIUtils';
import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import ReviewCard from '../components/ReviewCard';
import {hp, wp} from '../helper/Metric';
import Loader from '../components/Loader';
import Snackbar from 'react-native-snackbar';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Ionicons} from '@expo/vector-icons';
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
import EmptyState from '../components/EmptyState';
import DiscardReasonModal from '../components/DiscardReasonModal';
import {
  getFallbackGlossaryTerms,
  getFallbackUnassignedGlossary,
  getFallbackInProgressGlossary,
} from '../helper/DemoData';

export default function HomeScreen({navigation, route}: ArticleProps) {
  const {user_id, user_token, isSuperAdmin, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const tabContainerRef = useRef<any>(null);

  useEffect(() => {
    let requestedTab = route?.params?.initialTab;
    if (requestedTab === 'Revisions') {
      requestedTab = 'Revision';
    }
    if (requestedTab && tabContainerRef.current) {
      try {
        tabContainerRef.current.jumpToTab(requestedTab);
      } catch (e) {
        console.log('Error jumping to tab:', requestedTab, e);
      }
    }
  }, [route?.params?.initialTab]);
  const {
    filteredAvailableArticles,
    filteredProgressArticles,
    selectedTags,
    sortType,
  } = useSelector((state: any) => state.article);
  //const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [discardArticleId, setDiscardArticleId] = useState<string>('');
  const dispatch = useDispatch();
  const [articleRefreshing, setArticleRefreshing] = useState<boolean>(false);
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [sortingType, setSortingType] = useState<string>('');
  const [articleDiscardModal, setArticleDiscardModal] =
    useState<boolean>(false);
  const [addTagModalVisible, setAddTagModalVisible] = useState<boolean>(false);
  const [selectCategoryList, setSelectCategoryList] = useState<
    CategoryType['name'][]
  >([]);

  const [tagRefresh, setTagRefresh] = useState<boolean>(false);
  const [availablePage, setAvailablePage] = useState(1);
  const [totalAvailablePage, setTotalAvailablePage] = useState(0);

  const [progressPage, setProgressPage] = useState(1);
  const [totalProgressPage, setTotalProgressPage] = useState(0);

  // Glossary Management State for all Moderators (Unassigned & Under Review)
  const [glossaryTab, setGlossaryTab] = useState<'unassigned' | 'under-review'>('unassigned');
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryModalVisible, setGlossaryModalVisible] = useState(false);
  const [editingGlossaryId, setEditingGlossaryId] = useState<string | null>(null);
  const [glossaryTerm, setGlossaryTerm] = useState('');
  const [glossaryDefinition, setGlossaryDefinition] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('');
  const [glossaryPhonetic, setGlossaryPhonetic] = useState('');
  const [localUnassignedTerms, setLocalUnassignedTerms] = useState<GlossaryTerm[] | null>(null);
  const [localInProgressTerms, setLocalInProgressTerms] = useState<GlossaryTerm[] | null>(null);
  const [glossaryRefreshing, setGlossaryRefreshing] = useState(false);

  // 1. Unassigned Terms Queue (GET /glossary/admin/review-queue)
  const {
    data: rawUnassignedGlossary = [],
    isLoading: isUnassignedGlossaryLoading,
    refetch: refetchUnassignedGlossary,
  } = useQuery({
    queryKey: ['glossary-unassigned-queue'],
    queryFn: async () => {
      try {
        const res = await axios.get(GLOSSARY_REVIEW_QUEUE);
        return (res.data?.terms || res.data?.data || []) as GlossaryTerm[];
      } catch (e) {
        return getFallbackUnassignedGlossary();
      }
    },
    enabled: isConnected,
  });

  // 2. Under Review (In-Progress) Terms Queue (GET /glossary/admin/my-reviews/in-progress)
  const {
    data: rawInProgressGlossary = [],
    isLoading: isInProgressGlossaryLoading,
    refetch: refetchInProgressGlossary,
  } = useQuery({
    queryKey: ['glossary-in-progress-queue'],
    queryFn: async () => {
      try {
        const res = await axios.get(GLOSSARY_IN_PROGRESS);
        return (res.data?.terms || res.data?.data || []) as GlossaryTerm[];
      } catch (e) {
        return getFallbackInProgressGlossary();
      }
    },
    enabled: isConnected,
  });

  // STRICT RULE: Published glossary ko maat dikhao, sirf under review and unassign
  const effectiveUnassigned = (localUnassignedTerms || (isGuest ? getFallbackUnassignedGlossary(rawUnassignedGlossary) : rawUnassignedGlossary))
    .filter(t => t.status !== 'published');
  const effectiveInProgress = (localInProgressTerms || (isGuest ? getFallbackInProgressGlossary(rawInProgressGlossary) : rawInProgressGlossary))
    .filter(t => t.status !== 'published');

  const unassignedCount = effectiveUnassigned.length;
  const inProgressCount = effectiveInProgress.length;

  const currentGlossaryList = glossaryTab === 'unassigned' ? effectiveUnassigned : effectiveInProgress;

  // Medical Term Moderation State: { [termId]: { state: 'publish' | 'reject', reason: string } }
  const [glossaryDecisions, setGlossaryDecisions] = useState<Record<string, {state: 'publish' | 'reject'; reason: string}>>({});

  const getDecision = (termId: string) => {
    return glossaryDecisions[termId] || {state: 'publish', reason: ''};
  };

  const setDecisionState = (termId: string, state: 'publish' | 'reject') => {
    setGlossaryDecisions(prev => ({
      ...prev,
      [termId]: {
        reason: prev[termId]?.reason || '',
        state,
      },
    }));
  };

  const setDecisionReason = (termId: string, reason: string) => {
    setGlossaryDecisions(prev => ({
      ...prev,
      [termId]: {
        state: prev[termId]?.state || 'reject',
        reason,
      },
    }));
  };

  // Pick Term Mutation
  const pickGlossaryMutation = useMutation({
    mutationKey: ['pick-glossary-term'],
    mutationFn: async (id: string) => {
      const res = await axios.post(PICK_GLOSSARY_API(id));
      return res.data;
    },
    onSuccess: (data, id) => {
      const picked = effectiveUnassigned.find(t => t._id === id);
      if (picked) {
        setLocalUnassignedTerms(effectiveUnassigned.filter(t => t._id !== id));
        setLocalInProgressTerms([{...picked, status: 'in-progress'}, ...effectiveInProgress]);
      }
      refetchUnassignedGlossary();
      refetchInProgressGlossary();
      Snackbar.show({text: 'Term claimed for review', duration: Snackbar.LENGTH_SHORT});
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.response?.data?.message || 'Error claiming term',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  // Approve Term Mutation
  const approveGlossaryMutation = useMutation({
    mutationKey: ['approve-glossary-term'],
    mutationFn: async (vars: string | {id: string}) => {
      const id = typeof vars === 'string' ? vars : vars.id;
      const res = await axios.post(APPROVE_GLOSSARY_API(id), {});
      return res.data;
    },
    onSuccess: (data, vars) => {
      const id = typeof vars === 'string' ? vars : vars.id;
      // Remove from in-progress since it is now published
      setLocalInProgressTerms(effectiveInProgress.filter(t => t._id !== id));
      setLocalUnassignedTerms(effectiveUnassigned.filter(t => t._id !== id));
      refetchInProgressGlossary();
      refetchUnassignedGlossary();
      Snackbar.show({text: 'Term published successfully', duration: Snackbar.LENGTH_SHORT});
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.response?.data?.message || 'Error publishing term',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  // Reject / Delete Term Mutation
  const rejectGlossaryMutation = useMutation({
    mutationKey: ['reject-glossary-term'],
    mutationFn: async ({id, reason}: {id: string; reason: string}) => {
      const res = await axios.post(REJECT_GLOSSARY_API(id), {rejectionReason: reason});
      return res.data;
    },
    onSuccess: (data, {id}) => {
      setLocalInProgressTerms(effectiveInProgress.filter(t => t._id !== id));
      setLocalUnassignedTerms(effectiveUnassigned.filter(t => t._id !== id));
      refetchInProgressGlossary();
      refetchUnassignedGlossary();
      Snackbar.show({text: 'Term rejected', duration: Snackbar.LENGTH_SHORT});
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.response?.data?.message || 'Error rejecting term',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const handleSubmitGlossaryDecision = (term: GlossaryTerm) => {
    const decision = getDecision(term._id);
    if (decision.state === 'reject') {
      if (!decision.reason.trim()) {
        Alert.alert('Rejection Reason Required', 'Please enter a reason for rejecting this medical term.');
        return;
      }
      if (isConnected) {
        rejectGlossaryMutation.mutate({id: term._id, reason: decision.reason.trim()});
      } else {
        setLocalInProgressTerms(effectiveInProgress.filter(t => t._id !== term._id));
        setLocalUnassignedTerms(effectiveUnassigned.filter(t => t._id !== term._id));
        Snackbar.show({text: 'Term rejected (Offline simulation)', duration: Snackbar.LENGTH_SHORT});
      }
    } else {
      // Publish
      if (isConnected) {
        approveGlossaryMutation.mutate(term._id);
      } else {
        setLocalInProgressTerms(effectiveInProgress.filter(t => t._id !== term._id));
        setLocalUnassignedTerms(effectiveUnassigned.filter(t => t._id !== term._id));
        Snackbar.show({text: 'Term published (Offline simulation)', duration: Snackbar.LENGTH_SHORT});
      }
    }
  };

  const handleOpenAddGlossary = () => {
    setEditingGlossaryId(null);
    setGlossaryTerm('');
    setGlossaryDefinition('');
    setGlossaryCategory('');
    setGlossaryPhonetic('');
    setGlossaryModalVisible(true);
  };

  const handleOpenEditGlossary = (t: GlossaryTerm) => {
    setEditingGlossaryId(t._id);
    setGlossaryTerm(t.term);
    setGlossaryDefinition(t.definition);
    setGlossaryCategory(t.category || '');
    setGlossaryPhonetic(t.phonetic || '');
    setGlossaryModalVisible(true);
  };

  const handleSaveGlossary = async () => {
    if (!glossaryTerm.trim() || !glossaryDefinition.trim()) {
      Alert.alert('Required Fields', 'Please enter term title and clinical definition.');
      return;
    }

    if (editingGlossaryId) {
      try {
        if (isConnected) {
          await axios.put(`${GLOSSARY_API}/${editingGlossaryId}`, {
            term: glossaryTerm.trim(),
            definition: glossaryDefinition.trim(),
            category: glossaryCategory.trim() || 'General Medicine',
            phonetic: glossaryPhonetic.trim(),
          });
        }
      } catch (err) {}
      const updater = (prev: GlossaryTerm[]) =>
        prev.map(t =>
          t._id === editingGlossaryId
            ? {
                ...t,
                term: glossaryTerm.trim(),
                definition: glossaryDefinition.trim(),
                category: glossaryCategory.trim() || 'General Medicine',
                phonetic: glossaryPhonetic.trim(),
              }
            : t
        );
      setLocalInProgressTerms(updater(effectiveInProgress));
      setLocalUnassignedTerms(updater(effectiveUnassigned));
      Snackbar.show({text: 'Glossary term updated', duration: Snackbar.LENGTH_SHORT});
    } else {
      const newTerm: GlossaryTerm = {
        _id: 'term_' + Date.now(),
        term: glossaryTerm.trim(),
        definition: glossaryDefinition.trim(),
        category: glossaryCategory.trim() || 'General Medicine',
        phonetic: glossaryPhonetic.trim(),
        status: 'unassigned',
        created_at: new Date().toISOString(),
      };
      try {
        if (isConnected) {
          await axios.post(GLOSSARY_API, {
            term: glossaryTerm.trim(),
            definition: glossaryDefinition.trim(),
            category: glossaryCategory.trim() || 'General Medicine',
            phonetic: glossaryPhonetic.trim(),
          });
        }
      } catch (err) {}
      setLocalUnassignedTerms([newTerm, ...effectiveUnassigned]);
      Snackbar.show({text: 'Glossary term submitted to queue', duration: Snackbar.LENGTH_SHORT});
    }
    setGlossaryModalVisible(false);
  };

  const handleDeleteGlossary = (termId: string) => {
    Alert.alert('Reject Term', 'Are you sure you want to reject/remove this glossary term?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          if (isConnected) {
            rejectGlossaryMutation.mutate({id: termId, reason: 'Does not meet clinical criteria'});
          } else {
            setLocalInProgressTerms(effectiveInProgress.filter(t => t._id !== termId));
            setLocalUnassignedTerms(effectiveUnassigned.filter(t => t._id !== termId));
            Snackbar.show({text: 'Term rejected', duration: Snackbar.LENGTH_SHORT});
          }
        },
      },
    ]);
  };

  const onGlossaryRefresh = async () => {
    setGlossaryRefreshing(true);
    await Promise.all([refetchUnassignedGlossary(), refetchInProgressGlossary()]);
    setLocalUnassignedTerms(null);
    setLocalInProgressTerms(null);
    setGlossaryRefreshing(false);
  };

  const filteredGlossary = useMemo(() => {
    const list = currentGlossaryList;
    if (!glossarySearch.trim()) return list;
    const q = glossarySearch.toLowerCase();
    return list.filter(
      t =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.phonetic && t.phonetic.toLowerCase().includes(q)),
    );
  }, [currentGlossaryList, glossarySearch]);
  //const bottomBarHeight = useBottomTabBarHeight();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {data: categoryData, refetch: refetchCategories} = useQuery({
    queryKey: ['article-tags'],
    queryFn: async () => {
      const {data} = await axios.get(`${PROD_URL + ARTICLE_TAGS_API}`);
      return data as Category[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    enabled: !!isConnected && !!user_token,
  });

  useEffect(() => {
    if (categoryData && categoryData.length > 0) {
      setArticleCategories(categoryData);
      dispatch(setTags({tags: categoryData}));
      if (
        selectedTags === undefined ||
        (selectedTags && selectedTags.length === 0)
      ) {
        dispatch(
          setSelectedTags({
            selectedTags: categoryData.map((category: Category) => category.name),
          }),
        );
      }
    }
  }, [categoryData, dispatch, selectedTags]);

  const onAvailablePageEnd = () => {
    if (availablePage < totalAvailablePage) {
      setAvailablePage(prev => prev + 1);
    }
  };

  const onProgressPageEnd = () => {
    if (progressPage < totalProgressPage) {
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
      const response = await axios.get(
        `${GET_AVILABLE_ARTICLES_API}?page=${availablePage}`,
      );

      if (Number(availablePage) === 1) {
        if (response.data.totalPages) {
          const pages = response.data.totalPages;
          setTotalAvailablePage(pages);
        }
        if (response.data.articles) {
          updateAvailableArticles(response.data.articles);
        }
      } else {
        let d = response.data.articles as ArticleData[];
        updateAvailableArticles([...filteredAvailableArticles, ...d]);
      }
      return response.data.articles as ArticleData[];
    },
    enabled: !!user_token && !!isConnected,
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

      if (Number(progressPage) === 1) {
        if (response.data.totalPages) {
          const pages = response.data.totalPages;
          setTotalProgressPage(pages);
        }
        if (response.data.articles) {
          updateProgressArticles(response.data.articles);
        }
      } else {
        let d = response.data.articles as ArticleData[];
        updateProgressArticles([...filteredProgressArticles, ...d]);
      }
      return response.data.articles as ArticleData[];
    },
    enabled: !!user_token && !!isConnected,
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

    onSuccess: () => {
      // show snackbar
      Snackbar.show({
        text: 'Article discarded',
        duration: Snackbar.LENGTH_SHORT,
      });
      setArticleDiscardModal(false);
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

    onSuccess: () => {
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

  const updateAvailableArticles = (articleData: ArticleData[]) => {
    if (!articleData) {
      return;
    }

    let filtered = articleData;

    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        selectedTags.some((tag: string) =>
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
        selectedTags.some((tag: string) =>
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
        selectedTags.some((tag: string) =>
          article.tags.some(category => category.name === tag),
        ),
      );

      filterProgress = filterProgress.filter(article =>
        selectedTags.some((tag: string) =>
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
          onclick={(item, index) => {
            if (index === 0) {
              // Pick article
              if (isConnected) {
                pickArticleMutation.mutate(item._id);
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            } else if (index === 2) {
              // unassign yourself
              if (isConnected) {
                unassignFromArticleMutation.mutate({
                  articleId: item._id,
                });
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            } else {
              // Display discard reason or screen
              setDiscardArticleId(item._id);
              setArticleDiscardModal(true);
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
      isConnected,
      navigation,
      pickArticleMutation,
      selectedCardId,
      unassignFromArticleMutation,
    ],
  );

  const onArticleRefresh = (num: number) => {
    setArticleRefreshing(true);
    if (num === 1) {
      setAvailablePage(1);
      availableAticleRefetch();
    } else {
      refetchProgressArticles();
    }
    setArticleRefreshing(false);
  };

  const onTagRefresh = async () => {
    setTagRefresh(true);
    await refetchCategories();
    setTagRefresh(false);
  };

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
      articleRecordId: articleRecordId,
    });
  };

  const isDarkMode = useColorScheme() === 'dark';
  const renderTabBar = (props: any) => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={{
          backgroundColor: isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR,
          height: 3,
          borderRadius: 2,
        }}
        style={{
          backgroundColor: isDarkMode ? DARK_THEME.surfaceBg : '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: isDarkMode ? DARK_THEME.borderColor : BORDER_COLOR,
          elevation: 0,
          shadowOpacity: 0,
        }}
        activeColor={isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR}
        inactiveColor={isDarkMode ? DARK_THEME.textMuted : '#64748B'}
        labelStyle={{
          fontSize: 13,
          fontWeight: '600',
          textTransform: 'capitalize',
          letterSpacing: 0.1,
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
        text: 'Tag updated',
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
    onError: (error: any) => {
      console.log('error code', error.error);

      if (error.status === 500) {
        Snackbar.show({
          text: 'Deletion failed: this tag is currently linked to one or more articles',
          duration: Snackbar.LENGTH_SHORT,
        });
      } else {
        Snackbar.show({
          text: error.message,
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    },
  });

  if (isAvailableArticleLoading || isProgressArticleLoading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.innerContainer]}>
        <Tabs.Container
          ref={tabContainerRef}
          initialTabName={
            route?.params?.initialTab === 'Revisions'
              ? 'Revision'
              : (route?.params?.initialTab || 'Articles')
          }
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          <Tabs.Tab name="Articles">
            <HomeArticle
              availableArticle={filteredAvailableArticles}
              inProgressArticle={filteredProgressArticles}
              refreshing={articleRefreshing}
              onRefresh={onArticleRefresh}
              renderItem={renderItem}
              onAvailablePageEnd={onAvailablePageEnd}
              onProgressPageEnd={onProgressPageEnd}
            />
          </Tabs.Tab>

          {/* Available Improvements articles */}
          <Tabs.Tab name="Revision" label="Revision">
            {Improvement ? (
              <Improvement handleNav={handleImprovementReviewNav} />
            ) : null}
          </Tabs.Tab>

          {/* Glossary Tab (Comes before Tags) */}
          <Tabs.Tab name="Glossary" label="Glossary">
            <Tabs.FlatList
              data={filteredGlossary}
              keyExtractor={item => item._id || item.term}
              refreshing={glossaryRefreshing}
              onRefresh={onGlossaryRefresh}
              ListHeaderComponent={
                <View style={styles.glossaryHeaderWrap}>
                  {/* Segmented Queue Controller: Unassigned vs Under Review */}
                  <View style={styles.glossarySegmentContainer}>
                    <TouchableOpacity
                      style={[
                        styles.glossarySegmentBtn,
                        glossaryTab === 'unassigned' && styles.glossarySegmentBtnActive,
                      ]}
                      onPress={() => setGlossaryTab('unassigned')}
                      activeOpacity={0.8}>
                      <View style={styles.glossarySegmentContent}>
                        <Text
                          style={[
                            styles.glossarySegmentText,
                            glossaryTab === 'unassigned' && styles.glossarySegmentTextActive,
                          ]}>
                          Unassigned
                        </Text>
                        <View
                          style={[
                            styles.glossaryBadge,
                            glossaryTab === 'unassigned'
                              ? styles.glossaryBadgeActive
                              : styles.glossaryBadgeInactive,
                          ]}>
                          <Text
                            style={[
                              styles.glossaryBadgeText,
                              glossaryTab === 'unassigned'
                                ? styles.glossaryBadgeTextActive
                                : styles.glossaryBadgeTextInactive,
                            ]}>
                            {unassignedCount}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.glossarySegmentBtn,
                        glossaryTab === 'under-review' && styles.glossarySegmentBtnActive,
                      ]}
                      onPress={() => setGlossaryTab('under-review')}
                      activeOpacity={0.8}>
                      <View style={styles.glossarySegmentContent}>
                        <Text
                          style={[
                            styles.glossarySegmentText,
                            glossaryTab === 'under-review' && styles.glossarySegmentTextActive,
                          ]}>
                          Under Review
                        </Text>
                        <View
                          style={[
                            styles.glossaryBadge,
                            glossaryTab === 'under-review'
                              ? styles.glossaryBadgeActive
                              : styles.glossaryBadgeInactive,
                          ]}>
                          <Text
                            style={[
                              styles.glossaryBadgeText,
                              glossaryTab === 'under-review'
                                ? styles.glossaryBadgeTextActive
                                : styles.glossaryBadgeTextInactive,
                            ]}>
                            {inProgressCount}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Search Bar */}
                  <View style={styles.glossarySearchRow}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" style={{marginLeft: 12}} />
                    <TextInput
                      style={styles.glossarySearchInput}
                      placeholder={
                        glossaryTab === 'unassigned'
                          ? 'Search unassigned medical terms...'
                          : 'Search terms under review...'
                      }
                      placeholderTextColor="#94A3B8"
                      value={glossarySearch}
                      onChangeText={setGlossarySearch}
                      clearButtonMode="while-editing"
                    />
                    {glossarySearch.length > 0 ? (
                      <TouchableOpacity onPress={() => setGlossarySearch('')} style={{paddingRight: 10}}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleOpenAddGlossary}>
                    <Ionicons name="add" size={19} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Submit Medical Term</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({item}: {item: GlossaryTerm}) => (
                <View style={styles.glossaryCard}>
                  <View style={styles.glossaryCardHeader}>
                    <View style={{flex: 1, marginRight: 8}}>
                      <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>
                        <Text style={styles.glossaryTermText}>{item.term}</Text>
                        <View
                          style={[
                            styles.statusPill,
                            item.status === 'unassigned'
                              ? styles.statusPillUnassigned
                              : styles.statusPillReview,
                          ]}>
                          <Text
                            style={[
                              styles.statusPillText,
                              item.status === 'unassigned'
                                ? styles.statusPillTextUnassigned
                                : styles.statusPillTextReview,
                            ]}>
                            {item.status === 'unassigned' ? 'UNASSIGNED' : 'UNDER REVIEW'}
                          </Text>
                        </View>
                      </View>

                      {item.phonetic ? (
                        <Text style={styles.glossaryPhoneticText}>{item.phonetic}</Text>
                      ) : null}
                    </View>

                    <View style={styles.glossaryActionRow}>
                      {item.category ? (
                        <View style={styles.glossaryCategoryBadge}>
                          <Text style={styles.glossaryCategoryBadgeText}>{item.category}</Text>
                        </View>
                      ) : null}

                      {glossaryTab === 'under-review' ? (
                        <>
                          <TouchableOpacity
                            style={styles.glossaryIconBtn}
                            onPress={() => handleOpenEditGlossary(item)}>
                            <Ionicons name="pencil-outline" size={16} color="#0284C7" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.glossaryIconBtn}
                            onPress={() => handleDeleteGlossary(item._id)}>
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        </>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.glossaryDefText}>{item.definition}</Text>

                  {/* Action Row for Unassigned vs Under Review */}
                  <View style={styles.glossaryCardFooter}>
                    {item.status === 'unassigned' ? (
                      <TouchableOpacity
                        style={styles.claimGlossaryBtn}
                        onPress={() => {
                          if (isConnected) {
                            pickGlossaryMutation.mutate(item._id);
                          } else {
                            Snackbar.show({text: 'Offline mode', duration: Snackbar.LENGTH_SHORT});
                          }
                        }}>
                        <Ionicons name="hand-right-outline" size={15} color="#FFFFFF" style={{marginRight: 6}} />
                        <Text style={styles.claimGlossaryBtnText}>Claim for Review</Text>
                      </TouchableOpacity>
                    ) : (
                      /* Medical term has two states: Publish or Reject with reason, and submit */
                      <View style={styles.termDecisionContainer}>
                        <Text style={styles.termDecisionTitle}>Clinical Moderation Decision</Text>
                        <View style={styles.termStateRow}>
                          {/* Option 1: Publish */}
                          <TouchableOpacity
                            style={[
                              styles.termStateOption,
                              getDecision(item._id).state === 'publish' && styles.termStateOptionActivePublish,
                            ]}
                            onPress={() => setDecisionState(item._id, 'publish')}
                            activeOpacity={0.8}>
                            <Ionicons
                              name={getDecision(item._id).state === 'publish' ? 'radio-button-on' : 'radio-button-off'}
                              size={18}
                              color={getDecision(item._id).state === 'publish' ? '#10B981' : '#64748B'}
                            />
                            <Text
                              style={[
                                styles.termStateOptionText,
                                getDecision(item._id).state === 'publish' && styles.termStateTextActivePublish,
                              ]}>
                              Publish
                            </Text>
                          </TouchableOpacity>

                          {/* Option 2: Reject with reason */}
                          <TouchableOpacity
                            style={[
                              styles.termStateOption,
                              getDecision(item._id).state === 'reject' && styles.termStateOptionActiveReject,
                            ]}
                            onPress={() => setDecisionState(item._id, 'reject')}
                            activeOpacity={0.8}>
                            <Ionicons
                              name={getDecision(item._id).state === 'reject' ? 'radio-button-on' : 'radio-button-off'}
                              size={18}
                              color={getDecision(item._id).state === 'reject' ? '#EF4444' : '#64748B'}
                            />
                            <Text
                              style={[
                                styles.termStateOptionText,
                                getDecision(item._id).state === 'reject' && styles.termStateTextActiveReject,
                              ]}>
                              Reject with reason
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Reason input when Reject is chosen */}
                        {getDecision(item._id).state === 'reject' && (
                          <View style={styles.termReasonInputWrapper}>
                            <TextInput
                              style={styles.termReasonInput}
                              placeholder="Enter rejection reason (e.g., incorrect definition, duplicate, obsolete nomenclature)..."
                              placeholderTextColor="#94A3B8"
                              value={getDecision(item._id).reason}
                              onChangeText={val => setDecisionReason(item._id, val)}
                              multiline
                            />
                          </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                          style={[
                            styles.termSubmitBtn,
                            getDecision(item._id).state === 'reject'
                              ? styles.termSubmitBtnReject
                              : styles.termSubmitBtnPublish,
                          ]}
                          onPress={() => handleSubmitGlossaryDecision(item)}
                          activeOpacity={0.85}>
                          <Ionicons
                            name={getDecision(item._id).state === 'reject' ? 'close-circle-outline' : 'checkmark-circle-outline'}
                            size={17}
                            color="#FFFFFF"
                            style={{marginRight: 6}}
                          />
                          <Text style={styles.termSubmitBtnText}>
                            {getDecision(item._id).state === 'reject' ? 'Submit (Reject)' : 'Submit (Publish)'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState
                  icon="book-outline"
                  iconType="ionicons"
                  badge={glossaryTab === 'unassigned' ? 'Unassigned Queue' : 'Review Queue'}
                  title={
                    glossaryTab === 'unassigned'
                      ? 'No Unassigned Terms'
                      : 'No Terms Under Review'
                  }
                  subtitle={
                    glossaryTab === 'unassigned'
                      ? 'Queue is clear! All medical submissions have been claimed or reviewed.'
                      : 'You do not have any terms currently in review. Claim terms from the Unassigned queue.'
                  }
                />
              }
            />
          </Tabs.Tab>

          {/* Tags Tab (Positioned after Glossary) */}
          <Tabs.Tab name="Tags" label="Tags">
            <Tabs.FlatList
              data={articleCategories ? articleCategories : []}
              keyExtractor={item => item._id}
              refreshing={tagRefresh}
              onRefresh={onTagRefresh}
              ListHeaderComponent={
                <View style={styles.actionHeaderContainer}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedCategory(null);
                      setAddTagModalVisible(true);
                    }}>
                    <Ionicons name="add" size={19} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add New Tag</Text>
                  </TouchableOpacity>
                </View>
              }
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
                          onPress: () => {
                            if (isConnected) {
                              deleteTagMutation.mutate(item._id);
                            } else {
                              Snackbar.show({
                                text: 'You are currently offline',
                                duration: Snackbar.LENGTH_SHORT,
                              });
                            }
                          },
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
                <EmptyState
                  icon="tag"
                  title="No Tags Configured"
                  subtitle="Configure clinical categories and tags to organize articles and specialties."
                />
              }
            />
          </Tabs.Tab>
        </Tabs.Container>

        {/* <FilterModal
          bottomSheetModalRef={bottomSheetModalRef}
          categories={articleCategories}
          handleCategorySelection={handleCategorySelection}
          selectCategoryList={selectCategoryList}
          handleFilterReset={handleFilterReset}
          handleFilterApply={handleFilterApply}
          setSortingType={setSortingType}
          sortingType={sortingType}
        /> */}

        <AddTagModal
          type={1}
          mode={selectedCategory ? 'edit' : 'add'}
          reason={null}
          tag={selectedCategory}
          visible={addTagModalVisible}
          onTagChange={(tag, name) => {
            if (tag) {
              if (isConnected) {
                updateTagMutation.mutate({
                  name: name,
                  id: tag.id.toString(),
                });
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            } else {
              if (isConnected) {
                addTagMutation.mutate(name);
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            }
          }}
          onReasonChange={() => {}}
          onDismiss={onAddTagModalClose}
        />

        {/* <FAB
          style={styles.fab}
          small
          icon={({size, color}) => (
            <AntDesign color="white" name="menu-fold" size={25} />
          )}
          onPress={() => {
            //navigation.goBack();
            handlePresentModalPress();
          }}
        /> */}

        <DiscardReasonModal
          visible={articleDiscardModal}
          callback={(reason: string) => {
            console.log('discard modal click-', articleDiscardModal);
            // onclick(item, 1, reason);
            if (discardArticleId !== '') {
              if (isConnected) {
                discardArticleMutation.mutate({
                  articleId: discardArticleId,
                  reason: reason,
                });
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            } else {
              Snackbar.show({
                text: 'Article id not found, please try again',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          }}
          dismiss={() => {
            setDiscardArticleId('');
            setArticleDiscardModal(false);
          }}
        />

        {/* Medical Glossary Add / Edit Modal */}
        <Modal
          visible={glossaryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setGlossaryModalVisible(false)}>
          <View style={styles.glossaryModalOverlay}>
            <View style={styles.glossaryModalContainer}>
              <View style={styles.glossaryModalHeader}>
                <Text style={styles.glossaryModalTitle}>
                  {editingGlossaryId ? 'Edit Medical Term' : 'Add Medical Term'}
                </Text>
                <TouchableOpacity onPress={() => setGlossaryModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={{maxHeight: hp(65)}}>
                <Text style={styles.glossaryInputLabel}>Term / Medical Title *</Text>
                <TextInput
                  style={styles.glossaryTextInput}
                  placeholder="e.g. Arterial Hypertension"
                  placeholderTextColor="#94A3B8"
                  value={glossaryTerm}
                  onChangeText={setGlossaryTerm}
                />

                <Text style={styles.glossaryInputLabel}>Phonetic Transcription</Text>
                <TextInput
                  style={styles.glossaryTextInput}
                  placeholder="e.g. /ɑːrˈtɪəriəl ˌhaɪpərˈtɛnʃən/"
                  placeholderTextColor="#94A3B8"
                  value={glossaryPhonetic}
                  onChangeText={setGlossaryPhonetic}
                />

                <Text style={styles.glossaryInputLabel}>Specialty / Category</Text>
                <TextInput
                  style={styles.glossaryTextInput}
                  placeholder="e.g. Cardiology, Neurology"
                  placeholderTextColor="#94A3B8"
                  value={glossaryCategory}
                  onChangeText={setGlossaryCategory}
                />

                <Text style={styles.glossaryInputLabel}>Clinical Definition *</Text>
                <TextInput
                  style={[styles.glossaryTextInput, {height: 110, textAlignVertical: 'top'}]}
                  placeholder="Enter detailed clinical definition, etiology, and diagnostic context..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={glossaryDefinition}
                  onChangeText={setGlossaryDefinition}
                />

                <View style={styles.glossaryModalBtnRow}>
                  <TouchableOpacity
                    style={styles.glossaryCancelBtn}
                    onPress={() => setGlossaryModalVisible(false)}>
                    <Text style={styles.glossaryCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.glossarySaveBtn}
                    onPress={handleSaveGlossary}>
                    <Text style={styles.glossarySaveBtnText}>
                      {editingGlossaryId ? 'Save Changes' : 'Create Term'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  innerContainer: {
    flex: 1,
    padding: hp(0.2),
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
    marginTop: 6,
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
    fontSize: wp(3.1),
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
    right: hp(4),
    bottom: hp(10),
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

  actionHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  addButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  list: {
    paddingBottom: hp(16),
    paddingTop: 4,
    gap: hp(1.5),
  },
  glossaryHeaderWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  glossarySegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  glossarySegmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  glossarySegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  glossarySegmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  glossarySegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  glossarySegmentTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '700',
  },
  glossaryBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  glossaryBadgeActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  glossaryBadgeInactive: {
    backgroundColor: '#E2E8F0',
  },
  glossaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  glossaryBadgeTextActive: {
    color: '#FFFFFF',
  },
  glossaryBadgeTextInactive: {
    color: '#64748B',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillUnassigned: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusPillReview: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusPillTextUnassigned: {
    color: '#B45309',
  },
  statusPillTextReview: {
    color: '#1D4ED8',
  },
  glossaryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  claimGlossaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  claimGlossaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  approveGlossaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  approveGlossaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  termDecisionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  termDecisionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  termStateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  termStateOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  termStateOptionActivePublish: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  termStateOptionActiveReject: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  termStateOptionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  termStateTextActivePublish: {
    color: '#065F46',
    fontWeight: '700',
  },
  termStateTextActiveReject: {
    color: '#991B1B',
    fontWeight: '700',
  },
  termReasonInputWrapper: {
    marginBottom: 10,
  },
  termReasonInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  termSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  termSubmitBtnPublish: {
    backgroundColor: '#16A34A',
    shadowColor: '#16A34A',
  },
  termSubmitBtnReject: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  termSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  glossarySearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  glossarySearchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  glossaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  glossaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  glossaryTermText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  glossaryPhoneticText: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: '#64748B',
    marginTop: 2,
  },
  glossaryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glossaryCategoryBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  glossaryCategoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  glossaryIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  glossaryDefText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#334155',
  },
  glossaryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glossaryModalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  glossaryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  glossaryModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  glossaryInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 10,
  },
  glossaryTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  glossaryModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    marginBottom: 6,
  },
  glossaryCancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  glossaryCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  glossarySaveBtn: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: PRIMARY_COLOR,
  },
  glossarySaveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
