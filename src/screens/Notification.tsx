import {Alert, FlatList, StyleSheet, Text} from 'react-native';
import React, {useEffect} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import NotificationItem from '../components/NotificationItem';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {YStack} from 'tamagui';
import {NotificationD, NotificationProps, NotificationType} from '../type';
import {BellOff} from '@tamagui/lucide-icons';
import Loader from '../components/Loader';
import Snackbar from 'react-native-snackbar';
import {hp} from '../helper/Metric';
import {PROD_URL} from '../helper/APIUtils';
import {SafeAreaView} from 'react-native-safe-area-context';

// PodcastsScreen component displays the list of podcasts and includes a PodcastPlayer
const NotificationScreen = ({navigation}: NotificationProps) => {
  //const notifications = [];
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const {isConnected} = useSelector((state: any) => state.network);
  const [notificationsData, setNotificationsData] =
    React.useState<NotificationD[]>();

  const dispatch = useDispatch();

  // console.log(user_token);
  //  console.log('user_token');

  const {isLoading, refetch} = useQuery({
    queryKey: ['get-all-notifications', page],
    queryFn: async () => {
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
            const totalPage = response.data.totalPages;
            setTotalPages(totalPage);
          }
          setNotificationsData(response.data.notifications);
        } else {
          const oldNotif = notificationsData ?? [];
          setNotificationsData([...oldNotif, ...response.data.notifications]);
        }
        // console.log('Notification Response', response);
        return response.data.notifications as Notification[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
    enabled: isConnected && !!user_token && !!page,
  });

  // Mark Notification as read api integration
  const markNotificationMutation = useMutation({
    mutationKey: ['mark-notification-as-read'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        // dispatch(
        //   showAlert({
        //     title: 'Error!',
        //     message: 'No token found',
        //   }),
        // );
        return;
      }
      const res = await axios.put(
        `${PROD_URL}/notifications/mark-as-read?role=1`,
        {
          role: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data as any;
    },
    onSuccess: async () => {
      //success();

      Snackbar.show({
        text: 'All notifications marked as read',
        duration: Snackbar.LENGTH_SHORT,
      });
    },

    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Internal server error, cannot mark the notification as read!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationKey: ['delete-notification-by-id'],
    mutationFn: async ({id}: {id: string}) => {
      if (user_token === '') {
        Alert.alert('No token found');
        // dispatch(
        //   showAlert({
        //     title: 'Error!',
        //     message: 'No token found',
        //   }),
        // );
        return;
      }
      const res = await axios.delete(
        `${PROD_URL}/notification/${id}`,

        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data as any;
    },
    onSuccess: async () => {
      //success();
      refetch();
      Snackbar.show({
        text: 'Notification deleted',
        duration: Snackbar.LENGTH_SHORT,
      });
    },

    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Internal server error, failed to delete notification!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  useEffect(() => {

    if(isConnected){
     markNotificationMutation.mutate();
    }
   

    return () => {};
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
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
          articleId: parseInt(item.articleId._id, 10),
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

  const renderItem = ({item}: {item: NotificationD}) => {
    return (
      <NotificationItem
        item={item}
        handleDeleteAction={handleDeleteAction}
        handleClick={handleClickAction}
      />
    );
  };

  const handleDeleteAction = (item: NotificationD) => {
    console.log('Notification ID', item?._id);
    deleteNotificationMutation.mutate({
      id: item?._id,
    });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    // Main container
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notificationsData}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
        contentContainerStyle={styles.flatListContentContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <YStack style={styles.emptyContainer} alignItems="center">
            <BellOff size={64} color="#9CA3AF" />

            <Text style={styles.message}>No Notifications Found</Text>
          </YStack>
        }
        onEndReached={() => {
          if (page < totalPages) {
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
    backgroundColor: ON_PRIMARY_COLOR,
    justifyContent: 'center',
    //marginTop: 16,
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // paddingBottom: hp(3),
  },
  content: {
    marginTop: hp(3),
    paddingHorizontal: 16,
  },
  recentPodcastsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentPodcastsTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },

  message: {
    fontSize: 16,
    marginTop: hp(2),
    color: '#000',
    fontFamily: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    top: 70,
  },

  flatListContentContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    paddingBottom: 120,
  },
  emptyImgStyle: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
});
