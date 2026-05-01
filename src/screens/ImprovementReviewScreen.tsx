// import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
// import AntDesign from '@expo/vector-icons/AntDesign';
// import MaterialIcon from '@expo/vector-icons/MaterialIcons';
// import {useMutation, useQuery} from '@tanstack/react-query';
// import axios from 'axios';
// import React, {useEffect, useRef, useState} from 'react';

// import {
//   Alert,
//   Dimensions,
//   FlatList,
//   Image,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
// import {useDispatch, useSelector} from 'react-redux';
// import {
//   CHECK_GRAMMAR,
//   CHECK_PLAGIARISM,
//   DELETE_IMPROVEMENT_RECORD_PB,
//   DISCARD_IMPROVEMENT,
//   GET_IMPROVEMENT_BY_ID,
//   GET_IMPROVEMENT_CONTENT,
//   GET_PROFILE_API,
//   GET_STORAGE_DATA,
//   PUBLISH_IMPROVEMENT,
//   PUBLISH_IMPROVEMENT_POCKETBASE,
// } from '../helper/APIUtils';
// import {hp, wp} from '../helper/Metric';
// import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// import {
//   Admin,
//   Comment,
//   CopyrightCheckerResponse,
//   EditRequest,
//   ImprovementScreenProp,
//   PlagiarismResponse,
//   PocketBaseResponse,
//   ScoreData,
// } from '../type';

// import {useSocket} from '../components/SocketContext';

// import Snackbar from 'react-native-snackbar';
// import {Button, Spinner, Text, TextArea, YStack} from 'tamagui';
// import CommentCardItem from '../components/CommentCardItem';
// import CopyrightCheckerModal from '../components/CopyrightCheckerModal';
// import DiscardReasonModal from '../components/DiscardReasonModal';
// import Loader from '../components/Loader';
// import PlagiarismModal from '../components/PlagiarismModal';
// import ScorecardModal from '../components/ScoreCardModal';
// import {checkImageCopyright, StatusEnum} from '../helper/Utils';
// import {setUserHandle} from '../stores/UserSlice';

// const ImprovementReviewScreen = ({
//   navigation,
//   route,
// }: ImprovementScreenProp) => {
//   const insets = useSafeAreaInsets();
//   const {requestId, authorId, destination, recordId, articleRecordId} =
//     route.params;
//   const {user_id, user_token} = useSelector((state: any) => state.user);
//   const {isConnected} = useSelector((state: any) => state.network);
//   const [feedback, setFeedback] = useState('');
//   const [loading, setLoading] = useState(false);

//   const SCREEN_WIDTH = Dimensions.get('window').width;
//   const TOOLTIP_WIDTH = 140;

//   const [imageToolTip, setImageToolTip] = useState(false);
//   const [grammarToolTip, setGrammarToolTip] = useState(false);
//   const [plagrismToolTip, setPlagrismToolTip] = useState(false);
//   const [discardToolTip, setDiscardToolTip] = useState(false);
//   const [publishToolTip, setPublishToolTip] = useState(false);
//   const [iconX, setIconX] = useState(0);

//   const [discardModalVisible, setDiscardModalVisible] = useState(false);
//   const [discardReason, setDiscardReason] = useState<string>('');

//   const [grammarModalVisible, setGrammarModalVisible] = useState(false);
//   const [plagModalVisible, setPlagModalVisible] = useState(false);
//   const [scoreData, setScoreData] = useState<ScoreData>({
//     score: 0,
//     corrected: false,
//     correction_percentage: 0,
//     approved: false,
//   });

//   const [plagrisedData, setPlagrisedData] = useState<PlagiarismResponse>({
//     plagiarised_percentage: 0,
//     plagiarised_text: '',
//     source_title: '',
//   });

//   // console.log('Improvement record id', recordId);
//   // console.log('Article record Id', articleRecordId);
//   const [copyRightResults, setCopyRightResults] = useState<
//     CopyrightCheckerResponse[]
//   >([]);
//   const [copyrightModalVisible, setCopyrightModalVisible] =
//     useState<boolean>(false);
//   const [copyrightProgressVisible, setCopyrightProgressVisible] =
//     useState<boolean>(false);

//   const socket = useSocket();
//   const dispatch = useDispatch();

//   const [comments, setComments] = useState<Comment[]>([]);

//   const flatListRef = useRef<FlatList<Comment>>(null);

//   const {data: improvement} = useQuery({
//     queryKey: ['get-improvement-by-id'],
//     queryFn: async () => {
//       const response = await axios.get(
//         `${GET_IMPROVEMENT_BY_ID}/${requestId}`,
//         {
//           //headers: {
//           //  Authorization: `Bearer ${user_token}`,
//           //},
//         },
//       );

//       // console.log("Response Improvement", response);

//       return response.data as EditRequest;
//     },
//     enabled: !!user_token && !!isConnected,
//   });

//   const {data: htmlContent} = useQuery({
//     queryKey: ['get-improvement-content'],
//     queryFn: async () => {
//       let url = '';
//       if (!recordId) {
//         url = `${GET_IMPROVEMENT_CONTENT}?articleRecordId=${articleRecordId}`;
//       } else {
//         url = `${GET_IMPROVEMENT_CONTENT}?recordid=${recordId}&articleRecordId=${articleRecordId}`;
//       }
//       const response = await axios.get(url);
//       return response.data.htmlContent as string;
//     },
//     enabled: !!user_token && !!isConnected,
//   });

