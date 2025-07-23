import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {StackScreenProps} from '@react-navigation/stack';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Dispatch, RefObject, SetStateAction} from 'react';

export type RootStackParamList = {
  SplashScreen: undefined;
  LoginScreen: undefined;
  SignUpScreen: undefined;
  NewPasswordScreen: undefined;
  OtpScreen: undefined;
  TabScreen: undefined;
  ArticleReviewScreen: {
    articleId: number;
    authorId: string;
    destination: string;
    recordId: string;
  };
  EditProfile: undefined;
  LogoutScreen: {profile_image: string; username: string};
  WorkHistoryScreen: undefined;
  ImprovementReviewScreen: {
    requestId: string;
    authorId: string;
    destination: string;
    recordId: string;
    articleRecordId: string;
  };
  ChangesHistoryScreen: {
    requestId: string;
  };
  CommentScreen: {
    articleId: number;
    commentId: string;
  };
  ReportActionScreen:{
    reportId: string;
    report_admin_id: string;
  }
};

export type Admin = {
  //Profile_image: string | undefined;
  _id: string;
  user_name: string;
  user_handle: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
  Profile_avtar: string;
  isVerified: boolean;
  verificationToken: string | null;
  refreshToken: string | null;
  fcmToken: string | null;
};

export type AuthData = {
  userId: string;
  token: string | null;
  user_handle: string | null;
};

export type EditRequest = {
  _id: string;
  user_id: string;
  article: ArticleData;
  edit_reason: string;
  status: string;
  reviewer_id: string | undefined;
  edited_content: string | undefined;
  editComments: Comment[];
  created_at: Date;
  discardReason: string;
  last_updated: Date;
  pb_recordId: string;
  article_recordId: string;
  imageUtils: string[];
};

export type ArticleData = {
  _id: string;
  title: string;
  authorName: string;
  description: string;
  authorId: string;
  content: string;
  summary: string;
  tags: Category[];
  lastUpdated: string;
  imageUtils: string[];
  viewCount: number;
  //viewUsers: User[];
  repostUsers: string[];
  likeCount: number;
  // likedUsers: User[];
  savedUsers: string[];
  //mentionedUsers: User[];
  assigned_date: string | null;
  discardReason: string;
  status: string;
  reviewer_id: string | null | undefined;
  //contributors: User[];
  pb_recordId: string;
};

export type Category = {
  __v: number;
  _id: string;
  id: number;
  name: string;
};

export type NotificationD = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
};

export type CategoryType = {
  id: number;
  name: string;
};

export type ProfileHeaderProps = {
  username: string;
  userhandle: string;
  profileImg: string | undefined;
  userEmailID: string;
  onOverviewClick: () => void;
  contriutions: string;
  onEditProfileClick: () => void;
  onLogoutClick: () => void;
};

export type HomeScreenFilterModalProps = {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  categories: CategoryType[];
  handleCategorySelection: (category: CategoryType['name']) => void;
  selectCategoryList: CategoryType['name'][];
  handleFilterReset: () => void;
  handleFilterApply: () => void;
  setSortingType: (selectedType: string) => void;
  sortingType: string | '';
};

export type HomeScreenCategoriesFlatlistProps = {
  bottomSheetModalRef2: RefObject<BottomSheetModal>;
  categories: CategoryType[];
  handleCategorySelection: (category: CategoryType['name']) => void;
  selectCategoryList: CategoryType['name'][];
};

export type ReviewCardProps = {
  item: ArticleData;
  onclick: (item: ArticleData, index: number, reason: string) => void;
  isSelected: Boolean;
  onNavigate: (item: ArticleData) => void;
  setSelectedCardId: (id: string) => void;
};

export type ImprovementCardProps = {
  item: EditRequest;
  onclick: (item: EditRequest, index: number, reason: string) => void;
  isSelected: Boolean;
  onNavigate: (item: EditRequest) => void;
  setSelectedCardId: (id: string) => void;
};

export type ProfileEditProps = {
  username: string;
  userhandle: string;
  imgUrl: string;
  setUsername: Dispatch<SetStateAction<string>>;
  setUserHandle: Dispatch<SetStateAction<string>>;
  handleSubmitGeneralDetails: () => void;
  selectImage: () => void;
  old_password: string;
  new_password: string;
  confirm_password: string;
  setOldPassword: Dispatch<SetStateAction<string>>;
  setNewPassword: Dispatch<SetStateAction<string>>;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
};

export type ArticleProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Article'>,
  StackScreenProps<RootStackParamList, 'ArticleReviewScreen'>
>;

export type NotificationProps = BottomTabScreenProps<
  TabParamList,
  'Notification'
>;

export type PodcastProps = BottomTabScreenProps<TabParamList, 'Podcast'>;

export type ReportScreenProps = BottomTabScreenProps<TabParamList, 'Report'>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  StackScreenProps<RootStackParamList, 'EditProfile'>
>;
export type ReviewScreenProp = StackScreenProps<
  RootStackParamList,
  'ArticleReviewScreen'
>;

export type  ReportActionScreenProp = StackScreenProps<
  RootStackParamList,
  'ReportActionScreen'
>;

export type ImprovementScreenProp = StackScreenProps<
  RootStackParamList,
  'ImprovementReviewScreen'
>;
export type SplashScreenProp = StackScreenProps<
  RootStackParamList,
  'SplashScreen'
>;

export type LoginScreenProp = StackScreenProps<
  RootStackParamList,
  'LoginScreen'
