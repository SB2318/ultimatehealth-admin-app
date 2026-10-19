import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import Snackbar from 'react-native-snackbar';
import {Button, Text, TextArea, XStack, YStack} from 'tamagui';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
import {AntDesign, Feather, MaterialIcons, Ionicons} from '@expo/vector-icons';

import {
  Comment,
  ReviewScreenProp,
} from '../type';
import {
  CHECK_GRAMMAR,
  CHECK_PLAGIARISM,
  DISCARD_ARTICLE,
  GET_ARTICLE_BY_ID,
  GET_ARTICLE_CONTENT,
  GET_PROFILE_API,
  GET_STORAGE_DATA,
  PUBLISH_ARTICLE,
} from '../helper/APIUtils';
import {useSocket} from '../components/SocketContext';
import CommentCardItem from '../components/CommentCardItem';
import CopyrightCheckerModal from '../components/CopyrightCheckerModal';
import DiscardReasonModal from '../components/DiscardReasonModal';
import Loader from '../components/Loader';
import PlagiarismModal from '../components/PlagiarismModal';
import ScorecardModal from '../components/ScoreCardModal';
import {StatusEnum} from '../helper/Utils';
import {setUserHandle} from '../stores/UserSlice';
import {
  PRIMARY_COLOR,
  PRIMARY_DARK,
  STATUS_COLORS,
  BORDER_COLOR,
  CARD_BG,
  SCREEN_BG,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  CLINICAL_SHADOW,
} from '../helper/Theme';