//   const noDataHtml = '<p>No Data found</p>';

//   const {data: user} = useQuery({
//     queryKey: ['get-my-profile'],
//     queryFn: async () => {
//       const response = await axios.get(`${GET_PROFILE_API}`, {
//         //headers: {
//         //  Authorization: `Bearer ${user_token}`,
//         //},
//       });
//       // console.log("Response", response);
//       return response.data as Admin;
//     },
//     enabled: !!isConnected && !!user_token,
//   });

//   if (user) {
//     dispatch(setUserHandle(user.user_handle));
//   }

//   const onGrammarModalClose = () => {
//     setScoreData({
//       score: 0,
//       corrected: false,
//       correction_percentage: 0,
//       approved: false,
//     });
//     setGrammarModalVisible(false);
//   };

//   const onPlagiarismModalClose = () => {
//     setPlagrisedData({
//       plagiarised_percentage: 0,
//       plagiarised_text: '',
//       source_title: '',
//     });
//     setPlagModalVisible(false);
//   };

//   const onCopyrightModalClose = () => {
//     setCopyRightResults([]);
//     setCopyrightModalVisible(false);
//     setCopyrightProgressVisible(false);
//   };

//   const handleCheckCopyright = () => {
//     Alert.alert(
//       'Check Image Copyright',
//       'Image copyright feature is coming soon!',
//     );
//     // if (improvement && improvement.imageUtils) {
//     //   Alert.alert(
//     //     'Image Copyright Check',
//     //     'Image copyright check might take some time. Would you like to continue?',
//     //     [
//     //       {
//     //         text: 'Cancel',
//     //         style: 'cancel',
//     //       },
//     //       {
//     //         text: 'OK',
//     //         onPress: async () => {
//     //           try {
//     //             setCopyrightProgressVisible(true);

//     //             const data = await checkImageCopyright(improvement.imageUtils);
//     //             setCopyRightResults(data);

//     //             setCopyrightProgressVisible(false);
//     //             setCopyrightModalVisible(true);
//     //           } catch (error) {
//     //             console.log('Error during copyright check:', error);

//     //             Snackbar.show({
//     //               text: 'Network error occurs during copyright check, try again!',
//     //               duration: Snackbar.LENGTH_SHORT,
//     //             });
//     //             setCopyrightProgressVisible(false);
//     //           }
//     //         },
//     //       },
//     //     ],
//     //     {cancelable: true},
//     //   );
//     // }
//   };

//   useEffect(() => {
//     if (destination !== StatusEnum.UNASSIGNED) {
//       socket.emit('load-review-comments', {requestId: requestId});
//     }

//     socket.on('connect', () => {
//       console.log('connection established');
//     });

//     socket.on('error', data => {
//       console.log('connection error', data);
//     });

//     socket.on('review-comments', data => {
//       console.log('comment loaded', data);

//       setComments(data);
//     });

//     socket.on('new-feedback', data => {
//       console.log('new comment loaded', data);
//       setLoading(false);
//       setComments(prevComments => {
//         const newComments = [data, ...prevComments];
//         // Scroll to the first index after adding the new comment
//         if (flatListRef.current && newComments.length > 1) {
//           flatListRef?.current.scrollToIndex({index: 0, animated: true});
//         }

//         return newComments;
//       });
//     });

//     return () => {
//       socket.off('review-comments');
//       socket.off('new-feedback');
//       socket.off('error');
//     };
//   }, [socket, requestId, destination]);

//   const discardImprovementMutation = useMutation({
//     mutationKey: ['discard-improvement-in-review-state'],
//     mutationFn: async ({
//       requestId,
//       discardReason,
//     }: {
//       requestId: string;
//       discardReason: string;
//     }) => {
//       const res = await axios.post(DISCARD_IMPROVEMENT, {
//         requestId: requestId,
//         discardReason: discardReason,
//       });

//       return res.data.message as string;
//     },

//     onSuccess: data => {
//       Snackbar.show({
//         text: data,
//         duration: Snackbar.LENGTH_SHORT,
//       });
//       // onRefresh();
//     },

//     onError: err => {
//       console.log(err);
//       Alert.alert('Try again');
//     },
//   });

//   const discardImprovementPBMutation = useMutation({
//     mutationKey: ['discard-improvement-from-pb'],
//     mutationFn: async () => {
//       const res = await axios.delete(
//         `${DELETE_IMPROVEMENT_RECORD_PB}/${recordId}`,
//       );
//       return res.data as {message: string; status: boolean};
//     },

//     onSuccess: data => {
//       if (data && data.status) {
//         discardImprovementMutation.mutate({
//           requestId: requestId,
//           discardReason: discardReason,
//         });
//       } else {
//         Snackbar.show({
//           text: data.message,
//           duration: Snackbar.LENGTH_SHORT,
//         });
//       }

//       // onRefresh();
//     },

//     onError: err => {
//       console.log(err);
//       Alert.alert('Try again');
//     },
//   });

//   const publishImprovementMutation = useMutation({
//     mutationKey: ['publish-improvement-in-review-state'],
//     mutationFn: async ({
//       requestId,
//       reviewer_id,
//       content,
//     }: {
//       requestId: string;
//       reviewer_id: string;
//       content: string;
//     }) => {
//       const res = await axios.post(PUBLISH_IMPROVEMENT, {
//         requestId: requestId,
//         reviewer_id: reviewer_id,
//         content: content,
//       });

//       return res.data as any;
//     },

