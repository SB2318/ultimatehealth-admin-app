
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
  export type ArticleCardProps = {
   item: ArticleData;
   // navigation:
   //   | HomeScreenProps['navigation']
   //   | ProfileScreenProps['navigation']
   //   | UserProfileScreenProp['navigation'];
   success: () => void;
   isSelected: Boolean;
   setSelectedCardId: (id: string) => void;
   //handleRepostAction: (item: ArticleData) => void;
   //handleReportAction: (item: ArticleData) => void;
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
export type ReviewScreenProps = {
  
}