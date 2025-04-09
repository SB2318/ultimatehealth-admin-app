import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {StackScreenProps} from '@react-navigation/stack';
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
  }
}

export type Admin={
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
 };

 export type Category = {
   __v: number;
   _id: string;
   id: number;
   name: string;
 };

 export type ReviewCardProps = {
  item: ArticleData;
  onclick: (item: ArticleData, index: number, reason: string) => void;
  isSelected: Boolean;
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