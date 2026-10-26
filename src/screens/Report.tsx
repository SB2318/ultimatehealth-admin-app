import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {
  BUTTON_COLOR,
  ON_PRIMARY_COLOR,
  PRIMARY_COLOR,
  BORDER_COLOR,
  DARK_THEME,
  SCREEN_BG,
} from '../helper/Theme';
import React, {useRef, useState} from 'react';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import {useSelector} from 'react-redux';
import {useCallback} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp, wp} from '../helper/Metric';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  ADD_REASON,
  DELETE_REASON,
  GET_ASSIGNED_REPORTS,
  GET_PENDING_REPORTS,
  GET_REPORT_REASONS,
  PICK_REPORT,
  UPDATE_REASON,
} from '../helper/APIUtils';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {Reason, Report, reportActionEnum} from '../type';
import {getFallbackReports} from '../helper/DemoData';
import ReportCard from '../components/ReportCard';
import Snackbar from 'react-native-snackbar';
import Loader from '../components/Loader';
import ReasonItemCard from '../components/ReasonItemCard';
import AddTagModal from '../components/AddTagModal';
import EmptyState from '../components/EmptyState';
import {MaterialIcons} from '@expo/vector-icons';

export default function ReportScreen({navigation}) {
  const {user_token, isSuperAdmin, isGuest} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  //const bottomBarHeight = useBottomTabBarHeight();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null);
  const [addTagModalVisible, setAddTagModalVisible] = useState<boolean>(false);
  const [reasonRefresh, setReasonRefresh] = useState<boolean>(false);

  const [pendingPage, setPendingPage] = useState(1);
  const [totalPendingPage, setTotalPendingPage] = useState(0);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);

  const [assignReportPage, setAssignReportPage] = useState(1);
  const [totalAssignReportPage, setTotalAssignReportPage] = useState(0);
  const [assignedReports, setAssignedReports] = useState<Report[]>([]);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const onAddTagModalClose = () => {
    setAddTagModalVisible(false);
    setSelectedReason(null);
  };
  const {refetch: pendingReportFetch, isLoading: isPendingReportLoading} =
    useQuery({
      queryKey: ['get-pending-reports', pendingPage],
      queryFn: async () => {
        const response = await axios.get(
          `${GET_PENDING_REPORTS}?page=${pendingPage}`,
        );
        if (Number(pendingPage) === 1) {
          if (response.data.totalPages) {
            setTotalPendingPage(response.data.totalPages);
          }
          if (response.data.pendingReports) {
            setPendingReports(response.data.pendingReports);
          }
        } else {
          if (response.data.pendingReports) {
            let d = response.data.pendingReports as Report[];
            setPendingReports([...pendingReports, ...d]);
          }
        }
        return response.data.pendingReports as Report[];
      },
      enabled: !!user_token && !!isConnected,
    });

  //console.log('Pending Reports', pendingReports);
  const {
    refetch: refetchAssignReports,
    isLoading: isRefetchAssignReportLoading,
  } = useQuery({
    queryKey: ['get-assigned-reports', assignReportPage],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_ASSIGNED_REPORTS}?page=${assignReportPage}`,
      );

      if (Number(assignReportPage) === 1) {
        let pages = response.data.totalPages;
        setTotalAssignReportPage(pages);

        if (response.data.reports) {
          setAssignedReports(response.data.reports);
        }
      } else {
        const d = assignedReports;
        const newData = response.data.reports;
        setAssignedReports([...d, ...newData]);
      }

      return response.data.reports as Report[];
    },
    enabled: !!isConnected && !!user_token,
  });

  // console.log("Assigned Reports", assignedReports);

  const fallbackReasons: Reason[] = [
    {_id: 'reason-1', reason: 'Misleading or Inaccurate Medical Claims', status: 'active'},
    {_id: 'reason-2', reason: 'Unverified Clinical Sources / Plagiarism', status: 'active'},
    {_id: 'reason-3', reason: 'Inappropriate or Offensive Language', status: 'active'},
    {_id: 'reason-4', reason: 'Commercial Promotion / Spam Content', status: 'active'},
    {_id: 'reason-5', reason: 'Potential Patient Privacy (HIPAA) Violation', status: 'active'},
  ];

  const {
    data: reportReasons,
    refetch: refetchReportReasons,
    isLoading: reportReasonLoading,
  } = useQuery({
    queryKey: ['get-report-reasons'],
    queryFn: async () => {
      const response = await axios.get(`${GET_REPORT_REASONS}`, {
        headers: user_token ? {Authorization: `Bearer ${user_token}`} : {},
      });
      const data = response.data;
      if (Array.isArray(data)) return data as Reason[];
      if (Array.isArray(data?.reasons)) return data.reasons as Reason[];
      if (Array.isArray(data?.data)) return data.data as Reason[];
      if (Array.isArray(data?.reportReasons)) return data.reportReasons as Reason[];
      return [] as Reason[];
    },
    enabled: !!isConnected && !!user_token,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  const onReportReasonRefresh = () => {
    setReasonRefresh(true);
    refetchReportReasons();
    setReasonRefresh(false);
  };
  // console.log("Report reaons", reportReasons)

  const takeOverReportMutation = useMutation({
    mutationKey: ['takeOverReport'],
    mutationFn: async (reportId: string) => {
      const res = await axios.post(`${PICK_REPORT}`, {
        reportId: reportId,
      });

      return res.data as any;
    },
    onSuccess: () => {
      Snackbar.show({
        text: 'Report taken over successfully',
        duration: Snackbar.LENGTH_SHORT,
      });
      pendingReportFetch();
      refetchAssignReports();
    },

    onError: err => {
      Snackbar.show({
        text: 'Failed to take over report',
        duration: Snackbar.LENGTH_SHORT,
      });
      console.log('Report taken over report', err);
    },
  });

  const onViewContent = (report: Report) => {
    if (report.commentId) {
      navigation.navigate('CommentScreen', {
        articleId: report.articleId._id,
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
    if (report.action_taken === reportActionEnum.PENDING) {
      if (!isConnected) {
        Snackbar.show({
          text: 'You are currently offline',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }
      Alert.alert(
        'Take Over Report',
        'Are you sure you want to take over this report? Once you do, you are expected to complete the action.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => takeOverReportMutation.mutate(report._id),
            style: 'destructive',
          },
        ],
      );
    } else {
      navigation.navigate('ReportActionScreen', {
        reportId: report._id,
        report_admin_id: report.admin_id,
      });
    }
  };

  const addReasonMutation = useMutation({
    mutationKey: ['add-reason-mutation-key'],
    mutationFn: async (reason: string) => {
      const res = await axios.post(`${ADD_REASON}`, {
        reason: reason,
      });

      //console.log("Tag res", res);
      return res.data as Reason;
    },
    onSuccess: (data: Reason) => {
      //setArticleCategories(prev => [data, ...prev]);
      refetchReportReasons();
      Snackbar.show({
        text: 'Reason added',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Error adding reason',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const updateReasonMutation = useMutation({
    mutationKey: ['update-reason-mutation-key'],
    mutationFn: async ({reason, id}: {reason: string; id: string}) => {
      const res = await axios.put(`${UPDATE_REASON}`, {
        id: id,
        reason: reason,
      });

      return res.data as Reason;
    },
    onSuccess: (data: Reason) => {
      refetchReportReasons();
      Snackbar.show({
        text: 'Reason updated',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
    onError: error => {
      console.log(error);
      Snackbar.show({
        text: 'Error updating reason',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const deleteReasonMutation = useMutation({
    mutationKey: ['delete-reason-mutation-key'],
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${DELETE_REASON}/${id}`);

      return res.data.data as Reason;
    },
    onSuccess: (data: Reason) => {
      refetchReportReasons();

      Snackbar.show({
        text: 'Reason deleted',
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
          fontSize: 15.5,
          fontWeight: '700',
          textTransform: 'capitalize',
          letterSpacing: 0.2,
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

  if (
    isPendingReportLoading ||
    isRefetchAssignReportLoading ||
    reportReasonLoading ||
    takeOverReportMutation.isPending
  ) {
    return <Loader />;
  }

  const effectivePendingReports = isGuest ? getFallbackReports(pendingReports) : pendingReports;
  const effectiveAssignedReports = isGuest ? getFallbackReports(assignedReports) : assignedReports;
  const effectiveReasons = (reportReasons && reportReasons.length > 0) ? reportReasons : (isGuest ? fallbackReasons : []);

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          initialTabName="Pending"
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          <Tabs.Tab name="Pending" label="Pending">
            <Tabs.FlatList
              data={effectivePendingReports}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.reportListContent}
              refreshing={isPendingReportLoading}
              onRefresh={() => {
                setPendingPage(1);
                pendingReportFetch();
              }}
              renderItem={({item}) => (
                <ReportCard
                  report={item}
                  onTakeActionReport={onTakeActionReport}
                  onViewContent={onViewContent}
                />
              )}
              ListEmptyComponent={
                <EmptyState
                  icon="shield"
                  title="All Reports Cleared"
                  subtitle="There are no reported articles or comments awaiting investigation."
                />
              }
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (pendingPage < totalPendingPage) {
                  setPendingPage(pendingPage + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </Tabs.Tab>

          <Tabs.Tab name="Assigned" label="Assigned">
            <Tabs.FlatList
              data={effectiveAssignedReports}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.reportListContent}
              refreshing={isRefetchAssignReportLoading}
              onRefresh={() => {
                setAssignReportPage(1);
                refetchAssignReports();
              }}
              renderItem={({item}) => (
                <ReportCard
                  report={item}
                  onViewContent={onViewContent}
                  onTakeActionReport={onTakeActionReport}
                />
              )}
              ListEmptyComponent={
                <EmptyState
                  icon="check-circle"
                  title="No Assigned Reports"
                  subtitle="Take over a pending report from the queue to process clinical actions."
                />
              }
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (assignReportPage < totalAssignReportPage) {
                  setAssignReportPage(assignReportPage + 1);
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </Tabs.Tab>

          {isSuperAdmin ? (
            <Tabs.Tab name="Reasons" label="Reasons">
              <Tabs.FlatList
                data={effectiveReasons}
                keyExtractor={item => item._id}
                refreshing={reasonRefresh}
                onRefresh={onReportReasonRefresh}
                ListHeaderComponent={
                  <View style={styles.actionHeaderContainer}>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        setSelectedReason(null);
                        setAddTagModalVisible(true);
                      }}>
                      <Text style={styles.addButtonText}>+ Add New Reason</Text>
                    </TouchableOpacity>
                  </View>
                }
                renderItem={({item}: {item: Reason}) => (
                  <ReasonItemCard
                    reason={item}
                    onEditAction={(item: Reason) => {
                      setSelectedReason(item);
                      setAddTagModalVisible(true);
                    }}
                    onDeleteAction={(item: Reason) => {
                      if (!isConnected) {
                        Snackbar.show({
                          text: 'You are currently offline',
                          duration: Snackbar.LENGTH_SHORT,
                        });
                        return;
                      }
                      Alert.alert(
                        'Alert!',
                        'Are you sure you want to delete this reason?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Confirm',
                            onPress: () =>
                              deleteReasonMutation.mutate(item._id),
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
                    icon="alert-circle"
                    title="No Reasons Configured"
                    subtitle="Configure report reasons for users to flag policy violations."
                  />
                }
              />
            </Tabs.Tab>
          ) : null}
        </Tabs.Container>

        <AddTagModal
          type={2}
          reason={selectedReason}
          mode={selectedReason ? 'edit' : 'add'}
          tag={null}
          visible={addTagModalVisible}
          onTagChange={() => {}}
          onReasonChange={(reason, name) => {
            if (!isConnected) {
              Snackbar.show({
                text: 'You are currently offline',
                duration: Snackbar.LENGTH_SHORT,
              });
              return;
            }
            if (reason) {
              updateReasonMutation.mutate({
                reason: name,
                id: reason._id,
              });
            } else {
              addReasonMutation.mutate(name);
            }
          }}
          onDismiss={onAddTagModalClose}
        />

        {/**
         *
         *  <FilterModal
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
          icon={() => <AntDesign color="white" name="menu-fold" size={25} />}
          onPress={() => {
            //navigation.goBack();
            handlePresentModalPress();
          }}
        />
         */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  innerContainer: {
    flex: 1,
    marginBottom: hp(10),
  },
  tabsContainer: {
    // backgroundColor: 'white',
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
    //color: 'black',
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
    color: '#6A89A7',
    fontWeight: '500',
    marginTop: hp(1),
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

  nocontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ON_PRIMARY_COLOR,
  },
  text: {
    fontSize: 20,
    color: '#000',
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
  reportListContent: {
    paddingTop: 16,
    paddingBottom: hp(14),
  },

  addButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#2563EB',
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
});
