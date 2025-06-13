import {View, Text, StyleSheet, Alert} from 'react-native';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {useRef} from 'react';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import {useSelector} from 'react-redux';
import {useCallback} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp} from '../helper/Metric';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  GET_ASSIGNED_REPORTS,
  GET_PENDING_REPORTS,
  PICK_REPORT,
} from '../helper/APIUtils';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {Report, reportActionEnum} from '../type';
import ReportCard from '../components/ReportCard';
import Snackbar from 'react-native-snackbar';
import Loader from '../components/Loader';

export default function ReportScreen({navigation}) {
  const {user_id} = useSelector((state: any) => state.user);

  //const bottomBarHeight = useBottomTabBarHeight();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const {
    data: pendingReports,
    refetch: pendingReportFetch,
    isLoading: isPendingReportLoading,
  } = useQuery({
    queryKey: ['get-pending-reports'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PENDING_REPORTS}`);
      //let d = response.data as ArticleData[];
      //updateAvailableArticles(d);
      return response.data as Report[];
    },
  });

  //console.log('Pending Reports', pendingReports);
  const {
    data: assignedReports,
    refetch: refetchAssignReports,
    isLoading: isRefetchAssignReportLoading,
  } = useQuery({
    queryKey: ['get-assigned-reports'],
    queryFn: async () => {
      const response = await axios.get(`${GET_ASSIGNED_REPORTS}`);

      return response.data as Report[];
    },
  });

  const {
    data: reportReasons,
    refetch: refetchReportReasons,
    isLoading: reportReasonLoading,
  } = useQuery({
    queryKey: ['get-report-reasons'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PENDING_REPORTS}`);
      return response.data as Report[];
    },
  });

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
      // Take action on assign report frontend part --> upcoming
    }
  };

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
            <Tabs.ScrollView contentContainerStyle={styles.nocontainer}>
              <Text style={styles.text}>Reasons</Text>
            </Tabs.ScrollView>
          </Tabs.Tab>

          <Tabs.Tab name="Pending">
            <View style={{flex: 1}}>
              <Tabs.FlatList
                data={pendingReports}
                keyExtractor={item => item._id}
                renderItem={({item}) => (
                  <ReportCard
                    report={item}
                    onTakeActionReport={onTakeActionReport}
                    onViewContent={onViewContent}
                  />
                )}
                //contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Tabs.Tab>

          <Tabs.Tab name="Assigned">
            <View style={{flex: 1}}>
              <Tabs.FlatList
                data={assignedReports}
                keyExtractor={item => item._id}
                renderItem={({item}) => <ReportCard report={item} />}
                //contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Tabs.Tab>
        </Tabs.Container>

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
});
