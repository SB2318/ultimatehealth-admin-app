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
import { useSelector } from 'react-redux';

export default function Imrovement() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const {user_id} = useSelector((state:any) => state.user);

  const [selectedCat, setSelectedCat] = useState<string>('Available');
  const  categories = ['Available', 'Inprogress'];

  const {
    data: availableImprovements,
    refetch: availableImprovementRefetch,
    isLoading: isAvailableImprovementLoading,
  } = useQuery({
    queryKey: ['get-available-improvements'],
    queryFn: async () => {
      const response = await axios.get(`${GET_AVAILABLE_IMPROVEMENTS}`);
      let d = response.data as EditRequest[];
      //updateAvailableArticles(d);
      return response.data as EditRequest[];
    },
  });

  const {
    data: progressImprovements,
    refetch: refetchProgressImprovements,
    isLoading: isProgressImprovementLoading,
  } = useQuery({
    queryKey: ['get-progress-improvements'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROGRESS_IMPROVEMENTS}`);
      let d = response.data as EditRequest[];
      //updateProgressArticles(d);
      return response.data as EditRequest[];
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    availableImprovementRefetch();
    refetchProgressImprovements();
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
        // eslint-disable-next-line react/react-in-jsx-scope
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
          }}
        />
      );
    },
    [
      discardImprovementMutation,
      pickImprovementMutation,
      selectedCardId,
      unassignFromImprovementMutation,
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
