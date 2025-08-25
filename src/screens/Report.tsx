import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
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
import ReportCard from '../components/ReportCard';
import Snackbar from 'react-native-snackbar';
import Loader from '../components/Loader';
import ReasonItemCard from '../components/ReasonItemCard';
import AddTagModal from '../components/AddTagModal';

export default function ReportScreen({navigation}) {
  const {user_token} = useSelector((state: any) => state.user);

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
  const {
    refetch: pendingReportFetch,
    isLoading: isPendingReportLoading,
  } = useQuery({
    queryKey: ['get-pending-reports', pendingPage],
    queryFn: async () => {
      const response = await axios.get(`${GET_PENDING_REPORTS}?page=${pendingPage}`);
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
    enabled: !!user_token,
  });

  //console.log('Pending Reports', pendingReports);
  const {
    refetch: refetchAssignReports,
    isLoading: isRefetchAssignReportLoading,
  } = useQuery({
    queryKey: ['get-assigned-reports', assignReportPage],
    queryFn: async () => {
      const response = await axios.get(`${GET_ASSIGNED_REPORTS}?page=${assignReportPage}`);

      if(Number(assignReportPage) === 1){

        let pages = response.data.totalPages;
        setTotalAssignReportPage(pages);

        if(response.data.reports){
          setAssignedReports(response.data.reports);
        }
      }else{
        const d = assignedReports;
        const newData = response.data.reports;
        setAssignedReports([...d,...newData]);
      }

      return response.data.reports as Report[];
    },
  });

  // console.log("Assigned Reports", assignedReports);

  const {
    data: reportReasons,
    refetch: refetchReportReasons,
    isLoading: reportReasonLoading,
  } = useQuery({
    queryKey: ['get-report-reasons'],
    queryFn: async () => {
      const response = await axios.get(`${GET_REPORT_REASONS}`);
      return response.data as Report[];
    },
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

  if (
    addReasonMutation.isPending ||
    updateReasonMutation.isPending ||
    deleteReasonMutation.isPending ||
    isPendingReportLoading ||
    isRefetchAssignReportLoading ||
    reportReasonLoading ||
    takeOverReportMutation.isPending
  ) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          //initialIndex={0}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          <Tabs.Tab name="Reasons">
            <View style={{flex: 1}}>
              <View style={styles.reasonTabContainer}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    setAddTagModalVisible(true);
                  }}>
                  <Text style={styles.addButtonText}>+ Add New Reason</Text>
                </TouchableOpacity>

                <Tabs.FlatList
                  data={reportReasons ? reportReasons : []}
                  keyExtractor={item => item._id}
                  refreshing={reasonRefresh}
                  onRefresh={onReportReasonRefresh}
                  renderItem={({item}: {item: Reason}) => (
                    <ReasonItemCard
                      reason={item}
                      onEditAction={(item: Reason) => {
                        setSelectedReason(item);
                        setAddTagModalVisible(true);
                      }}
                      onDeleteAction={(item: Reason) => {
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
                    <View style={styles.emptyContainer}>
                      <Image
                        source={require('../../assets/identify-audience.png')}
                        style={styles.image}
                      />
                      <Text style={styles.message}>No reason found</Text>
                    </View>
                  }
                />
              </View>
            </View>
          </Tabs.Tab>

          <Tabs.Tab name="Pending">
            <View style={{flex: 1}}>
              <Tabs.FlatList
                data={pendingReports ? pendingReports : []}
                keyExtractor={item => item._id}
                refreshing={isPendingReportLoading}
                onRefresh={()=>{
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
                  <View style={styles.emptyContainer}>
                    <Image
                      source={require('../../assets/identify-audience.png')}
                      style={styles.image}
                    />
                    <Text style={styles.message}>No report found</Text>
                  </View>
                }
                //contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                onEndReached={()=>{
                  if (pendingPage < totalPendingPage) {
                    setPendingPage(pendingPage + 1);
                    //pendingReportFetch();
                  }
                }}
                onEndReachedThreshold={0.5}
              />
            </View>
          </Tabs.Tab>

          <Tabs.Tab name="Assigned">
            <View style={{flex: 1}}>
              <Tabs.FlatList
                data={assignedReports ? assignedReports : []}
                keyExtractor={item => item._id}
                refreshing={isRefetchAssignReportLoading}
                onRefresh={()=>{
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
                  <View style={styles.emptyContainer}>
                    <Image
                      source={require('../../assets/identify-audience.png')}
                      style={styles.image}
                    />
                    <Text style={styles.message}>No Report Found</Text>
                  </View>
                }
                onEndReached={()=>{
                  if(assignReportPage < totalAssignReportPage){
                    setAssignReportPage((prev) => prev + 1);
                  }
                }}
                onEndReachedThreshold={0.5}
                //contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Tabs.Tab>
        </Tabs.Container>

        <AddTagModal
          type={2}
          reason={selectedReason}
          tag={null}
          visible={addTagModalVisible}
          onTagChange={() => {}}
          onReasonChange={(reason, name) => {
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
    fontSize: 16,
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
    paddingBottom: hp(5),
    paddingTop: hp(1),
    gap: hp(1.5),
  },
});
