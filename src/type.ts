import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {StackScreenProps} from '@react-navigation/stack';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';



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
  }
}

export type Admin={
   Profile_image: Admin | undefined;
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

}

export type AuthData = {
    userId: string;
    token: string | null;
    user_handle: string | null;
};

 export type ArticleData = {
   _id: string;
   title: string;
   description: string;
   authorName: string;
   authorId: string;
   content: string;
   summary: string;
   tags: Category[];
   lastUpdated: string;
   imageUtils: string[];
   viewCount: number;
   viewUsers: [];
   repostUsers: string[];
   likeCount: number;
   likedUsers: [];
   savedUsers: string[];
   mentionedUsers: [];
   status: string;
   reviewer_id: string | null;
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

  username: string,
  userhandle: string,
  profileImg: string | undefined,
  userEmailID: string,
  onOverviewClick : ()=> void,
  contriutions: string,

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
  onNavigate: (item: ArticleData)=> void;
  setSelectedCardId: (id: string) => void;
};


export type ArticleProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Article'>,
  | StackScreenProps<RootStackParamList, 'ArticleReviewScreen'>
  
>;

export type NotificationProps = 
  BottomTabScreenProps<TabParamList, 'Notification'>;

export type PodcastProps = 
  BottomTabScreenProps<TabParamList, 'Podcast'>;

export type ReportScreenProps = 
  BottomTabScreenProps<TabParamList, 'Report'>;

export type ProfileScreenProps = 
  BottomTabScreenProps<TabParamList, 'Profile'>;

export type ReviewScreenProp = StackScreenProps<
  RootStackParamList,
  'ArticleReviewScreen'
>;
export type SplashScreenProp = StackScreenProps<
  RootStackParamList,
  'SplashScreen'
>;

export type LoginScreenProp = StackScreenProps<
  RootStackParamList,
  'LoginScreen'
>;
export type SignUpScreenProp = StackScreenProps<
  RootStackParamList,
  'SignUpScreen'
>;

export type NewPasswordScreenProp = StackScreenProps<
  RootStackParamList,
  'NewPasswordScreen'
>;

export type OtpScreenProp = StackScreenProps<
  RootStackParamList,
  'OtpScreen'
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
  Profile_image: string|undefined;
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