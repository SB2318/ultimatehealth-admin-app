import {configureStore} from '@reduxjs/toolkit';
//import NetworkSlice from './NetworkSlice';
//import articleReducer from './articleSlice';
import userReducer from './UserSlice';
import articleReducer from './articleSlice'

const store = configureStore({
  reducer: {
    //network: NetworkSlice,
    //article: articleReducer,
    user: userReducer,
    article: articleReducer
  },
});

export default store;