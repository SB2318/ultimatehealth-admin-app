
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

