import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  useColorScheme,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import {resetUserState} from '../stores/UserSlice';

import {
  GET_PROFILE_API,
  GET_AVILABLE_ARTICLES_API,
  GET_INPROGRESS_ARTICLES_API,
  GET_AVAILABLE_IMPROVEMENTS,
  FETCH_AVAILABLE_PODCAST,
  GET_PENDING_REPORTS,
  GET_ALL_APPLICANTS,
  GET_STORAGE_DATA,
  PROD_URL,
} from '../helper/APIUtils';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  SCREEN_BG,
  CARD_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_COLOR,
  STATUS_COLORS,
  DARK_THEME,
  CLINICAL_SHADOW,
  CLINICAL_SHADOW_SUBTLE,
} from '../helper/Theme';
import {hp, wp} from '../helper/Metric';
import {Admin, ArticleData, EditRequest, Report} from '../type';
import {
  DEMO_ARTICLES,
  DEMO_IN_PROGRESS_ARTICLES,
  DEMO_IMPROVEMENTS,
  DEMO_PODCASTS,
  DEMO_REPORTS,
  getFallbackArticles,
  getFallbackProgressArticles,
  getFallbackImprovements,
  getFallbackPodcasts,
  getFallbackReports,
  getFallbackCount,
} from '../helper/DemoData';