//     onSuccess: d => {
//       // onRefresh();
//       Alert.alert('Article published');
//     },
//     onError: err => {
//       console.log('Error', err);
//       Alert.alert(err.message);
//     },
//   });

//   const publishImprovementInPBMutation = useMutation({
//     mutationKey: ['publish-improvement-in-pocketbase'],
//     mutationFn: async () => {
//       const res = await axios.post(PUBLISH_IMPROVEMENT_POCKETBASE, {
//         record_id: recordId,
//         article_id: articleRecordId,
//       });

//       return res.data as PocketBaseResponse;
//     },

//     onSuccess: d => {
//       // onRefresh();
//       if (d.html_file) {
//         publishImprovementMutation.mutate({
//           requestId: improvement ? improvement._id : '0',
//           reviewer_id: user_id,
//           content: d.html_file,
//         });
//       } else {
//         Snackbar.show({
//           text: 'Failed to publish changes',
//           duration: Snackbar.LENGTH_SHORT,
//         });
//       }
//     },
//     onError: err => {
//       console.log('Error', err);
//       Alert.alert(err.message);
//     },
//   });

//   const grammarCheckMutation = useMutation({
//     mutationKey: ['check-grammar-improvement-in-review-state'],
//     mutationFn: async () => {
//       const res = await axios.post(CHECK_GRAMMAR, {
//         text: htmlContent,
//       });

//       return res.data.corrected as ScoreData;
//     },

//     onSuccess: data => {
//       // onRefresh();
//       console.log('ScoreData', data);
//       setScoreData(data);
//       setGrammarModalVisible(true);
//     },
//     onError: err => {
//       console.log('Error', err);
//       Alert.alert(err.message);
//     },
//   });

//   const plagiarismCheckMutation = useMutation({
//     mutationKey: ['check-plagiarism-improvement-in-review-state'],
//     mutationFn: async () => {
//       const res = await axios.post(CHECK_PLAGIARISM, {
//         text: htmlContent,
//       });

//       return res.data.corrected as PlagiarismResponse;
//     },

//     onSuccess: data => {
//       // onRefresh();
//       //console.log('ScoreData', data);
//       setPlagrisedData(data);
//       setPlagModalVisible(true);
//     },
//     onError: err => {
//       console.log('Error', err);
//       Alert.alert(err.message);
//     },
//   });

//   const getTooltipLeft = (iconX: number) => {
//     const half = TOOLTIP_WIDTH / 2;

//     // center align
//     let left = iconX - half + 18;

//     if (left < 8) left = 8;

//     // right overflow
//     if (left + TOOLTIP_WIDTH > SCREEN_WIDTH - 8) {
//       left = SCREEN_WIDTH - TOOLTIP_WIDTH - 8;
//     }

//     return left;
//   };
//   const activeToolTips = () => {
//     setImageToolTip(true);
//     setDiscardToolTip(true);
//     setPlagrismToolTip(true);
//     setGrammarToolTip(true);
//     setPublishToolTip(true);
//   };

//   const toolTipsOff = () => {
//     setImageToolTip(false);
//     setDiscardToolTip(false);
//     setPlagrismToolTip(false);
//     setGrammarToolTip(false);
//     setPublishToolTip(false);
//   };

//   const bannerImage = improvement?.article?.imageUtils?.[0]?.startsWith('http')
//     ? improvement.article.imageUtils[0]
//     : `${GET_STORAGE_DATA}/${improvement?.article?.imageUtils?.[0] ?? ''}`;

//   if (
//     copyrightProgressVisible ||
//     grammarCheckMutation.isPending ||
//     plagiarismCheckMutation.isPending ||
//     discardImprovementPBMutation.isPending ||
//     discardImprovementMutation.isPending ||
//     publishImprovementMutation.isPending ||
//     publishImprovementInPBMutation.isPending
//   ) {
//     return <Loader />;
//   }

//   return (
//     <SafeAreaView
//       onLayout={e => setIconX(e.nativeEvent.layout.x)}
//       onTouchStart={activeToolTips}
//       onTouchEnd={toolTipsOff}
//       style={styles.container}>
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollViewContent}>
//         <View style={styles.imageContainer}>
//           {improvement &&
//           improvement.article?.imageUtils &&
//           improvement.article?.imageUtils.length > 0 ? (
//             <Image
//               source={{uri: bannerImage}}
//               style={styles.image}
//             />
//           ) : (
//             <Image
//               source={require('../../assets/images/article.png')}
//               style={styles.image}
//             />
//           )}

//           <TouchableOpacity
//             style={styles.topIcon}
//             onPress={handleCheckCopyright}>
//             <MaterialIcon name="plagiarism" size={30} color={PRIMARY_COLOR} />

//             {imageToolTip && (
//               <View style={[styles.tooltip, {left: getTooltipLeft(iconX)}]}>
//                 <Text style={styles.tooltipText} color="white">
//                   copyright
//                 </Text>
//               </View>
//             )}
//           </TouchableOpacity>

//           {improvement?.status !== StatusEnum.DISCARDED && (
//             <TouchableOpacity
//               onPress={() => {
//                 // Discard Article
//                 setDiscardModalVisible(true);
//               }}
//               style={[
//                 styles.likeButton,
//                 {
//                   backgroundColor: 'red',
//                 },
//               ]}>
//               <AntDesign name="poweroff" size={27} color={'white'} />

//               {discardToolTip && (
//                 <View style={[styles.tooltip, {left: getTooltipLeft(iconX)}]}>
//                   <Text style={styles.tooltipText} color="white">
//                     discard
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}