const ReviewScreen = ({route, navigation}: ReviewScreenProp) => {
  const {articleId, destination, recordId} = route.params;
  const isDarkMode = useColorScheme() === 'dark';

  const {user_id, user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

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

  const [comments, setComments] = useState<any[]>([]);

  const {data: article} = useQuery({
    queryKey: ['get-article-by-id', articleId],
    queryFn: async () => {
      const res = await axios.get(`${GET_ARTICLE_BY_ID}/${articleId}`);
      return res.data.article;
    },
    enabled: !!isConnected && !!user_token,
  });

  const {data: htmlContent} = useQuery({
    queryKey: ['get-article-content', recordId],
    queryFn: async () => {
      const res = await axios.get(`${GET_ARTICLE_CONTENT}/${recordId}`);
      return res.data.htmlContent;
    },
    enabled: !!isConnected && !!user_token,
  });

  const {data: user} = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {
      const res = await axios.get(GET_PROFILE_API);
      return res.data;
    },
    enabled: !!isConnected && !!user_token,
  });

  if (user) dispatch(setUserHandle(user.user_handle));

  useEffect(() => {
    if (
      destination !== StatusEnum.UNASSIGNED &&
      destination !== StatusEnum.PUBLISHED
    ) {
      socket.emit('load-review-comments', {articleId: route.params.articleId});
    }

    socket.on('review-comments', (data: any) => {
      setComments(data);
    });

    socket.on('new-feedback', (data: any) => {
      setFeedback('');
      setLoading(false);
      setComments(prevComments => [data, ...prevComments]);
    });

    return () => {
      socket.off('review-comments');
      socket.off('new-feedback');
      socket.off('error');
    };
  }, [socket, route.params.articleId, destination]);

  const publishMutation = useMutation({
    mutationFn: async () => {
      await axios.post(PUBLISH_ARTICLE, {articleId, reviewer_id: user_id});
    },
    onSuccess: () => {
      Alert.alert('Success', 'Article approved and published to platform!');
      navigation.goBack();
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err.message || 'Failed to publish article',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const discardMutation = useMutation({
    mutationFn: async (reason: string) => {
      await axios.post(DISCARD_ARTICLE, {articleId, discardReason: reason});
    },
    onSuccess: () => {
      Alert.alert('Notice', 'Article discarded successfully');
      navigation.goBack();
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err.message || 'Failed to discard article',
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
    onError: (err: any) => {
      Snackbar.show({
        text: err.message || 'Grammar check failed',
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
    onError: (err: any) => {
      Snackbar.show({
        text: err.message || 'Plagiarism check failed',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const bannerImage = article?.imageUtils?.[0]?.startsWith('http')
    ? article.imageUtils[0]
    : `${GET_STORAGE_DATA}/${article?.imageUtils?.[0]}`;

  // Status Theme
  const getStatusTheme = () => {
    switch (article?.status) {
      case StatusEnum.PUBLISHED:
        return STATUS_COLORS.approved;
      case StatusEnum.IN_PROGRESS:
        return STATUS_COLORS.in_progress;
      case StatusEnum.DISCARDED:
        return STATUS_COLORS.discarded;
      case StatusEnum.UNASSIGNED:
      default:
        return STATUS_COLORS.pending;
    }
  };
  const statusTheme = getStatusTheme();

  if (
    plagiarismMutation.isPending ||
    grammarMutation.isPending ||
    discardMutation.isPending ||
    publishMutation.isPending
  ) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}>
      <SafeAreaView style={{flex: 1}} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Banner Hero */}
          <View style={styles.heroContainer}>
            <Image
              source={{
                uri:
                  bannerImage ||
                  'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
              }}
              style={styles.heroImage}
            />

            {/* Back Button Floating */}
            <TouchableOpacity
              style={styles.floatingBackButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}>
              <Feather name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Clinical Status Chip */}
            <View
              style={[
                styles.floatingStatusBadge,
                {
                  backgroundColor: statusTheme.bg,
                  borderColor: statusTheme.border,
                },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  {backgroundColor: statusTheme.text},
                ]}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  {color: statusTheme.text},
                ]}>
                {article?.status ? article.status.toUpperCase() : 'PENDING'}
              </Text>
            </View>

            {/* Clinical Moderation Action Toolbar */}
            {article?.status !== StatusEnum.PUBLISHED && (
              <View style={styles.floatingToolbar}>
                {/* Plagiarism Tool */}
                <TouchableOpacity
                  style={styles.toolItem}
                  onPress={() => plagiarismMutation.mutate()}
                  activeOpacity={0.8}>
                  <MaterialIcons
                    name="document-scanner"
                    size={22}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.toolItemText}>Plagiarism</Text>
                </TouchableOpacity>

                {/* AI Quality / Grammar Tool */}
                <TouchableOpacity
                  style={styles.toolItem}
                  onPress={() => grammarMutation.mutate()}
                  activeOpacity={0.8}>
                  <Ionicons
                    name="sparkles"
                    size={20}
                    color={PRIMARY_COLOR}
                  />
                  <Text style={styles.toolItemText}>AI Checker</Text>
                </TouchableOpacity>

                {/* Discard Tool */}
                <TouchableOpacity
                  style={styles.toolItem}
                  onPress={() => setDiscardModalVisible(true)}
                  activeOpacity={0.8}>
                  <AntDesign
                    name="closecircleo"
                    size={20}
                    color="#DC2626"
                  />
                  <Text style={[styles.toolItemText, {color: '#DC2626'}]}>Discard</Text>
                </TouchableOpacity>

                {/* Approve & Publish Tool */}
                {article?.status !== StatusEnum.DISCARDED &&
                  article?.status !== StatusEnum.UNASSIGNED && (
                    <TouchableOpacity
                      style={styles.toolItemPublish}
                      onPress={() => publishMutation.mutate()}
                      activeOpacity={0.85}>
                      <MaterialIcons
                        name="check-circle"
                        size={22}
                        color="#FFFFFF"
                      />
                      <Text style={styles.toolPublishText}>Publish</Text>
                    </TouchableOpacity>
                  )}
              </View>
            )}
          </View>

          {/* Article Header & Body */}
          <View style={styles.articleBodyContainer}>
            {/* Category Tags */}
            {article?.tags && article.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {article.tags.map((t: any, i: number) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{t.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Title */}
            <Text style={styles.articleTitle}>
              {article?.title}
            </Text>

            {/* Author Bar */}
            <View style={styles.authorBar}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorAvatarText}>
                  {article?.authorName ? article.authorName.charAt(0).toUpperCase() : 'A'}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>
                  {article?.authorName || 'Medical Contributor'}
                </Text>
                <Text style={styles.authorRole}>Author • Verified Submitter</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Article Content Rendered */}
            <Text style={styles.sectionHeading}>Article Content</Text>
            <AutoHeightWebView
              source={{html: htmlContent || '<p>No content available</p>'}}
              style={{width: '100%', marginVertical: 12}}
              customStyle={`
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  font-size: 16px;
                  line-height: 1.75;
                  color: ${TEXT_PRIMARY};
                  padding: 0px 4px;
                }
                h1, h2, h3 { color: ${PRIMARY_DARK}; font-weight: 700; margin-top: 24px; }
                p { margin-bottom: 16px; }
                img { max-width: 100%; border-radius: 12px; margin: 16px 0; }
              `}
            />

            <View style={styles.sectionDivider} />

            {/* Feedback & Review Notes Section */}
            {destination !== StatusEnum.PUBLISHED && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.sectionHeading}>Moderator Feedback & Notes</Text>
                <TextArea
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Leave review comments, corrections, or revision notes for the author..."
                  height={130}
                  borderWidth={1}
                  borderRadius={12}
                  backgroundColor={CARD_BG}
                  borderColor={BORDER_COLOR}
                  focusStyle={{borderColor: PRIMARY_COLOR}}
                  color={TEXT_PRIMARY}
                  padding={12}
                  fontSize={14}
                />

                <Button
                  backgroundColor={PRIMARY_COLOR}
                  height={48}
                  borderRadius={12}
                  onPress={() => {
                    setLoading(true);
                    socket.emit('add-review-comment', {
                      articleId: article?._id,
                      reviewer_id: article?.reviewer_id,
                      feedback: feedback,
                      isReview: true,
                      isNote: false,
                    });
                    setFeedback('');
                  }}
                  disabled={!feedback.trim()}
                  opacity={!feedback.trim() ? 0.6 : 1}
                  marginTop={10}>
                  <Text color="#FFFFFF" fontWeight="700" fontSize={15}>
                    Send Feedback
                  </Text>
                </Button>
              </View>
            )}

            {/* Discussion Thread */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionHeading}>
                Review Discussion ({comments.length})
              </Text>
              {comments.length === 0 ? (
                <Text style={styles.emptyCommentsText}>
                  No review feedback logged yet.
                </Text>
              ) : (
                comments.map((comment, index) => (
                  <CommentCardItem
                    key={index.toLocaleString()}
                    item={comment}
                    isSelected={false}
                    handleMentionClick={() => {}}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* Clinical Modals */}
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

export default ReviewScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },

  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    backgroundColor: '#0F172A',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },

  floatingBackButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  floatingStatusBadge: {
    position: 'absolute',
    top: 48,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 10,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  floatingToolbar: {
    position: 'absolute',
    bottom: -22,
    left: 16,
    right: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...CLINICAL_SHADOW,
    elevation: 6,
    zIndex: 20,
  },

  toolItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  toolItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginTop: 2,
  },

  toolItemPublish: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 4,
  },

  toolPublishText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  articleBodyContainer: {
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 40,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },

  tagChip: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },

  tagChipText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '600',
  },

  articleTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 14,
  },

  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  authorAvatarText: {
    color: PRIMARY_DARK,
    fontSize: 15,
    fontWeight: '700',
  },

  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  authorRole: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginVertical: 18,
  },

  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },

  feedbackContainer: {
    marginTop: 8,
    marginBottom: 16,
  },

  commentsSection: {
    marginTop: 8,
  },

  emptyCommentsText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