export default function DashboardScreen({navigation}: any) {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  const {user_id, user_token, user_handle, isSuperAdmin, isGuest} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Profile
  const {data: user, refetch: refetchProfile} = useQuery<Admin>({
    queryKey: ['get-profile'],
    queryFn: async () => {
      const res = await axios.get(GET_PROFILE_API);
      return res.data;
    },
    enabled: !!user_token && isConnected,
  });

  // 2. Unread Notifications Count
  const {data: unreadCount = 0, refetch: refetchNotifications} = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: async () => {
      const res = await axios.get(`${PROD_URL}/notification/unread-count?role=1`);
      return res.data?.unreadCount || 0;
    },
    enabled: !!user_token && isConnected,
  });

  // 3. Articles Queue Stats (Available & My In-Progress)
  const {
    data: articleQueueData,
    isLoading: isArticlesLoading,
    refetch: refetchAvailableArticles,
  } = useQuery({
    queryKey: ['get-available-articles', 1],
    queryFn: async () => {
      const res = await axios.get(`${GET_AVILABLE_ARTICLES_API}?page=1`, {
        headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
      });
      return {
        articles: (res.data?.articles || []) as ArticleData[],
        total:
          res.data?.totalArticles ??
          res.data?.total ??
          res.data?.totalCount ??
          (res.data?.articles?.length || 0),
      };
    },
    enabled: !!user_token && isConnected,
  });

  const availableArticles = Array.isArray(articleQueueData?.articles)
    ? articleQueueData.articles
    : [];
  // Use real backend count when authenticated; only use fallback demo count in guest mode
  const availableArticlesCount = isGuest
    ? getFallbackCount(
        articleQueueData?.total ?? (availableArticles.length > 0 ? availableArticles.length : undefined),
        DEMO_ARTICLES.length,
      )
    : (articleQueueData?.total ?? availableArticles.length);

  const {data: inProgressArticles = [], refetch: refetchProgressArticles} = useQuery({
    queryKey: ['get-progress-articles', 1],
    queryFn: async () => {
      try {
        const res = await axios.get(`${GET_INPROGRESS_ARTICLES_API}/${user_id}?page=1`, {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        });
        const articles = res.data?.articles ?? res.data;
        return (Array.isArray(articles) ? articles : []) as ArticleData[];
      } catch {
        return [] as ArticleData[];
      }
    },
    enabled: !!user_token && !!user_id && isConnected,
  });

  // Effective in-progress duties: wraps with clinical demo reviews only in guest mode
  const inProgressList = isGuest
    ? getFallbackProgressArticles(inProgressArticles)
    : inProgressArticles;

  // 4. Improvements Queue Stats
  const {
    data: improvementQueueData,
    isLoading: isImprovementsLoading,
    refetch: refetchImprovements,
  } = useQuery({
    queryKey: ['get-available-improvements', 1],
    queryFn: async () => {
      try {
        const res = await axios.get(`${GET_AVAILABLE_IMPROVEMENTS}?page=1`, {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        });
        return {
          articles: (Array.isArray(res.data?.articles) ? res.data.articles : []) as EditRequest[],
          total:
            res.data?.totalImprovements ??
            res.data?.total ??
            res.data?.totalCount ??
            (res.data?.articles?.length || 0),
        };
      } catch {
        return {articles: [] as EditRequest[], total: 0};
      }
    },
    enabled: !!user_token && isConnected,
  });

  const availableImprovements = Array.isArray(improvementQueueData?.articles)
    ? improvementQueueData.articles
    : [];
  const improvementsCount = isGuest
    ? getFallbackCount(
        improvementQueueData?.total ?? (availableImprovements.length > 0 ? availableImprovements.length : undefined),
        DEMO_IMPROVEMENTS.length,
      )
    : (improvementQueueData?.total ?? availableImprovements.length);

  // 5. Podcasts Queue Stats
  const {
    data: podcastQueueData,
    isLoading: isPodcastsLoading,
    refetch: refetchPodcasts,
  } = useQuery({
    queryKey: ['get-available-podcasts', 1],
    queryFn: async () => {
      try {
        const res = await axios.get(`${FETCH_AVAILABLE_PODCAST}?page=1`, {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        });
        return {
          podcasts: (Array.isArray(res.data?.podcasts) ? res.data.podcasts : []) as any[],
          total:
            res.data?.totalPodcasts ??
            res.data?.total ??
            res.data?.totalCount ??
            (res.data?.podcasts?.length || 0),
        };
      } catch {
        return {podcasts: [], total: 0};
      }
    },
    enabled: !!user_token && isConnected,
  });

  const availablePodcasts = Array.isArray(podcastQueueData?.podcasts)
    ? podcastQueueData.podcasts
    : [];
  const podcastsCount = isGuest
    ? getFallbackCount(
        podcastQueueData?.total ?? (availablePodcasts.length > 0 ? availablePodcasts.length : undefined),
        DEMO_PODCASTS.length,
      )
    : (podcastQueueData?.total ?? availablePodcasts.length);

  // 6. Reports Queue Stats
  const {
    data: reportQueueData,
    isLoading: isReportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['get-pending-reports', 1],
    queryFn: async () => {
      try {
        const res = await axios.get(`${GET_PENDING_REPORTS}?page=1`, {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        });
        return {
          pendingReports: (Array.isArray(res.data?.pendingReports) ? res.data.pendingReports : []) as Report[],
          total:
            res.data?.totalReports ??
            res.data?.total ??
            res.data?.totalCount ??
            (res.data?.pendingReports?.length || 0),
        };
      } catch {
        return {pendingReports: [] as Report[], total: 0};
      }
    },
    enabled: !!user_token && isConnected,
  });

  const pendingReports = Array.isArray(reportQueueData?.pendingReports)
    ? reportQueueData.pendingReports
    : [];
  const reportsCount = isGuest
    ? getFallbackCount(
        reportQueueData?.total ?? (pendingReports.length > 0 ? pendingReports.length : undefined),
        DEMO_REPORTS.length,
      )
    : (reportQueueData?.total ?? pendingReports.length);

  // 7. Super Admin: Doctor / Moderator Applicants
  const {data: rawApplicants = [], refetch: refetchApplicants} = useQuery({
    queryKey: ['superadmin-applicants'],
    queryFn: async () => {
      try {
        const res = await axios.get(GET_ALL_APPLICANTS, {
          headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
        });
        const data = res.data;
        if (Array.isArray(data?.data?.applicants)) return data.data.applicants;
        if (Array.isArray(data?.applicants)) return data.applicants;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data)) return data;
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!user_token && isConnected && isSuperAdmin,
  });

  const rawApplicantsList = Array.isArray(rawApplicants) ? rawApplicants : [];
  const pendingApplicantsCount = isGuest
    ? getFallbackCount(
        rawApplicantsList.filter((a: any) => !a?.status || a.status.toLowerCase() === 'pending').length,
        3,
      )
    : rawApplicantsList.filter((a: any) => !a?.status || a.status.toLowerCase() === 'pending').length;

  // Refresh All Data with Haptic Feedback
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    await Promise.allSettled([
      refetchProfile(),
      refetchNotifications(),
      refetchAvailableArticles(),
      refetchProgressArticles(),
      refetchImprovements(),
      refetchPodcasts(),
      refetchReports(),
      isSuperAdmin ? refetchApplicants() : Promise.resolve(),
    ]);

    setRefreshing(false);
  }, [
    refetchProfile,
    refetchNotifications,
    refetchAvailableArticles,
    refetchProgressArticles,
    refetchImprovements,
    refetchPodcasts,
    refetchReports,
    refetchApplicants,
    isSuperAdmin,
  ]);

  const colors = {
    screenBg: isDarkMode ? DARK_THEME.screenBg : SCREEN_BG,
    cardBg: isDarkMode ? DARK_THEME.cardBg : CARD_BG,
    border: isDarkMode ? DARK_THEME.borderColor : BORDER_COLOR,
    textPrimary: isDarkMode ? DARK_THEME.textPrimary : TEXT_PRIMARY,
    textSecondary: isDarkMode ? DARK_THEME.textSecondary : TEXT_SECONDARY,
    textMuted: isDarkMode ? DARK_THEME.textMuted : TEXT_MUTED,
  };

  const resolvedUser = (user as any)?.user || (user as any)?.data || user;
  const displayName = isGuest
    ? 'Dr. Guest Explorer'
    : (resolvedUser?.user_name || resolvedUser?.name || user_handle || 'Clinical Reviewer');
  const rawAvatar = resolvedUser?.Profile_avtar || resolvedUser?.profile_avtar || resolvedUser?.Profile_avatar || resolvedUser?.profile_image || resolvedUser?.avatar;
  const avatarUrl = isGuest
    ? 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400'
    : (rawAvatar
    ? rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://')
      ? rawAvatar
      : `${GET_STORAGE_DATA}/${rawAvatar}`
    : null);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.screenBg}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.screenBg}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }>
        {/* ============================================================== */}
        {/* HEADER: iStaffrota Clinical App Bar                            */}
        {/* ============================================================== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Avatar without active status dot */}
            <View style={styles.avatarWrapper}>
              {avatarUrl ? (
                <Image source={{uri: avatarUrl}} style={styles.avatar} />
              ) : (
                <View
                  style={[
                    styles.avatarPlaceholder,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#E0F2FE',
                      borderColor: isDarkMode ? '#334155' : '#BAE6FD',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.avatarInitials,
                      {color: isDarkMode ? '#38BDF8' : PRIMARY_COLOR},
                    ]}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Greetings & Role */}
            <View style={styles.nameBlock}>
              <Text style={[styles.greetingText, {color: colors.textMuted}]}>
                Welcome back,
              </Text>
              <Text
                style={[styles.displayName, {color: colors.textPrimary}]}
                numberOfLines={1}>
                {displayName}
              </Text>

              {/* Clinical Role Chip */}
              <View style={styles.roleChipRow}>
                {isGuest ? (
                  <View style={styles.guestPill}>
                    <Ionicons name="compass" size={11} color="#0284C7" />
                    <Text style={styles.guestPillText}>GUEST REVIEWER</Text>
                  </View>
                ) : isSuperAdmin ? (
                  <View style={styles.superAdminBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#4338CA" />
                    <Text style={styles.superAdminBadgeText}>SUPER ADMIN</Text>
                  </View>
                ) : (
                  <View style={styles.moderatorBadge}>
                    <Ionicons name="medical" size={11} color="#059669" />
                    <Text style={styles.moderatorBadgeText}>CLINICAL MODERATOR</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Header Action: Notification Bell */}
          <TouchableOpacity
            style={[
              styles.bellButton,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              navigation.navigate('Notification');
            }}
            activeOpacity={0.8}>
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={22}
              color={unreadCount > 0 ? PRIMARY_COLOR : colors.textSecondary}
            />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* GUEST EXPLORER BANNER */}
        {isGuest && (
          <View style={styles.guestModeBanner}>
            <View style={styles.guestBannerLeft}>
              <View style={styles.guestBadgeDot} />
              <View style={{flex: 1}}>
                <Text style={styles.guestBannerTitle}>Guest Mode Active</Text>
                <Text style={styles.guestBannerSubtitle}>
                  Simulating full reviewer environment with mock data
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.exitGuestButton}
              onPress={() => {
                dispatch(resetUserState());
                navigation.reset({
                  index: 0,
                  routes: [{name: 'LoginScreen'}],
                });
              }}
              activeOpacity={0.8}>
              <Text style={styles.exitGuestButtonText}>Exit Guest</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ============================================================== */}
        {/* SUPER ADMIN EXECUTIVE BANNER (Only visible to Super Admins)     */}
        {/* ============================================================== */}
        {isSuperAdmin && (
          <View style={styles.executiveBanner}>
            <View style={styles.executiveHeader}>
              <View style={styles.executiveTitleRow}>
                <Text style={styles.executiveTitle}>EXECUTIVE GOVERNANCE</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('SuperAdminDashboard')}
                style={styles.manageButton}
                activeOpacity={0.8}>
                <View style={styles.manageButtonContent}>
                  <Text style={styles.manageButtonText}>Open Console</Text>
                  <Feather name="arrow-right" size={15} color="#4338CA" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.executiveGrid}>
              <TouchableOpacity
                style={styles.executiveCard}
                onPress={() => navigation.navigate('SuperAdminDashboard')}
                activeOpacity={0.85}>
                <View style={styles.executiveCardIconWrap}>
                  <Ionicons name="person-add" size={18} color="#6366F1" />
                </View>
                <View>
                  <Text style={styles.executiveMetricNumber}>
                    {pendingApplicantsCount > 0 ? pendingApplicantsCount : rawApplicantsList.length}
                  </Text>
                  <Text style={styles.executiveMetricLabel}>
                    Doctor Applicants
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.executiveCard}
                onPress={() => navigation.navigate('SuperAdminDashboard')}
                activeOpacity={0.85}>
                <View style={styles.executiveCardIconWrap}>
                  <MaterialCommunityIcons name="shield-account" size={20} color="#06B6D4" />
                </View>
                <View>
                  <Text style={styles.executiveMetricNumber}>Active</Text>
                  <Text style={styles.executiveMetricLabel}>
                    Staff & Roster
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.executiveCard}
                onPress={() => navigation.navigate('SuperAdminDashboard')}
                activeOpacity={0.85}>
                <View style={styles.executiveCardIconWrap}>
                  <Ionicons name="options-outline" size={18} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.executiveMetricNumber}>Rules</Text>
                  <Text style={styles.executiveMetricLabel}>
                    Tags & Domains
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ============================================================== */}
        {/* CLINICAL DUTY KPI CARDS (iStaffrota Grid)                       */}
        {/* ============================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            Live Duty Queue
          </Text>
          <Text style={[styles.sectionSubtitle, {color: colors.textMuted}]}>
            Real-time workload snapshot
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          {/* 1. Articles Queue */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Article')}
            activeOpacity={0.85}>
            <View style={styles.kpiCardHeader}>
              <View
                style={[
                  styles.kpiIconWrap,
                  {backgroundColor: '#ECFEFF', borderColor: '#A5F3FC'},
                ]}>
                <Ionicons name="document-text" size={20} color="#0891B2" />
              </View>
              <View style={styles.kpiBadge}>
                <Text style={styles.kpiBadgeText}>ARTICLES</Text>
              </View>
            </View>
            <Text style={[styles.kpiNumber, {color: colors.textPrimary}]}>
              {isArticlesLoading ? '...' : availableArticlesCount}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textSecondary}]}>
              {availableArticlesCount === 0 ? 'Articles (Queue Clear)' : 'Articles Pending'}
            </Text>
          </TouchableOpacity>

          {/* 2. Revision Requests */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Article', {initialTab: 'Revision'})}
            activeOpacity={0.85}>
            <View style={styles.kpiCardHeader}>
              <View
                style={[
                  styles.kpiIconWrap,
                  {backgroundColor: '#FFFBEB', borderColor: '#FDE68A'},
                ]}>
                <MaterialCommunityIcons
                  name="file-document-edit-outline"
                  size={20}
                  color="#D97706"
                />
              </View>
              <View style={[styles.kpiBadge, {backgroundColor: '#FEF3C7'}]}>
                <Text style={[styles.kpiBadgeText, {color: '#B45309'}]}>
                  REVISION
                </Text>
              </View>
            </View>
            <Text style={[styles.kpiNumber, {color: colors.textPrimary}]}>
              {isImprovementsLoading ? '...' : improvementsCount}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textSecondary}]}>
              {improvementsCount === 0 ? 'Revision (Queue Clear)' : 'Revision Pending'}
            </Text>
          </TouchableOpacity>

          {/* 3. Podcasts */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Podcast')}
            activeOpacity={0.85}>
            <View style={styles.kpiCardHeader}>
              <View
                style={[
                  styles.kpiIconWrap,
                  {backgroundColor: '#EEF2FF', borderColor: '#C7D2FE'},
                ]}>
                <Ionicons name="mic" size={20} color="#4F46E5" />
              </View>
              <View style={[styles.kpiBadge, {backgroundColor: '#E0E7FF'}]}>
                <Text style={[styles.kpiBadgeText, {color: '#4338CA'}]}>
                  AUDIO
                </Text>
              </View>
            </View>
            <Text style={[styles.kpiNumber, {color: colors.textPrimary}]}>
              {isPodcastsLoading ? '...' : podcastsCount}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textSecondary}]}>
              {podcastsCount === 0 ? 'Episodes (Queue Clear)' : 'Episodes Pending'}
            </Text>
          </TouchableOpacity>

          {/* 4. Reports */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Report')}
            activeOpacity={0.85}>
            <View style={styles.kpiCardHeader}>
              <View
                style={[
                  styles.kpiIconWrap,
                  {backgroundColor: '#FEF2F2', borderColor: '#FECACA'},
                ]}>
                <MaterialCommunityIcons name="shield-alert" size={20} color="#DC2626" />
              </View>
              <View style={[styles.kpiBadge, {backgroundColor: '#FEE2E2'}]}>
                <Text style={[styles.kpiBadgeText, {color: '#B91C1C'}]}>
                  SAFETY
                </Text>
              </View>
            </View>
            <Text style={[styles.kpiNumber, {color: colors.textPrimary}]}>
              {isReportsLoading ? '...' : reportsCount}
            </Text>
            <Text style={[styles.kpiLabel, {color: colors.textSecondary}]}>
              {reportsCount === 0 ? 'Reports (Queue Clear)' : 'Reports Pending'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* QUICK ACTIONS ROW (iStaffrota Action Ribbon)                     */}
        {/* ============================================================== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Article')}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIconWrap, {backgroundColor: '#ECFEFF'}]}>
              <Ionicons name="search" size={20} color="#0891B2" />
            </View>
            <Text style={[styles.quickActionLabel, {color: colors.textPrimary}]}>
              Claim Article
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Report')}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIconWrap, {backgroundColor: '#FEF2F2'}]}>
              <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.quickActionLabel, {color: colors.textPrimary}]}>
              Resolve Dispute
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('WorkHistoryScreen')}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIconWrap, {backgroundColor: '#ECFDF5'}]}>
              <Feather name="check-circle" size={19} color="#059669" />
            </View>
            <Text style={[styles.quickActionLabel, {color: colors.textPrimary}]}>
              Work Record
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}>
            <View style={[styles.quickActionIconWrap, {backgroundColor: '#EEF2FF'}]}>
              <Ionicons name="bar-chart-outline" size={20} color="#4F46E5" />
            </View>
            <Text style={[styles.quickActionLabel, {color: colors.textPrimary}]}>
              My Activity
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* IN-PROGRESS DUTIES (Assigned specifically to this reviewer)     */}
        {/* ============================================================== */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.dutyTitleRow}>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>
              My Active Reviews
            </Text>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{inProgressList.length}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Article')}
            style={styles.viewAllBtn}
            activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All Queue</Text>
            <Feather name="arrow-right" size={15} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>

        {inProgressList.length > 0 ? (
          <View style={styles.tasksList}>
            {inProgressList.slice(0, 3).map((article: ArticleData) => (
              <TouchableOpacity
                key={article._id}
                style={[
                  styles.activeTaskCard,
                  {backgroundColor: colors.cardBg, borderColor: colors.border},
                ]}
                onPress={() =>
                  navigation.navigate('ArticleReviewScreen', {
                    articleId: Number(article._id),
                    authorId: article.authorId,
                    destination: article.status,
                    recordId: article.pb_recordId,
                  })
                }
                activeOpacity={0.85}>
                <View style={styles.taskCardHeader}>
                  <View style={styles.statusPillInProgress}>
                    <View style={styles.statusDotInProgress} />
                    <Text style={styles.statusTextInProgress}>UNDER REVIEW</Text>
                  </View>
                  <Text style={[styles.taskCardDate, {color: colors.textMuted}]}>
                    Active
                  </Text>
                </View>

                <Text
                  style={[styles.taskTitle, {color: colors.textPrimary}]}
                  numberOfLines={2}>
                  {article.title || 'Untitled Clinical Article'}
                </Text>

                <View style={styles.taskMetaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-circle-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.metaText, {color: colors.textSecondary}]} numberOfLines={1}>
                      {article.authorName || 'Author'}
                    </Text>
                  </View>

                  <View style={styles.continueReviewAction}>
                    <Text style={styles.continueReviewText}>Continue Review</Text>
                    <Feather name="arrow-right" size={16} color={PRIMARY_COLOR} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.emptyStateCard,
              {backgroundColor: colors.cardBg, borderColor: colors.border},
            ]}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="checkmark-done-circle" size={36} color="#10B981" />
            </View>
            <Text style={[styles.emptyStateTitle, {color: colors.textPrimary}]}>
              Queue Clear!
            </Text>
            <Text style={[styles.emptyStateBody, {color: colors.textMuted}]}>
              You have no active reviews in progress. Tap below to claim a clinical article.
            </Text>
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => navigation.navigate('Article')}
              activeOpacity={0.85}>
              <Text style={styles.claimButtonText}>Browse Available Articles</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 140, // Clearance for floating bottom TabBar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameBlock: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  roleChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  moderatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  moderatorBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  superAdminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  superAdminBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4338CA',
    letterSpacing: 0.6,
  },
  guestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  guestPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.6,
  },
  guestModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  guestBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  guestBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  guestBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },
  guestBannerSubtitle: {
    fontSize: 11.5,
    color: '#0284C7',
    marginTop: 1,
  },
  exitGuestButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  exitGuestButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...CLINICAL_SHADOW_SUBTLE,
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Executive Section (Super Admin) - Clean Clinical Indigo Palette
  executiveBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    padding: 16,
    marginBottom: hp(2.5),
    borderWidth: 1,
    borderColor: '#C7D2FE',
    ...CLINICAL_SHADOW,
  },
  executiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  executiveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  executiveTitle: {
    color: '#312E81',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  manageButton: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  manageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  manageButtonText: {
    color: '#4338CA',
    fontSize: 12.5,
    fontWeight: '700',
  },
  executiveGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  executiveCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    ...CLINICAL_SHADOW_SUBTLE,
  },
  executiveCardIconWrap: {
    marginBottom: 6,
  },
  executiveMetricNumber: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },
  executiveMetricLabel: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },

  // KPI Section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp(2.5),
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    ...CLINICAL_SHADOW_SUBTLE,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  kpiBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  kpiNumber: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  kpiLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    marginTop: 3,
  },

  // Quick Action Row
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2.5),
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    ...CLINICAL_SHADOW_SUBTLE,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Active Tasks
  dutyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countPill: {
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  tasksList: {
    gap: 10,
    marginBottom: hp(2),
  },
  activeTaskCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    ...CLINICAL_SHADOW_SUBTLE,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusPillInProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 5,
  },
  statusDotInProgress: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0891B2',
  },
  statusTextInProgress: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0891B2',
    letterSpacing: 0.5,
  },
  taskCardDate: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 23,
    marginBottom: 10,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '55%',
  },
  metaText: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  continueReviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  continueReviewText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },

  // Empty State Card
  emptyStateCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    ...CLINICAL_SHADOW_SUBTLE,
  },
  emptyIconWrap: {
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyStateBody: {
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  claimButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
