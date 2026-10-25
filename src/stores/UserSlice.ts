import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface UserState {
  user_id: string;
  user_token: string;
  user_handle: string;
  isSuperAdmin: boolean;
  isGuest: boolean;
}

const initialState: UserState = {
  user_id: '',
  user_token: '',
  user_handle: '',
  isSuperAdmin: false,
  isGuest: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    setUserId(state, action) {
      state.user_id = action.payload;
    },

    setUserToken(state, action) {
      state.user_token = action.payload;
    },
    setUserHandle(state, action) {
      state.user_handle = action.payload;
    },
    setIsSuperAdmin(state, action) {
      state.isSuperAdmin = Boolean(action.payload);
    },
    setIsGuest(state, action: PayloadAction<boolean>) {
      state.isGuest = Boolean(action.payload);
    },
    setGuestMode(state) {
      state.user_id = 'guest_reviewer_id';
      state.user_token = 'guest_demo_jwt_token';
      state.user_handle = 'guest_reviewer';
      state.isSuperAdmin = true;
      state.isGuest = true;
    },
    resetUserState(state) {
      state.user_id = '';
      state.user_token = '';
      state.user_handle = '';
      state.isSuperAdmin = false;
      state.isGuest = false;
    },
  },
});

export const {
  setUserId,
  setUserToken,
  setUserHandle,
  setIsSuperAdmin,
  setIsGuest,
  setGuestMode,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