//           {improvement?.status !== StatusEnum.DISCARDED && (
//             <TouchableOpacity
//               onPress={() => {
//                 // Grammar checker
//                 if (!isConnected) {
//                   Snackbar.show({
//                     text: 'You are currently offline',
//                     duration: Snackbar.LENGTH_SHORT,
//                   });
//                   return;
//                 }
//                 grammarCheckMutation.mutate();
//               }}
//               style={[
//                 styles.playButton,
//                 {
//                   backgroundColor: BUTTON_COLOR,
//                 },
//               ]}>
//               <AntDesign name="google" size={28} color={'white'} />
//               {grammarToolTip && (
//                 <View style={[styles.tooltip, {left: getTooltipLeft(iconX)}]}>
//                   <Text style={styles.tooltipText} color="white">
//                     grammar
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}

//           {improvement?.status !== StatusEnum.DISCARDED && (
//             <TouchableOpacity
//               onPress={() => {
//                 // Palagrism Checker
//                 if (!isConnected) {
//                   Snackbar.show({
//                     text: 'You are currently offline',
//                     duration: Snackbar.LENGTH_SHORT,
//                   });
//                   return;
//                 }
//                 plagiarismCheckMutation.mutate();
//               }}
//               style={[
//                 styles.plaButton,
//                 {
//                   backgroundColor: '#660099',
//                 },
//               ]}>
//               {plagrismToolTip && (
//                 <View style={[styles.tooltip, {left: getTooltipLeft(iconX)}]}>
//                   <Text style={styles.tooltipText} color="white">
//                     plagiarism
//                   </Text>
//                 </View>
//               )}
//               <MaterialIcon
//                 size={28}
//                 name="published-with-changes"
//                 color={'white'}
//               />
//             </TouchableOpacity>
//           )}

//           {improvement?.status !== StatusEnum.DISCARDED && (
//             <TouchableOpacity
//               onPress={() => {
//                 // Publish article
//                 if (!isConnected) {
//                   Snackbar.show({
//                     text: 'You are currently offline',
//                     duration: Snackbar.LENGTH_SHORT,
//                   });
//                   return;
//                 }
//                 publishImprovementInPBMutation.mutate();
//               }}
//               style={[
//                 styles.pubButton,
//                 {
//                   backgroundColor: '#478778',
//                 },
//               ]}>
//               <MaterialIcon
//                 size={28}
//                 name="domain-verification"
//                 color={'white'}
//               />
//             </TouchableOpacity>
//           )}
//         </View>
//         <View style={styles.contentContainer}>
//           {improvement && improvement.article?.tags && (
//             <Text style={styles.categoryText} color={BUTTON_COLOR}>
//               {improvement.article.tags.map(tag => tag.name).join(' | ')}
//             </Text>
//           )}

//           {improvement && improvement.article && (
//             <>
//               <Text style={styles.titleText} color={ON_PRIMARY_COLOR}>
//                 Title: {improvement.article?.title}
//               </Text>
//             </>
//           )}

//           <Text style={styles.authorName} color="$color12">
//             Author Name: {improvement?.article?.authorName}
//           </Text>
//           <View style={styles.descriptionContainer}>
//             <AutoHeightWebView
//               style={{
//                 width: Dimensions.get('window').width - 15,
//                 marginTop: 35,
//                 marginBottom: hp(15),
//               }}
//               customStyle={`* { font-family: 'Times New Roman'; } p { font-size: 16px; }`}
//               onSizeUpdated={size => console.log(size.height)}
//               files={[
//                 {
//                   href: 'cssfileaddress',
//                   type: 'text/css',
//                   rel: 'stylesheet',
//                 },
//               ]}
//               originWhitelist={['*']}
//               source={{html: htmlContent ?? noDataHtml}}
//               scalesPageToFit={true}
//               viewportContent={'width=device-width, user-scalable=no'}
//             />
//           </View>
//         </View>

//         {improvement && !improvement.edited_content && (
//           <Text style={{...styles.authorName, color: 'red', margin: hp(3)}}>
//             The user has not made any changes yet.
//           </Text>
//         )}

//         {improvement && (
//           <TouchableOpacity
//             style={styles.submitButton2}
//             onPress={() => {
//               // navigate to publish article screen
//               if (improvement.article) {
//                 navigation.navigate('ArticleReviewScreen', {
//                   articleId: Number(improvement.article._id),
//                   authorId: improvement.article.authorId,
//                   destination: StatusEnum.PUBLISHED,
//                   recordId: improvement.article_recordId,
//                 });
//               } else {
//                 Snackbar.show({
//                   text: 'Article Not found, Try again!',
//                   duration: Snackbar.LENGTH_SHORT,
//                 });
//               }
//             }}>
//             <Text style={styles.submitButtonText} color="white">
//               See old article
//             </Text>
//           </TouchableOpacity>
//         )}

//         {improvement && (
//           <TouchableOpacity
//             style={{...styles.submitButton2, backgroundColor: 'red'}}
//             onPress={() => {
//               // detect content loss api integration
//               if (improvement) {
//                 navigation.navigate('ChangesHistoryScreen', {
//                   requestId: improvement._id,
//                 });
//               }
//             }}>
//             <Text style={styles.submitButtonText} color="white">
//               Detect Content Loss
//             </Text>
//           </TouchableOpacity>
//         )}

