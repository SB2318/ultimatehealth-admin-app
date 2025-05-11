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
import React, {useEffect, useRef, useState} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleData, ReviewScreenProp, Admin, Comment, ImprovementScreenProp, EditRequest} from '../type';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import {hp, wp} from '../helper/Metric';
import {
  DISCARD_ARTICLE,
  GET_ARTICLE_BY_ID,
  GET_IMPROVEMENT_BY_ID,
  GET_PROFILE_API,
  GET_STORAGE_DATA,
  PUBLISH_ARTICLE,
} from '../helper/APIUtils';
import axios from 'axios';

import {useSocket} from '../components/SocketContext';

import {setUserHandle} from '../stores/UserSlice';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {createFeebackHTMLStructure, StatusEnum} from '../helper/Utils';
import ReviewItem from '../components/ReviewCard';
import CommentCardItem from './CommentCardItem';
import DiscardReasonModal from '../components/DiscardReasonModal';
import Loader from '../components/Loader';

const ImprovementReviewScreen = ({navigation, route}: ImprovementScreenProp) => {
  const insets = useSafeAreaInsets();
  const {requestId, authorId, destination} = route.params;
  const {user_id} = useSelector((state: any) => state.user);
  const RichText = useRef();
  const [feedback, setFeedback] = useState('');
  const [webviewHeight, setWebViewHeight] = useState(0);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);

  const socket = useSocket();
  const dispatch = useDispatch();

  const [comments, setComments] = useState<Comment[]>([]);

  const flatListRef = useRef<FlatList<Comment>>(null);

  const webViewRef = useRef<WebView>(null);

  function handleHeightChange(_height) {}

  function editorInitializedCallback() {
    RichText.current?.registerToolbar(function (_items) {});
  }
  const {data: improvement} = useQuery({
    queryKey: ['get-improvement-by-id'],
    queryFn: async () => {
      const response = await axios.get(`${GET_IMPROVEMENT_BY_ID}/${requestId}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });

      return response.data.improvement as EditRequest;
    },
  });

  const {data: user} = useQuery({
    queryKey: ['get-my-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        //headers: {
        //  Authorization: `Bearer ${user_token}`,
        //},
      });
      return response.data.profile as Admin;
    },
  });

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }

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

    // Listen for new comments
    socket.on('new-feedback', data => {
      console.log('new comment loaded', data);
      
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

  const commentTests: any[] = [];


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

    onSuccess: d => {
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

    onSuccess: d => {
     // onRefresh();
     Alert.alert('Article published');
    },
    onError: err => {
      console.log('Error', err);
      Alert.alert(err.message);
    },
  });
  useEffect(() => {
    if (article) {
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
    }
  }, [article]);

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

  const contentSource = article?.content?.endsWith('.html')
    ? {uri: `${GET_STORAGE_DATA}/${article.content}`}
    : {html: article?.content};

  // eslint-disable-next-line @typescript-eslint/no-shadow
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


  if(discardArticleMutation.isPending || publishArticleMutation.isPending){
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

          <TouchableOpacity
            style={styles.topIcon}
            onPress={() => {
              // Image copyright checker
            }}>

           <MaterialIcon name="plagiarism" size={30} color={PRIMARY_COLOR} />
          </TouchableOpacity>

          {article?.status !== StatusEnum.DISCARDED && (
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

          {article?.status !== StatusEnum.DISCARDED && (
            <TouchableOpacity
              onPress={() => {
                // Grammar checker
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

          {article?.status !== StatusEnum.DISCARDED && (
            <TouchableOpacity
              onPress={() => {
                // Palagrism Checker
              }}
              style={[
                styles.plaButton,
                {
                  backgroundColor: '#660099',
                },
              ]}>
                <MaterialIcon size={28} name="published-with-changes" color={'white'} />

            </TouchableOpacity>
          )}

            {article?.status !== StatusEnum.DISCARDED && (
            <TouchableOpacity
              onPress={() => {
                // Publish article
                publishArticleMutation.mutate({
                  articleId: article ? article._id : '0' ,
                  reviewer_id: user_id,
                });
              }}
              style={[
                styles.pubButton,
                {
                  backgroundColor: '#478778',

                },
              ]}>
                <MaterialIcon size={28} name="domain-verification" color={'white'} />

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
                minHeight: webviewHeight,
                // flex:7,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ref={webViewRef}
              originWhitelist={['*']}
              injectedJavaScript={cssCode}
              source={contentSource}
              textZoom={100}
            />
          </View>
        </View>
        {destination !== StatusEnum.DISCARDED &&
          destination !== StatusEnum.UNASSIGNED &&
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

        {(commentTests.length > 0 && article?.reviewer_id === null) ||
        article?.status === StatusEnum.UNASSIGNED ? (
          <View style={{padding: wp(6), marginTop: hp(4.5)}}>
            {commentTests?.map((item, index) => (
              <CommentCardItem key={index} item={item} />
            ))}
          </View>
        ) : (
          <View style={{padding: wp(4), marginTop: hp(4.5)}}>
            {comments?.map((item, index) => (
              <ReviewItem key={index} item={item} />
            ))}
          </View>
        )}

                     <DiscardReasonModal
                        visible={discardModalVisible}
                        callback={(reason: string)=>{
                           //onclick(item, 1, reason);
                           discardArticleMutation.mutate({
                             articleId: article ? article._id : '0',
                             reason: reason,
                           });
                           setDiscardModalVisible(false);
                        }}
                        dismiss={()=>{
                          setDiscardModalVisible(false);
                        }}

                       />
      </ScrollView>
    </View>
  );
};
export default ImprovementReviewScreen;

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
    padding: 10,
    position: 'absolute',
    bottom: -25,
    right: 160,
    borderRadius: 50,
  },

  playButton: {
    padding: 10,
    position: 'absolute',
    bottom: -25,
    right: 110,
    borderRadius: 50,
  },

  plaButton: {
    padding: 10,
    position: 'absolute',
    bottom: -25,
    right: 60,
    borderRadius: 50,
  },

  pubButton: {
    padding: 10,
    position: 'absolute',
    bottom: -25,
    right: 10,
    borderRadius: 50,
  },
  contentContainer: {
    marginTop: 25,
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
