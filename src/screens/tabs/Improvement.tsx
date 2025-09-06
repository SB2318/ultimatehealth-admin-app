import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DISCARD_IMPROVEMENT,
  GET_AVAILABLE_IMPROVEMENTS,
  GET_PROGRESS_IMPROVEMENTS,
  PICK_IMPROVEMENT,
  UNASSIGN_IMPROVEMENT,
} from '../../helper/APIUtils';
import {EditRequest} from '../../type';
import React, {useCallback, useState} from 'react';
import {hp} from '../../helper/Metric';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import ImprovementCard from '../../components/ImprovementCard';
import Snackbar from 'react-native-snackbar';
import Loader from '../../components/Loader';
import {useSelector} from 'react-redux';

export default function Imrovement({
  handleNav,
}: {
  handleNav: (
    requestId: string,
    authorId: string,
    destination: string,
    recordId: string,
    articleRecordId: string
  ) => void;
}) {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const {user_id} = useSelector((state: any) => state.user);

  const [selectedCat, setSelectedCat] = useState<string>('Available');
  const categories = ['Available', 'Inprogress'];

  const[availablePage, setAvailablePage] = useState(1);
  const[totalAvailPage, setTotalAvailPage] = useState(0);
  const [availableImprovements, setAvailableImprovements] = useState<EditRequest[]>([]);

  const[progressPage, setProgressPage] = useState(1);
  const[totalProgressPage, setTotalProgressPage] = useState(0);
  const [progressImprovements, setProgressImprovements] = useState<EditRequest[]>([]);

  const {
    refetch: availableImprovementRefetch,
    isLoading: isAvailableImprovementLoading,
  } = useQuery({
    queryKey: ['get-available-improvements', availablePage],
    queryFn: async () => {
      const response = await axios.get(`${GET_AVAILABLE_IMPROVEMENTS}?page=${availablePage}`);

      console.log('response', response.data);
      if(Number(availablePage) === 1){

        if(response.data.totalPages){
          let d = response.data.totalPages;
          setTotalAvailPage(d);
        }
        if(response.data.articles){
            setAvailableImprovements(response.data.articles);
        }
      }else{
         if(response.data.articles){
           const oldData = availableImprovements;
           const newData = response.data.articles as EditRequest[];
           setAvailableImprovements([...oldData, ...newData]);
         }
      }
      return response.data.articles as EditRequest[];
    },
    //enabled: !!availablePage,
  });

  const {
    refetch: refetchProgressImprovements,
    isLoading: isProgressImprovementLoading,
  } = useQuery({
    queryKey: ['get-progress-improvements', progressPage],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROGRESS_IMPROVEMENTS}?page=${progressPage}`);

      if(Number(progressPage) === 1){

        if(response.data.totalPages){
          let d = response.data.totalPages;
          setTotalProgressPage(d);
        }
        if(response.data.articles){
            setProgressImprovements(response.data.articles);
        }
      }else{
         if(response.data.articles){
           const oldData = progressImprovements;
           const newData = response.data.articles as EditRequest[];
           setProgressImprovements([...oldData, ...newData]);
         }
      }

      return response.data.articles as EditRequest[];
    },
    enabled : !!progressPage,
  });

  const onRefresh = () => {
    setRefreshing(true);
    if(selectedCat === categories[0]){
      setAvailablePage(1);
      availableImprovementRefetch();
    }else{
      setProgressPage(1);
      refetchProgressImprovements();
    }
    setRefreshing(false);
  };

  const pickImprovementMutation = useMutation({
    mutationKey: ['pick-improvement'],
    mutationFn: async ({
      requestId,
      reviewerId,
    }: {
      requestId: string;
      reviewerId: string;
    }) => {
      const res = await axios.post(PICK_IMPROVEMENT, {
        requestId: requestId,
        reviewerId: reviewerId,
      });

      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      onRefresh();
    },
    onError: err => {
      console.log(err);
      Alert.alert('Try again!');
    },
  });

  const unassignFromImprovementMutation = useMutation({
    mutationKey: ['unassign-improvement'],

    mutationFn: async ({requestId}: {requestId: string}) => {
      const res = await axios.post(UNASSIGN_IMPROVEMENT, {
        requestId: requestId,
      });

      return res.data.message as string;
    },

    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      onRefresh();
    },

    onError: err => {
      console.log(err);
      Alert.alert('Try again');
    },
  });

  const discardImprovementMutation = useMutation({
    mutationKey: ['discard-improvement'],
    mutationFn: async ({
      requestId,
      discardReason,
    }: {
      requestId: string;
      discardReason: string;
    }) => {
      const res = await axios.post(DISCARD_IMPROVEMENT, {
        requestId: requestId,
        discardReason: discardReason,
      });

      return res.data.message as string;
    },

    onSuccess: data => {
      Snackbar.show({
        text: data,
        duration: Snackbar.LENGTH_SHORT,
      });
      onRefresh();
    },

    onError: err => {
      console.log(err);
      Alert.alert('Try again');
    },
  });

  const renderItem = useCallback(
    ({item}: {item: EditRequest}) => {
      return (

        <ImprovementCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          //navigation={navigation}
          onclick={(item: EditRequest, index: number, reason: string) => {
            if (index === 0) {
              // Pick article
              pickImprovementMutation.mutate({
                requestId: item._id,
                reviewerId: user_id,
              });
            } else if (index === 2) {
              // unassign yourself
              unassignFromImprovementMutation.mutate({
                requestId: item._id,
              });
            } else {
              // Display discard reason or screen
              discardImprovementMutation.mutate({
                requestId: item._id,
                discardReason: reason,
              });
            }
          }}
          onNavigate={item => {
            // navigation.navigate('ArticleReviewScreen', {
            //  articleId: Number(item._id),
            //  authorId: item.authorId,
            //  destination: item.status,
            //});
            handleNav(item._id, item.article.authorId, item.status, item.pb_recordId, item.article_recordId);
          }}
        />
      );
    },
    [
      discardImprovementMutation,
      handleNav,
      pickImprovementMutation,
      selectedCardId,
      unassignFromImprovementMutation,
      user_id,
    ],
  );

  if (
    isAvailableImprovementLoading ||
    isProgressImprovementLoading ||
    pickImprovementMutation.isPending ||
    unassignFromImprovementMutation.isPending ||
    discardImprovementMutation.isPending
  ) {
    return <Loader />;
  }

  return (
    <View style={{flex: 1, backgroundColor: ON_PRIMARY_COLOR}}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                ...styles.button,
                backgroundColor: selectedCat !== item ? 'white' : PRIMARY_COLOR,
                borderColor: selectedCat !== item ? PRIMARY_COLOR : 'white',
              }}
              onPress={() => {
                setSelectedCat(item);
              }}>
              <Text
                style={{
                  ...styles.labelStyle,
                  color: selectedCat !== item ? 'black' : 'white',
                }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.articleContainer}>
          <FlatList
            data={
              selectedCat === categories[0]
                ? availableImprovements
                  ? availableImprovements
                  : []
                : progressImprovements
                ? progressImprovements
                : []
            }
            renderItem={renderItem}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.flatListContentContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../../assets/article_default.jpg')}
                  style={styles.image}
                />
                <Text style={styles.message}>No Article Found</Text>
              </View>
            }
            onEndReached={()=>{
              if(selectedCat === categories[0]){
                 if(availablePage < totalAvailPage){
                  setAvailablePage(prev => prev + 1);
                 }
              }
              else if(selectedCat === categories[1]){

                if(progressPage < totalProgressPage){
                  setProgressPage(prev => prev + 1);
                }
              }
            }}
            onEndReachedThreshold={0.5}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    //alignSelf:"center",
    flexDirection: 'row',
    paddingHorizontal: 6,
    // backgroundColor:"red"
  },
  button: {
    flex: 1,
    borderRadius: 14,
    marginHorizontal: 6,
    marginVertical: 4,
    padding: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  container: {
    flex: 1,
    // backgroundColor: '#F0F8FF',
    marginTop: hp(8),
    //justifyContent: 'center',
    //alignItems: 'center',
  },
  articleContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 80,
    //zIndex: -2,
  },
  flatListContentContainer: {
    // marginTop: hp(20),
    paddingHorizontal: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },

  image: {
    height: 160,
    width: 160,
    borderRadius: 80,
    resizeMode: 'cover',
    marginBottom: hp(4),
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
});
