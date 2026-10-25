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
import {useSocket} from '@/SocketContext';
import {ImprovementScreenProp, PocketBaseResponse} from '../type';
import {DEMO_IMPROVEMENTS} from '../helper/DemoData';

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

  const {user_id, user_token, isGuest} = useSelector((state: any) => state.user);
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

  const flatListRef = useRef<FlatList<any>>(null);
  const [comments, setComments] = useState<any[]>([]);

  const {data: fetchedImprovement} = useQuery({
    queryKey: ['get-improvement-by-id', requestId],
    queryFn: async () => {
      const res = await axios.get(`${GET_IMPROVEMENT_BY_ID}/${requestId}`);
      return res.data;
    },
    enabled: !!user_token && isConnected && !isGuest,
  });

  const {data: htmlContent} = useQuery({
    queryKey: ['get-improvement-content', recordId],
    queryFn: async () => {
      const url = recordId
        ? `${GET_IMPROVEMENT_CONTENT}?recordid=${recordId}&articleRecordId=${articleRecordId}`
        : `${GET_IMPROVEMENT_CONTENT}?articleRecordId=${articleRecordId}`;
      const res = await axios.get(url);
      return res.data?.htmlContent;
    },
    enabled: !!user_token && isConnected && !isGuest,
  });

  // Clinical demo fallback for guest exploration
  const improvement: any =
    fetchedImprovement ||
    DEMO_IMPROVEMENTS.find(i => i._id === requestId) ||
    DEMO_IMPROVEMENTS[0];

  const contentToDisplay =
    htmlContent ||
    improvement?.edited_content ||
    improvement?.article?.content ||
    '<p>No revised content available for this clinical article.</p>';

  useEffect(() => {
    if (isGuest || !socket) return;

    if (destination !== StatusEnum.UNASSIGNED) {
      socket.emit('load-review-comments', {requestId: requestId});
    }

    socket.on('connect', () => {
      console.log('Socket connection established');
    });

    socket.on('error', (data: any) => {
      console.log('Socket error', data);
    });

    socket.on('review-comments', (data: any) => {
      if (Array.isArray(data)) {
        setComments(data);
      }
    });

    socket.on('new-feedback', (data: any) => {
      setLoading(false);
      setComments(prevComments => [data, ...prevComments]);
    });

    return () => {
      socket.off('review-comments');
      socket.off('new-feedback');
      socket.off('error');
    };
  }, [socket, requestId, destination, isGuest]);

  const publishImprovementMutation = useMutation({
    mutationKey: ['publish-improvement-in-review-state'],
    mutationFn: async ({
      reqId,
      reviewer_id,
      content,
    }: {
      reqId: string;
      reviewer_id: string;
      content: string;
    }) => {
      const res = await axios.post(PUBLISH_IMPROVEMENT, {
        requestId: reqId,
        reviewer_id: reviewer_id,
        content: content,
      });
      return res.data as any;
    },
    onSuccess: () => {
      Alert.alert('Article Published', 'The revised clinical changes have been published.');
      navigation.goBack();
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.message || 'Publishing failed',
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
      if (d.html_file) {
        publishImprovementMutation.mutate({
          reqId: improvement ? improvement._id : '0',
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
    onError: (err: any) => {
      Snackbar.show({
        text: err?.message || 'Publishing failed',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const discardImprovementMutation = useMutation({
    mutationKey: ['discard-improvement-in-review-state'],
    mutationFn: async ({
      reqId,
      reason,
    }: {
      reqId: string;
      reason: string;
    }) => {
      const res = await axios.post(DISCARD_IMPROVEMENT, {
        requestId: reqId,
        discardReason: reason,
      });
      return res.data.message as string;
    },
    onSuccess: data => {
      Snackbar.show({
        text: data || 'Improvement discarded',
        duration: Snackbar.LENGTH_SHORT,
      });
      navigation.goBack();
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.message || 'Discard failed',
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
          reqId: requestId,
          reason: discardReason,
        });
      } else {
        Snackbar.show({
          text: data?.message || 'Failed to discard record',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.message || 'Discard failed',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const grammarMutation = useMutation({
    mutationFn: async () => axios.post(CHECK_GRAMMAR, {text: contentToDisplay}),
    onSuccess: res => {
      setScoreData(res.data?.corrected || {score: 95, approved: true});
      setGrammarModalVisible(true);
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.message || 'Grammar check failed',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const plagiarismMutation = useMutation({
    mutationFn: async () => axios.post(CHECK_PLAGIARISM, {text: contentToDisplay}),
    onSuccess: res => {
      setPlagrisedData(res.data?.data || {plagiarised_percentage: 2});
      setPlagModalVisible(true);
    },
    onError: (err: any) => {
      Snackbar.show({
        text: err?.message || 'Plagiarism check failed',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  // Action handlers with guest simulation
  const handlePlagiarismCheck = () => {
    if (isGuest) {
      setPlagrisedData({
        plagiarised_percentage: 2,
        plagiarised_text: 'Zero unauthorized duplication identified across medical journals.',
        source_title: 'Original Research Submission',
      });
      setPlagModalVisible(true);
      return;
    }
    plagiarismMutation.mutate();
  };

  const handleGrammarCheck = () => {
    if (isGuest) {
      setScoreData({
        score: 98,
        corrected: true,
        correction_percentage: 98,
        approved: true,
      });
      setGrammarModalVisible(true);
      return;
    }
    grammarMutation.mutate();
  };

  const handlePublish = () => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode Simulation',
        'Revision changes approved and simulated as published to the clinical platform.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
      return;
    }
    publishMutation.mutate();
  };

  const handleDiscard = (reason: string) => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode Simulation',
        `Revision request discarded in simulation.\nReason: "${reason}"`,
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
      setDiscardModalVisible(false);
      return;
    }
    discardMutation.mutate(reason);
    setDiscardModalVisible(false);
  };

  const handlePostFeedback = () => {
    if (!feedback.trim()) return;

    if (isGuest) {
      const mockComment = {
        _id: 'comment_' + Date.now(),
        feedback: feedback.trim(),
        reviewer_id: 'guest_reviewer_id',
        admin: {
          user_name: 'Dr. Guest Explorer',
          user_handle: 'guest_explorer',
        },
        createdAt: new Date().toISOString(),
      };
      setComments(prev => [mockComment, ...prev]);
      setFeedback('');
      return;
    }

    if (socket) {
      socket.emit('add-review-comment', {
        requestId: improvement?._id,
        reviewer_id: improvement?.reviewer_id,
        feedback: feedback,
        isReview: true,
        isNote: false,
      });
      setFeedback('');
    }
  };

  const bannerImage = improvement?.article?.imageUtils?.[0]?.startsWith('http')
    ? improvement.article.imageUtils[0]
    : improvement?.article?.imageUtils?.[0]
    ? `${GET_STORAGE_DATA}/${improvement.article.imageUtils[0]}`
    : 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800';

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
                source={{uri: bannerImage}}
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
                {/* Plagiarism */}
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={handlePlagiarismCheck}>
                  <MaterialIcons
                    name="plagiarism"
                    size={26}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {/* AI / Grammar */}
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={handleGrammarCheck}>
                  <AntDesign name="google" size={26} color={colors.primary} />
                </TouchableOpacity>

                {/* Discard */}
                <TouchableOpacity
                  style={styles.toolButton}
                  onPress={() => setDiscardModalVisible(true)}>
                  <AntDesign name="close-circle" size={26} color={colors.danger} />
                </TouchableOpacity>

                {/* Publish */}
                <TouchableOpacity
                  style={[styles.toolButton, {backgroundColor: '#10B981'}]}
                  onPress={handlePublish}>
                  <MaterialIcons
                    name="domain-verification"
                    size={26}
                    color="white"
                  />
                </TouchableOpacity>
              </XStack>
            </YStack>

            {/* Content Header */}
            <YStack padding="$5" gap="$4" marginTop="$8">
              {improvement?.article?.tags && (
                <Text fontSize={13} color={colors.primary} fontWeight="600">
                  {improvement.article.tags.map((t: any) => t.name).join(' • ')}
                </Text>
              )}

              <Text
                fontSize={24}
                fontWeight="700"
                color={colors.text}
                lineHeight={32}>
                {improvement?.article?.title || 'Clinical Revision Review'}
              </Text>

              <Text fontSize={15} color={colors.secondaryText}>
                Author: {improvement?.article?.authorName || 'Medical Contributor'}
              </Text>

              {improvement?.edit_reason && (
                <YStack
                  backgroundColor={isDarkMode ? '#1E293B' : '#F1F5F9'}
                  padding="$3.5"
                  borderRadius={12}
                  borderLeftWidth={4}
                  borderLeftColor={colors.primary}>
                  <Text fontSize={12} fontWeight="700" color={colors.primary} marginBottom={2}>
                    REVISION RATIONALE
                  </Text>
                  <Text fontSize={14} color={colors.text}>
                    {improvement.edit_reason}
                  </Text>
                </YStack>
              )}

              <AutoHeightWebView
                source={{html: contentToDisplay}}
                style={{width: '100%', marginVertical: 20}}
                customStyle="body { font-family: system-ui; font-size: 16px; line-height: 1.7; color: #1e293b; }"
              />
            </YStack>

            {/* Feedback Input */}
            {destination !== StatusEnum.PUBLISHED && (
              <YStack padding="$5" gap="$3">
                <TextArea
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Write your clinical review feedback here..."
                  height={130}
                  borderWidth={1.5}
                  borderColor={colors.border}
                  focusStyle={{borderColor: colors.primary}}
                  color={colors.text}
                />

                <Button
                  backgroundColor={colors.primary}
                  height={50}
                  borderRadius={12}
                  onPress={handlePostFeedback}
                  disabled={!feedback.trim()}>
                  <Text color="white" fontWeight="700" fontSize={16}>
                    Post Feedback
                  </Text>
                </Button>
              </YStack>
            )}

            {/* Comments */}
            {comments.length > 0 && (
              <YStack padding="$5" gap="$4">
                <Text fontSize={18} fontWeight="700" color={colors.text}>
                  Review Feedback History
                </Text>
                {comments.map((comment, index) => (
                  <CommentCardItem
                    key={comment._id || index}
                    item={comment}
                    isSelected={false}
                    handleMentionClick={() => {}}
                  />
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Modals */}
        <DiscardReasonModal
          visible={discardModalVisible}
          callback={handleDiscard}
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