//         {destination !== StatusEnum.DISCARDED &&
//         destination !== StatusEnum.UNASSIGNED &&
//         improvement?.reviewer_id !== null ? (
//           <YStack
//             padding={wp(4)}
//             marginTop={hp(1.2)}
//             borderRadius={10}
//             gap="$3">
//             <TextArea
//               placeholder="Submit your feedback"
//               value={feedback}
//               color="#000"
//               onChangeText={setFeedback}
//               multiline
//               height={hp(19)}
//               fontSize={wp(4.8)}
//               paddingVertical={10}
//               paddingHorizontal={12}
//               borderRadius={8}
//               borderWidth={1.5}
//               borderColor={PRIMARY_COLOR}
//               backgroundColor="#fff"
//               textAlignVertical="top"
//             />

//             {feedback.length > 0 && (
//               <YStack alignItems="flex-end" marginTop={hp(0.5)}>
//                 {loading ? (
//                   <Spinner size="large" color={PRIMARY_COLOR} />
//                 ) : (
//                   <Button
//                     size="$4"
//                     width="45%"
//                     height={44}
//                     backgroundColor={PRIMARY_COLOR}
//                     color="#fff"
//                     borderRadius={8}
//                     onPress={() => {
//                       setLoading(true);

//                       socket.emit('add-review-comment', {
//                         requestId: improvement?._id,
//                         reviewer_id: improvement?.reviewer_id,
//                         feedback: feedback,
//                         isReview: true,
//                         isNote: false,
//                       });

//                       setFeedback('');
//                     }}>
//                     <Text color="#ffffff" fontSize={17}>
//                       Post
//                     </Text>
//                   </Button>
//                 )}
//               </YStack>
//             )}
//           </YStack>
//         ) : (
//           <>
//             {improvement && improvement.status === StatusEnum.UNASSIGNED ? (
//               <YStack
//                 alignItems="center"
//                 justifyContent="center"
//                 padding="$4"
//                 borderRadius="$4"
//                 backgroundColor="$gray200"
//                 borderWidth={1}
//                 borderColor="$gray500"
//                 margin="$3">
//                 <Text
//                   fontSize="$4"
//                   fontWeight="600"
//                   color="$gray700"
//                   textAlign="center">
//                   Select this improvement to start the conversation
//                 </Text>

//                 <Text
//                   marginTop="$2"
//                   fontSize="$3.5"
//                   color="$gray500"
//                   textAlign="center"
//                   lineHeight="$4">
//                   Review grammar aur plagiarism across our platform, aur verify
//                   image copyright compliance.
//                 </Text>
//               </YStack>
//             ) : null}
//           </>
//         )}

//         {comments && (
//           <View style={{padding: wp(4), marginTop: hp(4.5)}}>
//             {comments?.map((item, index) => (
//               <CommentCardItem key={index} item={item} />
//             ))}
//           </View>
//         )}

//         <DiscardReasonModal
//           visible={discardModalVisible}
//           callback={(reason: string) => {
//             //onclick(item, 1, reason);

//             if (!isConnected) {
//               Snackbar.show({
//                 text: 'You are currently offline',
//                 duration: Snackbar.LENGTH_SHORT,
//               });
//               return;
//             }
//             setDiscardReason(reason);
//             discardImprovementPBMutation.mutate();
//             setDiscardModalVisible(false);
//           }}
//           dismiss={() => {
//             setDiscardModalVisible(false);
//           }}
//         />

//         <ScorecardModal
//           isVisible={grammarModalVisible}
//           onClose={onGrammarModalClose}
//           data={scoreData}
//         />

//         <PlagiarismModal
//           isVisible={plagModalVisible}
//           onClose={onPlagiarismModalClose}
//           data={plagrisedData}
//         />

