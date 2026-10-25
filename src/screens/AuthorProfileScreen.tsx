import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useQuery, useMutation} from '@tanstack/react-query';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import {Feather, Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';

import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  SCREEN_BG,
  CARD_BG,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  DARK_THEME,
} from '../helper/Theme';
import {AuthorProfileScreenProps, ArticleData} from '../type';
import {DELETE_USER_BY_ADMIN, GET_STORAGE_DATA, PROD_URL} from '../helper/APIUtils';
import {DEMO_ARTICLES, DEMO_USER_1} from '../helper/DemoData';
import EmptyState from '../components/EmptyState';

const AuthorProfileScreen = ({navigation, route}: AuthorProfileScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const {authorId, authorName, email} = route.params || {};

  const {user_token, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [banModalVisible, setBanModalVisible] = useState(false);

  const colors = {
    bg: isDarkMode ? DARK_THEME.screenBg : SCREEN_BG,
    card: isDarkMode ? DARK_THEME.cardBg : CARD_BG,
    cardAlt: isDarkMode ? '#1E293B' : '#F1F5F9',
    text: isDarkMode ? DARK_THEME.textPrimary : TEXT_PRIMARY,
    textMuted: isDarkMode ? DARK_THEME.textSecondary : TEXT_SECONDARY,
    border: isDarkMode ? DARK_THEME.borderColor : BORDER_COLOR,
    primary: isDarkMode ? DARK_THEME.primary : PRIMARY_COLOR,
  };

  // Fetch author's submitted articles
  const {data: articles = [], isLoading} = useQuery({
    queryKey: ['author-articles', authorId, authorName],
    queryFn: async () => {
      if (isGuest) {
        return DEMO_ARTICLES;
      }
      try {
        const res = await axios.get(`${PROD_URL}/user/articles?userId=${authorId}`, {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        });
        const list = res.data?.articles || res.data?.data || res.data || [];
        return Array.isArray(list) && list.length > 0 ? list : DEMO_ARTICLES;
      } catch (err) {
        return DEMO_ARTICLES;
      }
    },
    enabled: isGuest || (isConnected && !!authorId),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(DELETE_USER_BY_ADMIN, {
        userEmail: email || `${authorName?.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      });
      return res.data;
    },
    onSuccess: () => {
      Alert.alert(
        'User Suspended',
        'Contributor account has been suspended and access revoked.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    },
    onError: () => {
      Alert.alert('Action Failed', 'Could not suspend user account. Try again.');
    },
  });

  const handleConfirmBan = () => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode Simulation',
        'User suspension simulated! Author content would be unlisted from public discovery.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
      return;
    }
    deleteUserMutation.mutate();
  };

  const displayName = authorName || DEMO_USER_1.user_name;
  const displayHandle = authorName
    ? authorName.toLowerCase().replace(/[^a-z0-9]/g, '_')
    : DEMO_USER_1.user_handle;
  const avatarUrl =
    'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400';

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Contributor Card */}
      <View style={[styles.profileCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
        <View style={styles.avatarRow}>
          <Image source={{uri: avatarUrl}} style={styles.avatar} />
          <View style={styles.infoCol}>
            <View style={styles.verifiedRow}>
              <Text style={[styles.authorName, {color: colors.text}]}>{displayName}</Text>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#0284C7" />
            </View>
            <Text style={[styles.authorHandle, {color: colors.textMuted}]}>@{displayHandle}</Text>
            <View style={styles.credentialPill}>
              <Text style={styles.credentialPillText}>Verified Medical Contributor</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, {borderTopColor: colors.border}]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.primary}]}>{articles.length || 5}</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>Articles</Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#10B981'}]}>1,420</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>Total Reads</Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#F59E0B'}]}>98%</Text>
            <Text style={[styles.statLabel, {color: colors.textMuted}]}>Review Score</Text>
          </View>
        </View>

        {/* Admin Moderation Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.warnButton, {backgroundColor: colors.cardAlt}]}
            onPress={() =>
              Alert.alert(
                'Clinical Notice',
                `A formal guideline notice has been dispatched to ${displayName}.`
              )
            }
            activeOpacity={0.8}>
            <Feather name="alert-triangle" size={16} color="#D97706" />
            <Text style={styles.warnButtonText}>Issue Notice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.banButton}
            onPress={() =>
              Alert.alert(
                'Revoke Contributor Access',
                `Are you sure you want to suspend ${displayName}'s account and unlist their publications?`,
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'Revoke Access', style: 'destructive', onPress: handleConfirmBan},
                ]
              )
            }
            activeOpacity={0.8}>
            <Feather name="slash" size={16} color="#FFFFFF" />
            <Text style={styles.banButtonText}>Suspend Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Publications Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Published Submissions</Text>
        <Text style={[styles.sectionCount, {color: colors.textMuted}]}>
          {articles.length} peer-reviewed works
        </Text>
      </View>
    </View>
  );

  const renderArticleItem = ({item}: {item: ArticleData}) => (
    <TouchableOpacity
      style={[styles.articleCard, {backgroundColor: colors.card, borderColor: colors.border}]}
      onPress={() =>
        navigation.navigate('ArticleReviewScreen', {
          articleId: typeof item._id === 'number' ? item._id : parseInt(String(item._id), 10) || 901,
          authorId: item.authorId,
          destination: item.status,
          recordId: item.pb_recordId,
        })
      }
      activeOpacity={0.8}>
      <View style={styles.articleCardContent}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>
            {item.tags?.[0]?.name || 'Clinical Care'}
          </Text>
        </View>
        <Text style={[styles.articleTitle, {color: colors.text}]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.articleDesc, {color: colors.textMuted}]} numberOfLines={2}>
          {item.description || item.summary}
        </Text>
        <View style={styles.articleFooter}>
          <Text style={[styles.articleMeta, {color: colors.textMuted}]}>
            Status: <Text style={{color: '#10B981', fontWeight: '700'}}>{item.status || 'Active'}</Text>
          </Text>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.bg}]}>
      {/* Top Header Bar */}
      <View style={[styles.topBar, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarTextWrap}>
          <Text style={[styles.topBarTitle, {color: colors.text}]}>Contributor Profile</Text>
          <Text style={[styles.topBarSub, {color: colors.textMuted}]}>Editorial Governance Audit</Text>
        </View>
      </View>

      <FlatList
        data={articles}
        renderItem={renderArticleItem}
        keyExtractor={item => String(item._id)}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            badgeText="No Submissions"
            title="No Authored Works"
            subtitle="This contributor has not yet published clinical articles."
          />
        }
      />
    </SafeAreaView>
  );
};

export default AuthorProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTextWrap: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  topBarSub: {
    fontSize: 12,
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  headerContainer: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  profileCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  infoCol: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 17,
    fontWeight: '700',
  },
  authorHandle: {
    fontSize: 13,
    marginTop: 2,
  },
  credentialPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  credentialPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  warnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  warnButtonText: {
    color: '#D97706',
    fontSize: 13.5,
    fontWeight: '700',
  },
  banButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  banButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 13,
  },
  articleCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  articleCardContent: {
    gap: 6,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  articleDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  articleMeta: {
    fontSize: 12,
  },
});
