import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {
  ArticleData,
  ReviewScreenProp,
  Admin,
  Comment,
  ScoreData,
  PlagiarismResponse,
  CopyrightCheckerResponse,
} from '../type';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import {baseHeight, height, hp, scalePerChar, wp} from '../helper/Metric';
import {
  CHECK_GRAMMAR,
  CHECK_PLAGIARISM,
  DISCARD_ARTICLE,
  GET_ARTICLE_BY_ID,
  GET_ARTICLE_CONTENT,
  GET_PROFILE_API,
  PUBLISH_ARTICLE,
} from '../helper/APIUtils';
import axios from 'axios';

import {useSocket} from '../components/SocketContext';

import {setUserHandle} from '../stores/UserSlice';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {
  checkImageCopyright,
  createFeebackHTMLStructure,
  StatusEnum,
} from '../helper/Utils';
import CommentCardItem from './CommentCardItem';
import DiscardReasonModal from '../components/DiscardReasonModal';
import Loader from '../components/Loader';
import ScorecardModal from '../components/ScoreCardModal';
import PlagiarismModal from '../components/PlagiarismModal';
import CopyrightCheckerModal from '../components/CopyrightCheckerModal';
import Snackbar from 'react-native-snackbar';

const ReviewScreen = ({route}: ReviewScreenProp) => {
  const {articleId, destination, recordId} = route.params;
  const {user_id} = useSelector((state: any) => state.user);
  const RichText = useRef();
  const [feedback, setFeedback] = useState('');
  const [webviewHeight, setWebViewHeight] = useState(0);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const [grammarModalVisible, setGrammarModalVisible] = useState(false);
  const [plagModalVisible, setPlagModalVisible] = useState(false);

  const [copyRightResults, setCopyRightResults] = useState<
    CopyrightCheckerResponse[]
  >([]);
  const [copyrightModalVisible, setCopyrightModalVisible] =
    useState<boolean>(false);
  const [copyrightProgressVisible, setCopyrightProgressVisible] =
    useState<boolean>(false);

  const [scoreData, setScoreData] = useState<ScoreData>({
    score: 0,
    corrected: false,
    correction_percentage: 0,
    approved: false,
  });

  const [plagrisedData, setPlagrisedData] = useState<PlagiarismResponse>({
    plagiarised_percentage: 0,
    plagiarised_text: '',
    source_title: '',
  });

  const socket = useSocket();
  const dispatch = useDispatch();

  const [comments, setComments] = useState<Comment[]>([]);

  const flatListRef = useRef<FlatList<Comment>>(null);

  const webViewRef = useRef<WebView>(null);

  function handleHeightChange(_height) {}

  const onGrammarModalClose = () => {
    setScoreData({
      score: 0,
      corrected: false,
      correction_percentage: 0,
      approved: false,
    });
    setGrammarModalVisible(false);
  };

  const onPlagiarismModalClose = () => {
    setPlagrisedData({
      plagiarised_percentage: 0,
      plagiarised_text: '',
      source_title: '',
    });
    setPlagModalVisible(false);
  };

  const onCopyrightModalClose = () => {
    setCopyRightResults([]);
    setCopyrightModalVisible(false);
    setCopyrightProgressVisible(false);
  };

  const handleCheckCopyright = () => {
    if (article && article.imageUtils) {
      Alert.alert(
        'Image Copyright Check',
        'Image copyright check might take some time. Would you like to continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                setCopyrightProgressVisible(true);


                const data = await checkImageCopyright(article.imageUtils);
                console.log("DSAE", data)
                setCopyRightResults(data);
              
                setCopyrightProgressVisible(false);
                setCopyrightModalVisible(true);
              } catch (error) {
                console.log('Error during copyright check:', error);
                Snackbar.show({
                  text:"Network error occurs during copyright check, try again!",
                  duration: Snackbar.LENGTH_SHORT,
                })
                setCopyrightProgressVisible(false);
              }
            },
          },
        ],
        {cancelable: true},
      );
    }
  };
  function editorInitializedCallback() {
    RichText.current?.registerToolbar(function (_items) {});
  }
  const {data: article} = useQuery({
    queryKey: ['get-article-by-id'],
    queryFn: async () => {
      const response = await axios.get(`${GET_ARTICLE_BY_ID}/${articleId}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });

      return response.data.article as ArticleData;
    },
  });

  const {data: htmlContent} = useQuery({
    queryKey: ['get-article-content'],
    queryFn: async () => {
      const response = await axios.get(`${GET_ARTICLE_CONTENT}/${recordId}`);
      //console.log('HTML RES', response.data);
      return response.data.htmlContent as string;
    },
  });

  const noDataHtml = '<p>No Data found</p>';

  const {data: user} = useQuery({
    queryKey: ['get-my-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });
      return response.data as Admin;
    },
  });

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }

  useEffect(() => {
    if (
      destination !== StatusEnum.UNASSIGNED &&
      destination !== StatusEnum.PUBLISHED
    ) {
      socket.emit('load-review-comments', {articleId: route.params.articleId});
    }

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('error', data => {
      console.log('connection error', data);
    });

    socket.on('review-comments', data => {
      console.log('comment loaded');

      setComments(data.comments);
    });

    // Listen for new comments
    socket.on('new-feedback', data => {
      console.log('new comment loaded', data);

      setComments(prevComments => {
        const newComments = [data.comment, ...prevComments];
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
  }, [socket, route.params.articleId, destination]);

  const discardArticleMutation = useMutation({
    mutationKey: ['discard-article-in-review-state'],
    mutationFn: async ({
      articleId,
      reason,
    }: {
      articleId: string;
      reason: string;
    }) => {
      const res = await axios.post(DISCARD_ARTICLE, {
        articleId: articleId,
        discardReason: reason,
      });

      return res.data as any;
    },

    onSuccess: () => {
      // onRefresh();
      Alert.alert('Article discarded');
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });

  const publishArticleMutation = useMutation({
    mutationKey: ['publish-article-in-review-state'],
    mutationFn: async ({
      articleId,
      reviewer_id,
    }: {
      articleId: string;
      reviewer_id: string;
    }) => {
      const res = await axios.post(PUBLISH_ARTICLE, {
        articleId: articleId,
        reviewer_id: reviewer_id,
      });

      return res.data as any;
    },

    onSuccess: () => {
      // onRefresh();
      Alert.alert('Article published');
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });

  const grammarCheckMutation = useMutation({
    mutationKey: ['check-grammar-in-review-state'],
    mutationFn: async () => {
      const res = await axios.post(CHECK_GRAMMAR, {
        text: htmlContent,
      });

      return res.data.corrected as ScoreData;
    },

    onSuccess: data => {
      // onRefresh();
      console.log('ScoreData', data);
      setScoreData(data);
      setGrammarModalVisible(true);
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });

  const plagiarismCheckMutation = useMutation({
    mutationKey: ['check-plagiarism-in-review-state'],
    mutationFn: async () => {
      const res = await axios.post(CHECK_PLAGIARISM, {
        text: htmlContent,
      });

      console.log('data', res.data.data);
      return res.data.data as PlagiarismResponse;
    },

    onSuccess: data => {
      // onRefresh();
      //console.log('ScoreData', data);
      setPlagrisedData(data);
      setPlagModalVisible(true);
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });
  useEffect(() => {
    if (htmlContent) {
      /*
      let source = article?.content?.endsWith('.html')
        ? {uri: `${GET_STORAGE_DATA}/${article.content}`}
        : {html: article?.content};

      const fetchContentLength = async () => {
        const length = await getContentLength(source);
        console.log('Content Length:', length);

        //setWebViewHeight(length * 1.2); //Add some buffer to the height calculation
        setWebViewHeight(length);
      };

      fetchContentLength();
      */
      setWebViewHeight(htmlContent.length);
    } else {
      setWebViewHeight(noDataHtml.length);
    }
  }, [htmlContent]);

  // console.log('author id', authorId);

  const cssCode = `
      const style = document.createElement('style');
      style.innerHTML = \`
        body {
          font-size: 46px;
          line-height: 1.5;
          color: #333;
        }
      \`;
      document.head.appendChild(style);
    `;

  /*
  const getContentLength = async (contentSource: {
    uri?: string;
    html?: string;
  }) => {
    if (contentSource.uri) {
      try {
        const response = await fetch(contentSource.uri);
        const content = await response.text();
        return content.length - 4000;
      } catch (error) {
        console.error('Error fetching URI:', error);
        return 0;
      }
    } else if (contentSource.html) {
      return contentSource.html.length;
    }
    return 0;
  };
  */

  // console.log("htmlContent", htmlContent);

  const scalePerChar = 1 / 1000;
    const maxMultiplier = 4.3;
    const baseMultiplier = 0.8;
  
    const minHeight = useMemo(() => {
      let content = htmlContent ?? "";
      const scaleFactor = Math.min(content.length * scalePerChar, maxMultiplier);
      const scaledHeight = height * (baseMultiplier + scaleFactor);
      const cappedHeight = Math.min(scaledHeight, height * 6);
      return cappedHeight;
    }, [htmlContent, scalePerChar]);

  if (
    copyrightProgressVisible ||
    plagiarismCheckMutation.isPending ||
    grammarCheckMutation.isPending ||
    discardArticleMutation.isPending ||
    publishArticleMutation.isPending
  ) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          {article && article?.imageUtils && article?.imageUtils.length > 0 ? (
            <Image
              source={{uri: article?.imageUtils[0]}}
              style={styles.image}
            />
          ) : (
            <Image
              source={require('../../assets/article_default.jpg')}
              style={styles.image}
            />
          )}

          {destination !== StatusEnum.PUBLISHED && (
            <TouchableOpacity
              style={styles.topIcon}
              onPress={handleCheckCopyright}>
              <MaterialIcon name="plagiarism" size={36} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          )}

          {article?.status !== StatusEnum.DISCARDED &&
            destination !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                onPress={() => {
                  // Discard Article
                  setDiscardModalVisible(true);
                }}
                style={[
                  styles.likeButton,
                  {
                    backgroundColor: 'red',
                  },
                ]}>
                <AntDesign name="poweroff" size={27} color={'white'} />
              </TouchableOpacity>
            )}

          {article?.status !== StatusEnum.DISCARDED &&
            destination !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                onPress={() => {
                  // Grammar checker
                  grammarCheckMutation.mutate();
                }}
                style={[
                  styles.playButton,
                  {
                    backgroundColor: BUTTON_COLOR,
                  },
                ]}>
                <AntDesign name="google" size={28} color={'white'} />
              </TouchableOpacity>
            )}

          {article?.status !== StatusEnum.DISCARDED &&
            destination !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                onPress={() => {
                  // Palagrism Checker
                  plagiarismCheckMutation.mutate();
                }}
                style={[
                  styles.plaButton,
                  {
                    backgroundColor: '#660099',
                  },
                ]}>
                <MaterialIcon
                  size={28}
                  name="published-with-changes"
                  color={'white'}
                />
              </TouchableOpacity>
            )}

          {article?.status !== StatusEnum.DISCARDED &&
            destination !== StatusEnum.PUBLISHED && (
              <TouchableOpacity
                onPress={() => {
                  // Publish article
                  publishArticleMutation.mutate({
                    articleId: article ? article._id : '0',
                    reviewer_id: user_id,
                  });
                }}
                style={[
                  styles.pubButton,
                  {
                    backgroundColor: '#478778',
                  },
                ]}>
                <MaterialIcon
                  size={28}
                  name="domain-verification"
                  color={'white'}
                />
              </TouchableOpacity>
            )}
        </View>
        <View style={styles.contentContainer}>
          {article && article?.tags && (
            <Text style={styles.categoryText}>
              {article.tags.map(tag => tag.name).join(' | ')}
            </Text>
          )}

          {article && (
            <>
              <Text style={styles.titleText}>Title: {article?.title}</Text>
            </>
          )}

          <Text style={styles.authorName}>
            Author Name: {article?.authorName}
          </Text>
          <View style={styles.descriptionContainer}>
            <WebView
              style={{
                padding: 7,
                //width: '99%',
                minHeight:minHeight,
                // flex:7,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ref={webViewRef}
              originWhitelist={['*']}
              injectedJavaScript={cssCode}
              source={{html: htmlContent ? htmlContent : noDataHtml}}
              textZoom={100}
            />
          </View>
        </View>
        {destination !== StatusEnum.DISCARDED &&
          destination !== StatusEnum.UNASSIGNED &&
          destination !== StatusEnum.PUBLISHED &&
          article?.reviewer_id !== null && (
            <View style={styles.inputContainer}>
              <RichToolbar
                style={[styles.richBar]}
                editor={RichText}
                disabled={false}
                iconTint={'white'}
                selectedIconTint={'black'}
                disabledIconTint={'purple'}
                iconSize={30}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.setStrikethrough,
                  actions.heading1,
                  actions.heading2,
                  actions.heading3,
                  actions.heading4,
                  actions.heading5,
                  actions.heading6,
                  actions.alignLeft,
                  actions.alignCenter,
                  actions.alignRight,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.insertLink,
                  actions.table,
                  actions.undo,
                  actions.redo,
                  actions.blockquote,
                ]}
                iconMap={{
                  [actions.setStrikethrough]: ({tintColor}) => (
                    <FontAwesome
                      name="strikethrough"
                      color={tintColor}
                      size={26}
                    />
                  ),
                  [actions.alignLeft]: ({tintColor}) => (
                    <Feather name="align-left" color={tintColor} size={35} />
                  ),
                  [actions.alignCenter]: ({tintColor}) => (
                    <Feather name="align-center" color={tintColor} size={35} />
                  ),
                  [actions.alignRight]: ({tintColor}) => (
                    <Feather name="align-right" color={tintColor} size={35} />
                  ),
                  [actions.undo]: ({tintColor}) => (
                    <Ionicons name="arrow-undo" color={tintColor} size={35} />
                  ),
                  [actions.redo]: ({tintColor}) => (
                    <Ionicons name="arrow-redo" color={tintColor} size={35} />
                  ),
                  [actions.heading1]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H1</Text>
                  ),
                  [actions.heading2]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H2</Text>
                  ),
                  [actions.heading3]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H3</Text>
                  ),
                  [actions.heading4]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H4</Text>
                  ),
                  [actions.heading5]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H5</Text>
                  ),
                  [actions.heading6]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H6</Text>
                  ),
                  [actions.blockquote]: ({tintColor}) => (
                    <Entypo name="quote" color={tintColor} size={35} />
                  ),
                }}
              />
              <RichEditor
                disabled={false}
                containerStyle={styles.editor}
                ref={RichText}
                style={styles.rich}
                placeholder={'Start conversation with admin'}
                initialContentHTML={feedback}
                onChange={text => setFeedback(text)}
                editorInitializedCallback={editorInitializedCallback}
                onHeightChange={handleHeightChange}
                initialHeight={300}
              />

              {feedback.length > 0 && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    // emit socket event for feedback
                    const ans = createFeebackHTMLStructure(feedback);
                    socket.emit('add-review-comment', {
                      articleId: article?._id,
                      reviewer_id: article?.reviewer_id,
                      feedback: ans,
                      isReview: true,
                      isNote: false,
                    });
                  }}>
                  <Text style={styles.submitButtonText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        {comments && destination !== StatusEnum.PUBLISHED && (
          <View style={{padding: wp(4), marginTop: hp(4.5)}}>
            {comments?.map((item, index) => (
              <CommentCardItem key={index} item={item} />
            ))}
          </View>
        )}
        <DiscardReasonModal
          visible={discardModalVisible}
          callback={(reason: string) => {
            //onclick(item, 1, reason);
            discardArticleMutation.mutate({
              articleId: article ? article._id : '0',
              reason: reason,
            });
            setDiscardModalVisible(false);
          }}
          dismiss={() => {
            setDiscardModalVisible(false);
          }}
        />

        <ScorecardModal
          isVisible={grammarModalVisible}
          onClose={onGrammarModalClose}
          data={scoreData}
        />

        <PlagiarismModal
          isVisible={plagModalVisible}
          onClose={onPlagiarismModalClose}
          data={plagrisedData}
        />

        <CopyrightCheckerModal
          isVisible={copyrightModalVisible}
          onClose={onCopyrightModalClose}
          data={copyRightResults}
        />
      </ScrollView>
    </View>
  );
};
export default ReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 0,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  scrollViewContent: {
    marginBottom: 10,
    flexGrow: 0,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 300,
    width: '100%',
    objectFit: 'cover',
  },

  likeButton: {
    padding: 14,
    position: 'absolute',
    bottom: -25,
    marginHorizontal: 57,
    right: 160,
    borderRadius: 50,
  },

  playButton: {
    padding: 14,
    position: 'absolute',
    bottom: -25,
    right: 110,
    marginHorizontal: 35,
    borderRadius: 50,
  },

  plaButton: {
    padding: 14,
    position: 'absolute',
    bottom: -25,
    right: 60,
    marginHorizontal: 19,
    borderRadius: 50,
  },

  pubButton: {
    padding: 14,
    position: 'absolute',
    bottom: -25,
    right: 10,
    marginHorizontal: 5,
    borderRadius: 50,
  },
  contentContainer: {
    marginVertical: hp(6),
    paddingHorizontal: 16,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 12,
    color: BUTTON_COLOR,
    textTransform: 'uppercase',
    marginVertical: hp(1),
  },
  viewText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#6C6C6D',
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
    color: PRIMARY_COLOR,
    marginVertical: hp(1),
  },
  avatarsContainer: {
    position: 'relative',
    flex: 1,
    height: 70,
    marginTop: 10,
  },

  profileImage: {
    height: 70,
    width: 70,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
  },
  avatar: {
    height: 70,
    width: 70,
    borderRadius: 100,
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#D9D9D9',
  },
  avatarOverlap: {
    left: 15,
  },
  avatarDoubleOverlap: {
    left: 30,
  },
  avatarTripleOverlap: {
    left: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  moreText: {
    fontSize: hp(4),
    fontWeight: '700',
    color: 'white',
  },
  descriptionContainer: {
    flex: 1,
    marginTop: 10,
  },

  webView: {
    flex: 1,
    width: '100%',
    margin: 0,
    padding: 0,
  },
  descriptionText: {
    fontWeight: '400',
    color: '#6C6C6D',
    fontSize: 15,
    textAlign: 'justify',
  },
  footer: {
    backgroundColor: '#EDE9E9',
    position: 'relative',
    bottom: 0,
    zIndex: 10,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontWeight: '600',
    fontSize: 15,
    color: 'black',
  },
  authorFollowers: {
    fontWeight: '400',
    fontSize: 13,
  },

  authorText: {
    fontWeight: '500',
    fontSize: 23,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  commentsList: {
    flex: 1,
    marginBottom: 20,
  },

  textInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    marginTop: 20,
    //borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  editIconContainer: {
    position: 'absolute',
    top: 16,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  inputContainer: {
    height: 300,
    overflow: 'hidden',
    //backgroundColor: 'red',
    //padding: hp(1),
    borderColor: '#000',
    borderWidth: 0.5,
    // padding: wp(6),
    marginHorizontal: wp(4),
  },
  editor: {
    backgroundColor: 'blue',
    borderColor: 'black',
    marginHorizontal: 4,
  },
  rich: {
    //minHeight: 700,
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  richBar: {
    height: 45,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 0,
    marginBottom: hp(0.8),
  },

  topIcon: {
    position: 'absolute',
    top: 10,
    right: 10,

    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 50,
    resizeMode: 'contain',
    zIndex: 5,
    backgroundColor: ON_PRIMARY_COLOR,
  },
});