//         <CopyrightCheckerModal
//           isVisible={copyrightModalVisible}
//           onClose={onCopyrightModalClose}
//           data={copyRightResults}
//         />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };
// export default ImprovementReviewScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     position: 'relative',
//     backgroundColor: '#ffffff',
//   },
//   scrollView: {
//     flex: 0,
//     backgroundColor: '#ffffff',
//     position: 'relative',
//   },
//   scrollViewContent: {
//     marginBottom: 10,
//     flexGrow: 0,
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   image: {
//     height: 190,
//     width: '100%',
//     objectFit: 'cover',
//   },

//   likeButton: {
//     padding: 10,
//     position: 'absolute',
//     bottom: -25,
//     right: 160,
//     borderRadius: 50,
//   },

//   playButton: {
//     padding: 10,
//     position: 'absolute',
//     bottom: -25,
//     right: 110,
//     borderRadius: 50,
//   },

//   plaButton: {
//     padding: 10,
//     position: 'absolute',
//     bottom: -25,
//     right: 60,
//     borderRadius: 50,
//   },

//   pubButton: {
//     padding: 10,
//     position: 'absolute',
//     bottom: -25,
//     right: 10,
//     borderRadius: 50,
//   },
//   contentContainer: {
//     marginVertical: hp(6),
//     paddingHorizontal: 16,
//   },
//   categoryText: {
//     fontWeight: '600',
//     fontSize: 12,
//     color: BUTTON_COLOR,
//     textTransform: 'uppercase',
//     marginVertical: hp(1),
//   },
//   viewText: {
//     fontWeight: '500',
//     fontSize: 14,
//     color: '#6C6C6D',
//   },
//   titleText: {
//     fontSize: 25,
//     fontWeight: 'bold',
//     marginTop: 5,
//     color: PRIMARY_COLOR,
//     marginVertical: hp(1),
//   },
//   avatarsContainer: {
//     position: 'relative',
//     flex: 1,
//     height: 70,
//     marginTop: 10,
//   },

//   profileImage: {
//     height: 70,
//     width: 70,
//     borderRadius: 100,
//     objectFit: 'cover',
//     resizeMode: 'contain',
//   },
//   avatar: {
//     height: 70,
//     width: 70,
//     borderRadius: 100,
//     position: 'absolute',
//     borderWidth: 1,
//     borderColor: 'white',
//     backgroundColor: '#D9D9D9',
//   },
//   avatarOverlap: {
//     left: 15,
//   },
//   avatarDoubleOverlap: {
//     left: 30,
//   },
//   avatarTripleOverlap: {
//     left: 45,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: PRIMARY_COLOR,
//   },
//   moreText: {
//     fontSize: hp(4),
//     fontWeight: '700',
//     color: 'white',
//   },
//   descriptionContainer: {
//     flex: 1,
//     marginTop: 10,
//   },

//   webView: {
//     flex: 1,
//     width: '100%',
//     margin: 0,
//     padding: 0,
//   },
//   descriptionText: {
//     fontWeight: '400',
//     color: '#6C6C6D',
//     fontSize: 15,
//     textAlign: 'justify',
//   },
//   footer: {
//     backgroundColor: '#EDE9E9',
//     position: 'relative',
//     bottom: 0,
//     zIndex: 10,
//     borderTopEndRadius: 30,
//     borderTopStartRadius: 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingTop: 20,
//     paddingHorizontal: 20,
//   },
//   authorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//   },
//   authorImage: {
//     height: 50,
//     width: 50,
//     borderRadius: 25,
//     backgroundColor: PRIMARY_COLOR,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   authorName: {
//     fontWeight: '600',
//     fontSize: 15,
//     color: 'black',
//   },
//   authorFollowers: {
//     fontWeight: '400',
//     fontSize: 13,
//   },

//   authorText: {
//     fontWeight: '500',
//     fontSize: 23,
//   },
//   followButton: {
//     backgroundColor: PRIMARY_COLOR,
//     paddingHorizontal: 15,
//     borderRadius: 20,
//     paddingVertical: 10,
//   },
//   followButtonText: {
//     color: 'white',
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   commentsList: {
//     flex: 1,
//     marginBottom: 20,
//   },

//   textInput: {
//     height: 100,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//     textAlignVertical: 'top',
//     backgroundColor: '#fff',
//     marginTop: 10,
//   },
//   submitButton: {
//     backgroundColor: PRIMARY_COLOR,
//     padding: 15,
//     marginTop: 20,
//     //borderRadius: 8,
//     alignItems: 'center',
//   },

//   submitButton2: {
//     backgroundColor: PRIMARY_COLOR,
//     padding: 15,
//     marginHorizontal: hp(2.8),
//     marginVertical: wp(2),
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   submitButtonText: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   editIconContainer: {
//     position: 'absolute',
//     top: 16,
//     right: 10,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   inputContainer: {
//     height: 300,
//     overflow: 'hidden',
//     //backgroundColor: 'red',
//     //padding: hp(1),

//     borderColor: '#000',
//     borderWidth: 0.5,
//     // padding: wp(6),
//     margin: hp(2),
//     marginHorizontal: hp(3),
//   },
//   editor: {
//     backgroundColor: 'blue',
//     borderColor: 'black',
//     marginHorizontal: 4,
//   },
//   rich: {
//     //minHeight: 700,
//     flex: 1,
//     backgroundColor: ON_PRIMARY_COLOR,
//   },
//   richBar: {
//     height: 45,
//     backgroundColor: PRIMARY_COLOR,
//     marginTop: 0,
//     marginBottom: hp(0.8),
//   },

//   topIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 10,

//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     borderRadius: 50,
//     resizeMode: 'contain',
//     zIndex: 5,
//     backgroundColor: ON_PRIMARY_COLOR,
//   },
//   tooltip: {
//     position: 'absolute',
//     top: 45,
//     backgroundColor: '#000',
//     paddingHorizontal: 4,
//     paddingVertical: 4,
//     borderRadius: 6,
//     minWidth: 58,
//   },
//   tooltipText: {
//     color: '#fff',
//     fontSize: 9,
//     textAlign: 'center',
//   },
// });

import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {YStack, XStack, Text, Button, TextArea} from 'tamagui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import Snackbar from 'react-native-snackbar';

import {
  CHECK_GRAMMAR,
  CHECK_PLAGIARISM,
  DELETE_IMPROVEMENT_RECORD_PB,
  DISCARD_IMPROVEMENT,
  GET_IMPROVEMENT_BY_ID,
  GET_IMPROVEMENT_CONTENT,
  GET_PROFILE_API,
  GET_STORAGE_DATA,
  PUBLISH_IMPROVEMENT,
  PUBLISH_IMPROVEMENT_POCKETBASE,
} from '../helper/APIUtils';
import Loader from '../components/Loader';
import DiscardReasonModal from '../components/DiscardReasonModal';
import ScorecardModal from '../components/ScoreCardModal';
import PlagiarismModal from '../components/PlagiarismModal';
import CopyrightCheckerModal from '../components/CopyrightCheckerModal';
import CommentCardItem from '../components/CommentCardItem';

import {StatusEnum} from '../helper/Utils';
import {setUserHandle} from '../stores/UserSlice';
import {useSocket} from '@/SocketContext';
import {ImprovementScreenProp, PocketBaseResponse} from '../type';

const COLORS = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    secondaryText: '#64748B',
    primary: '#2563EB',
    success: '#10B981',
    danger: '#EF4444',
    border: '#E2E8F0',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E2937',
    text: '#F1F5F9',
    secondaryText: '#94A3B8',
    primary: '#3B82F6',
    success: '#34D399',
    danger: '#F87171',
    border: '#E2E8F0',
  },
};

const ImprovementReviewScreen = ({
  navigation,
  route,
}: ImprovementScreenProp) => {
  const {requestId, destination, recordId, articleRecordId} = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  const {user_id, user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const [discardReason, setDiscardReason] = useState('');

  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const [grammarModalVisible, setGrammarModalVisible] = useState(false);
  const [plagModalVisible, setPlagModalVisible] = useState(false);
  const [copyrightModalVisible, setCopyrightModalVisible] = useState(false);

  const [scoreData, setScoreData] = useState<any>({});
  const [plagrisedData, setPlagrisedData] = useState<any>({});
  const [copyRightResults, setCopyRightResults] = useState<any[]>([]);

  const socket = useSocket();

  const flatListRef = useRef<FlatList<Comment>>(null);
  const [comments, setComments] = useState<any[]>([]);

  const {data: improvement} = useQuery({
    queryKey: ['get-improvement-by-id', requestId],
    queryFn: async () => {
      const res = await axios.get(`${GET_IMPROVEMENT_BY_ID}/${requestId}`);
      return res.data;
    },
    enabled: !!user_token && isConnected,
  });

  const {data: htmlContent} = useQuery({
    queryKey: ['get-improvement-content', recordId],
    queryFn: async () => {
      const url = recordId
        ? `${GET_IMPROVEMENT_CONTENT}?recordid=${recordId}&articleRecordId=${articleRecordId}`
        : `${GET_IMPROVEMENT_CONTENT}?articleRecordId=${articleRecordId}`;
      const res = await axios.get(url);
      return res.data.htmlContent;
    },
    enabled: !!user_token && isConnected,
  });

  const {data: user} = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => axios.get(GET_PROFILE_API).then(res => res.data),
    enabled: !!user_token && isConnected,
  });

  if (user) dispatch(setUserHandle(user.user_handle));

  useEffect(() => {
    if (destination !== StatusEnum.UNASSIGNED) {
      socket.emit('load-review-comments', {requestId: requestId});
    }

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('error', data => {
      console.log('connection error', data);
    });

    socket.on('review-comments', data => {
      console.log('comment loaded', data);

      setComments(data);
    });

    socket.on('new-feedback', data => {
      console.log('new comment loaded', data);
      setLoading(false);
      setComments(prevComments => {
        const newComments = [data, ...prevComments];
        // Scroll to the first index after adding the new comment
        if (flatListRef.current && newComments.length > 1) {
          flatListRef?.current.scrollToIndex({index: 0, animated: true});
        }

        return newComments;
      });
    });

    return () => {
      socket.off('review-comments');
      socket.off('new-feedback');
      socket.off('error');
    };
  }, [socket, requestId, destination]);

  const publishImprovementMutation = useMutation({
    mutationKey: ['publish-improvement-in-review-state'],
    mutationFn: async ({
      requestId,
      reviewer_id,
      content,
    }: {
      requestId: string;
      reviewer_id: string;
      content: string;
    }) => {
      const res = await axios.post(PUBLISH_IMPROVEMENT, {
        requestId: requestId,
        reviewer_id: reviewer_id,
        content: content,
      });

      return res.data as any;
    },

    onSuccess: d => {
      // onRefresh();
      Alert.alert('Article published');
    },
    onError: err => {
      console.log('Error', err);
      Snackbar.show({
        text: err.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const publishMutation = useMutation({
    mutationKey: ['publish-improvement-in-pocketbase'],
    mutationFn: async () => {
      const res = await axios.post(PUBLISH_IMPROVEMENT_POCKETBASE, {
        record_id: recordId,
        article_id: articleRecordId,
      });

      return res.data as PocketBaseResponse;
    },

    onSuccess: d => {
      // onRefresh();
      if (d.html_file) {
        publishImprovementMutation.mutate({
          requestId: improvement ? improvement._id : '0',
          reviewer_id: user_id,
          content: d.html_file,
        });
      } else {
        Snackbar.show({
          text: 'Failed to publish changes',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    },
    onError: err => {
      console.log('Error', err);
      Snackbar.show({
        text: err.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const discardImprovementMutation = useMutation({
    mutationKey: ['discard-improvement-in-review-state'],
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
      // onRefresh();
    },

    onError: err => {
      console.log('Error', err);
      Snackbar.show({
        text: err.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const grammarMutation = useMutation({
    mutationFn: async () => axios.post(CHECK_GRAMMAR, {text: htmlContent}),
    onSuccess: res => {
      setScoreData(res.data.corrected);
      setGrammarModalVisible(true);
    },
     onError: err => {
          console.log('Error', err);
          Snackbar.show({
            text: err.message,
            duration: Snackbar.LENGTH_SHORT,
          });
        },
  });

  const plagiarismMutation = useMutation({
    mutationFn: async () => axios.post(CHECK_PLAGIARISM, {text: htmlContent}),
    onSuccess: res => {
      setPlagrisedData(res.data.data);
      setPlagModalVisible(true);
    },
     onError: err => {
          console.log('Error', err);
          Snackbar.show({
            text: err.message,
            duration: Snackbar.LENGTH_SHORT,
          });
        },
  });

  const discardMutation = useMutation({
    mutationKey: ['discard-improvement-from-pb'],
    mutationFn: async (reason: string) => {
      setDiscardReason(reason);
      const res = await axios.delete(
        `${DELETE_IMPROVEMENT_RECORD_PB}/${recordId}`,
      );
      return res.data as {message: string; status: boolean};
    },

    onSuccess: data => {
      if (data && data.status) {
        discardImprovementMutation.mutate({
          requestId: requestId,
          discardReason: discardReason,
        });
      } else {
        Snackbar.show({
          text: data.message,
          duration: Snackbar.LENGTH_SHORT,
        });
      }

      // onRefresh();
    },

    onError: err => {
      console.log('Error', err);
      Snackbar.show({
        text: err.message,
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const bannerImage = improvement?.article?.imageUtils?.[0]?.startsWith('http')
    ? improvement.article.imageUtils[0]
    : `${GET_STORAGE_DATA}/${improvement?.article?.imageUtils?.[0]}`;

  if (
    grammarMutation.isPending ||
    plagiarismMutation.isPending ||
    discardMutation.isPending ||
    discardImprovementMutation.isPending ||
    publishImprovementMutation.isPending ||
    publishMutation.isPending
  ) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: colors.background}}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack paddingBottom="$10">
            {/* Hero Image */}
            <YStack position="relative">
              <Image
                source={{
                  uri:
                    bannerImage ||
                    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
                }}
                style={{width: '100%', height: 240, resizeMode: 'cover'}}
              />

              {/* Floating Action Tools */}
              <XStack
                position="absolute"
                bottom={-25}
                left={20}
                right={20}
                justifyContent="space-between"
                zIndex={10}>
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => plagiarismMutation.mutate()}>
                  <MaterialIcons
                    name="plagiarism"
                    size={26}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => grammarMutation.mutate()}>
                  <AntDesign name="google" size={26} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => setDiscardModalVisible(true)}>
                  <AntDesign name="poweroff" size={26} color={colors.danger} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toolButton, {backgroundColor: '#10B981'}]}
                  onPress={() => publishMutation.mutate()}>
                  <MaterialIcons
                    name="domain-verification"
                    size={26}
                    color="white"
                  />
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Content */}
            <YStack padding="$5" gap="$4" marginTop="$8">
              {improvement?.article?.tags && (
                <Text fontSize={13} color={colors.primary} fontWeight="600">
                  {improvement.article.tags.map((t: any) => t.name).join(' • ')}
                </Text>
              )}

              <Text
                fontSize={26}
                fontWeight="700"
                color={colors.text}
                lineHeight={32}>
                {improvement?.article?.title}
              </Text>

              <Text fontSize={16} color={colors.secondaryText}>
                By {improvement?.article?.authorName}
              </Text>

              <AutoHeightWebView
                source={{html: htmlContent || '<p>No content available</p>'}}
                style={{width: '100%', marginVertical: 20}}
                customStyle="body { font-family: system-ui; font-size: 16px; line-height: 1.7; }"
              />
            </YStack>

            {/* Feedback Input */}
            {destination !== StatusEnum.PUBLISHED && (
              <YStack padding="$5" gap="$3">
                <TextArea
                  value={feedback}
                  onChangeText={e => setFeedback(e.nativeEvent.text)}
                  placeholder="Write your feedback here..."
                  height={140}
                  borderWidth={1.5}
                  borderColor={colors.border}
                  focusStyle={{borderColor: colors.primary}}
                  color={colors.text}
                  //placeholderTextColor={colors.secondaryText}
                />

                <Button
                  backgroundColor={colors.primary}
                  height={54}
                  borderRadius={12}
                  onPress={() => {
                    socket.emit('add-review-comment', {
                      requestId: improvement?._id,
                      reviewer_id: improvement?.reviewer_id,
                      feedback: feedback,
                      isReview: true,
                      isNote: false,
                    });

                    setFeedback('');
                  }}
                  disabled={!feedback.trim()}>
                  <Text color="white" fontWeight="700" fontSize={17}>
                    Post Feedback
                  </Text>
                </Button>
              </YStack>
            )}

            {/* Comments */}
            <YStack padding="$5" gap="$4">
              <Text fontSize={18} fontWeight="700" color={colors.text}>
                Comments
              </Text>
              {comments.map((comment, index) => (
                <CommentCardItem
                  key={index}
                  item={comment}
                  isSelected={false}
                  handleMentionClick={() => {}}
                />
              ))}
            </YStack>
          </YStack>
        </ScrollView>

        {/* Modals */}
        <DiscardReasonModal
          visible={discardModalVisible}
          callback={reason => {
            discardMutation.mutate(reason);
            setDiscardModalVisible(false);
          }}
          dismiss={() => setDiscardModalVisible(false)}
        />
        <ScorecardModal
          isVisible={grammarModalVisible}
          onClose={() => setGrammarModalVisible(false)}
          data={scoreData}
        />
        <PlagiarismModal
          isVisible={plagModalVisible}
          onClose={() => setPlagModalVisible(false)}
          data={plagrisedData}
        />
        <CopyrightCheckerModal
          isVisible={copyrightModalVisible}
          onClose={() => setCopyrightModalVisible(false)}
          data={copyRightResults}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  toolButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

export default ImprovementReviewScreen;
