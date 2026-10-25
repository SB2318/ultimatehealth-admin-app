import {createSlice} from '@reduxjs/toolkit';

export interface UserState {
  user_id: string;
  user_token: string;
  user_handle: string;
  isSuperAdmin: boolean;
}

const initialState: UserState = {
  user_id: '',
  user_token: '',
  user_handle: '',
  isSuperAdmin: false,
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
    resetUserState(state) {
      state.user_id = '';
      state.user_token = '';
      state.user_handle = '';
      state.isSuperAdmin = false;
    },
  },
});

export const {
  setUserId,
  setUserToken,
  setUserHandle,
  setIsSuperAdmin,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