>;
export type LogoutScreenProp = StackScreenProps<
  RootStackParamList,
  'LogoutScreen'
>;
export type SignUpScreenProp = StackScreenProps<
  RootStackParamList,
  'SignUpScreen'
>;

export type NewPasswordScreenProp = StackScreenProps<
  RootStackParamList,
  'NewPasswordScreen'
>;

export type OtpScreenProp = StackScreenProps<RootStackParamList, 'OtpScreen'>;

export type ChangesHistoryScreenProp = StackScreenProps<
  RootStackParamList,
  'ChangesHistoryScreen'
>;

export type EditProfileProp = StackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

export type WorkHistoryProps = StackScreenProps<
  RootStackParamList,
  'WorkHistoryScreen'
>;

export type CommentScreenProp = StackScreenProps<
  RootStackParamList,
  'CommentScreen'
>;
export type TabParamList = {
  Article: undefined;
  Podcast: undefined;
  Notification: undefined;
  Report: undefined;
  Profile: undefined;
};

export type Comment = {
  _id: string;
  id: string;
  articleId: number;
  userId: Admin;
  Profile_image: string | undefined;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentCommentId: string;
  replies: Comment[];
  likedUsers: string[];
  status: string;
  isEdited: Boolean;
  isReview: Boolean;
  isNote: Boolean;
};

export type PocketBaseResponse = {
  message: string;
  html_file: string;
  recordId: string;
};

export type ScoreData = {
  score: number;
  corrected: boolean;
  approved: boolean;
  correction_percentage: number;
};

export type ScoreCardProps = {
  isVisible: boolean;
  onClose: () => void;
  data: ScoreData;
};

export type PlagiarismResponse = {
  plagiarised_percentage: number;
  plagiarised_text: string;
  source_title: string;
};

export type PlagiarismProps = {
  isVisible: boolean;
  onClose: () => void;
  data: PlagiarismResponse;
};

export type PodcastData = {
  _id: string;
  user_id: User;
  article_id: number;
  title: string;
  description: string;
  audio_url: string;
  cover_image: string;
  duration: number;
  tags: Category[];
  likedUsers: User[];
  savedUsers: User[];
  viewUsers: User[];
  discardReason: string;
  is_removed: boolean;
  mentionedUsers: User[];
  reportId: string | null;
  status: string;
  admin_id: string | null;
  updated_at: string;
  filePath: string | undefined,
  downloadAt: Date| null,
  commentCount: number|0,
  //podcasts: string[];
};

export type CopyrightCheckerResponse = {
  copyrighted_content: CopyRightContent[];
  copyright_found: boolean;
  image_url: string;
  extracted_text: string;
};

export type CopyRightContent = {
  text: string;
  confidence: string;
};

export type CopyrightCheckerProps = {
  isVisible: boolean;
  onClose: () => void;
  data: CopyrightCheckerResponse[];
};

export enum reportActionEnum {
  PENDING = 'Pending',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed',
  WARN_CONVICT = 'User Warned',
  REMOVE_CONTENT = 'Content Removed',
  EDIT_CONTENT = 'Content Edited',
  RESTORE_CONTENT = 'Content Restored',
  BLOCK_CONVICT = 'User Blocked',
  BAN_CONVICT = 'User Banned',
  ESCALATED = 'Escalated',
  INVESTIGATION = 'Investigation Start',
  IGNORE = 'Ignored',
  CONVICT_REQUEST_TO_RESTORE_CONTENT = 'CONVICT_REQUEST_TO_RESTORE_CONTENT',
  CONVICT_REQUEST_DISAPPROVED = 'CONVICT_REQUEST_DISAPPROVED',
}

export const reportActionMessages: Record<reportActionEnum, string> = {
  [reportActionEnum.PENDING]: 'Marked the report as pending.',
  [reportActionEnum.RESOLVED]: 'Marked the issue as resolved.',
  [reportActionEnum.DISMISSED]: 'Dismissed the report.',
  [reportActionEnum.WARN_CONVICT]: 'Issued a warning to the user.',
  [reportActionEnum.REMOVE_CONTENT]: 'Removed the reported content.',
  [reportActionEnum.EDIT_CONTENT]: 'Edited the reported content.',
  [reportActionEnum.RESTORE_CONTENT]: 'Restored the previously removed content.',
  [reportActionEnum.BLOCK_CONVICT]: 'Blocked the user from the platform.',
  [reportActionEnum.BAN_CONVICT]: 'Banned the user permanently.',
  [reportActionEnum.ESCALATED]: 'Escalated the report for further review.',
  [reportActionEnum.INVESTIGATION]: 'Started an investigation on the report.',
  [reportActionEnum.IGNORE]: 'Ignored the report.',
  [reportActionEnum.CONVICT_REQUEST_TO_RESTORE_CONTENT]: 'Reviewed the user’s request to restore content.',
  [reportActionEnum.CONVICT_REQUEST_DISAPPROVED]: 'Disapproved the user’s request for content restoration.',
};



export type Report = {
  _id: string;
  admin_id: string | null;
  action_taken: string;
  articleId: ArticleData;
  commentId: Comment;
  reportedBy: User;
  convictId: User;
  reasonId: Reason;
  last_action_date: Date;
  created_at: Date;
  convict_statement: string | null;
};

export type User = {
  user_name: string;
};

export type Reason = {
  _id: string;
  reason: string;
  status: string;
};
