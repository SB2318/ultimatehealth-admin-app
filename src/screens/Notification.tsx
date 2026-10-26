import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import {Feather, Ionicons} from '@expo/vector-icons';

import {PRIMARY_COLOR, PRIMARY_DARK, SCREEN_BG, CARD_BG, BORDER_COLOR, TEXT_PRIMARY, TEXT_SECONDARY} from '../helper/Theme';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import {NotificationD, NotificationProps, NotificationType} from '../type';
import {PROD_URL} from '../helper/APIUtils';
import {DEMO_NOTIFICATIONS, getFallbackNotifications} from '../helper/DemoData';

const NotificationScreen = ({navigation}: NotificationProps) => {
  const {user_token, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notificationsData, setNotificationsData] = useState<NotificationD[]>(
    isGuest ? DEMO_NOTIFICATIONS : []
  );

  const queryClient = useQueryClient();

  const {isLoading, refetch} = useQuery({
    queryKey: ['get-all-notifications', page, isGuest],
    queryFn: async () => {
      if (isGuest) {
        setNotificationsData(DEMO_NOTIFICATIONS);
        setTotalPages(1);
        return DEMO_NOTIFICATIONS;
      }

      try {
        const response = await axios.get(
          `${PROD_URL}/notifications?role=1&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );

        if (Number(page) === 1) {
          if (response.data.totalPages) {
            setTotalPages(response.data.totalPages);
          }
          const notifs = response.data.notifications || [];
          const resolved = getFallbackNotifications(notifs);
          setNotificationsData(resolved);
          return resolved;
        } else {
          const oldNotif = notificationsData ?? [];
          const combined = [...oldNotif, ...(response.data.notifications || [])];
          setNotificationsData(combined);
          return combined;
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        const fallback = getFallbackNotifications();
        setNotificationsData(fallback);
        return fallback;
      }
    },
    enabled: isGuest || (isConnected && !!user_token && !!page),
  });

  const markNotificationMutation = useMutation({
    mutationKey: ['mark-notification-as-read'],
    mutationFn: async () => {
      if (isGuest || !user_token) return;
      const res = await axios.put(
        `${PROD_URL}/notifications/mark-as-read?role=1`,
        {role: 1},
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data;
    },
    onSuccess: async () => {
      queryClient.setQueryData(['unread-notifications'], 0);
      queryClient.invalidateQueries({queryKey: ['unread-notifications']});
    },
    onError: error => {
      console.log('Error marking notifications read:', error);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationKey: ['delete-notification-by-id'],
    mutationFn: async ({id}: {id: string}) => {
      if (isGuest || !user_token) return;
      const res = await axios.delete(`${PROD_URL}/notification/${id}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return res.data;
    },
    onSuccess: async () => {
      refetch();
      Snackbar.show({
        text: 'Notification deleted',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: error => {
      console.log('Delete notification error:', error);
      Snackbar.show({
        text: 'Could not delete notification',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  useEffect(() => {
    if (isGuest) {
      setNotificationsData(DEMO_NOTIFICATIONS);
      return;
    }
    if (isConnected && user_token) {
      markNotificationMutation.mutate();
    }
  }, [isGuest, isConnected, user_token]);

  const onRefresh = () => {
    setRefreshing(true);
    if (isGuest) {
      setNotificationsData(DEMO_NOTIFICATIONS);
      setRefreshing(false);
      return;
    }
    refetch();
    setRefreshing(false);
  };

  const handleClickAction = (item: NotificationD) => {
    if (
      item.type === NotificationType.ArticleComment ||
      item.type === NotificationType.ArticleSubmitToAdmin
    ) {
      if (item.articleId) {
        navigation.navigate('ArticleReviewScreen', {
          articleId:
            typeof item.articleId._id === 'number'
              ? item.articleId._id
              : parseInt(String(item.articleId._id), 10) || 901,
          authorId: item.articleId.authorId,
          destination: item.articleId.status,
          recordId: item.articleId?.pb_recordId,
        });
      }
    } else if (
      item.type === NotificationType.RevisionSubmitToAdmin ||
      item.type === NotificationType.EditRequestComment
    ) {
      if (item.revisonId) {
        navigation.navigate('ImprovementReviewScreen', {
          requestId: item.revisonId?._id,
          authorId: item.revisonId?.user_id,
          destination: item.revisonId?.status,
          recordId: item.revisonId?.pb_recordId,
          articleRecordId: item.revisonId?.article_recordId,
        });
      }
    }
  };

  const handleDeleteAction = (item: NotificationD) => {
    if (isGuest) {
      setNotificationsData(prev => prev?.filter(n => n._id !== item._id));
      Snackbar.show({
        text: 'Notification dismissed (Guest Mode)',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    deleteNotificationMutation.mutate({
      id: item?._id,
    });
  };

  const renderItem = ({item}: {item: NotificationD}) => (
    <NotificationItem
      item={item}
      handleDeleteAction={handleDeleteAction}
      handleClick={handleClickAction}
    />
  );

  if (isLoading && (!notificationsData || notificationsData.length === 0)) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Guest Mode Indicator */}
      {isGuest && (
        <View style={styles.guestBanner}>
          <Feather name="info" size={14} color="#0284C7" />
          <Text style={styles.guestBannerText}>
            Guest Mode • Simulated Peer Review Notifications
          </Text>
        </View>
      )}

      {/* Notification List */}
      <FlatList
        data={notificationsData}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.flatListContentContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="notifications-off-outline"
              badge="Inbox Clean"
              title="No Notifications"
              subtitle="All clinical submissions and peer-review updates have been addressed."
              actionText={isGuest ? 'Reset Demo Notifications' : undefined}
              onAction={
                isGuest ? () => setNotificationsData(DEMO_NOTIFICATIONS) : undefined
              }
            />
          </View>
        }
        onEndReached={() => {
          if (!isGuest && page < totalPages) {
            setPage(prev => prev + 1);
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BAE6FD',
    gap: 8,
  },
  guestBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyWrap: {
    paddingTop: 50,
  },
});
