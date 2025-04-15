import {createSlice} from '@reduxjs/toolkit';
import {ArticleData, Category} from '../type';

export type ArticleState = {
  filteredAvailableArticles: ArticleData[];
  filteredProgressArticles: ArticleData[];
  filteredCompletedArticles: ArticleData[];
  selectedTags: string[];
  sortType: 'recent' | 'popular' | 'oldest' | '';
  searchMode: boolean;
  article: ArticleData;
  categories: Category[];
}

const initialState: ArticleState = {
  filteredAvailableArticles: [],
  filteredProgressArticles: [],
  filteredCompletedArticles: [],
  selectedTags: [],
  sortType: '',
  searchMode: false,
  article: {
      _id: '',
      title: '',
      authorName: '',
      authorId: '',
      content: '',
      summary: '',
      tags: [],
      lastUpdated: '',
      imageUtils: [],
      viewCount: 0,
      description: '',
      viewUsers: [],
      repostUsers: [],
      likeCount: 0,
      likedUsers: [],
      savedUsers: [],
      mentionedUsers: [],
      status: '',
      reviewer_id: null
  },
  categories: [],
};
const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setFilteredAvailableArticles(state, action) {
      state.filteredAvailableArticles = action.payload.filteredArticles;
    },

    setFilteredProgressArticles(state, action) {
        state.filteredProgressArticles = action.payload.filteredArticles;
    },

    setFilteredCompletedArticles(state, action){
        state.filteredCompletedArticles = action.payload.filteredArticles;
    },

    setSelectedTags(state, action) {
      state.selectedTags = action.payload.selectedTags;
    },

    setSortType(state, action) {
      state.sortType = action.payload.sortType;
    },

    setSearchMode(state, action){
      state.searchMode = action.payload.searchMode;
    },

    setArticle(state, action){
      state.article = action.payload.article;
    },
    setTags(state, action){
      state.categories = action.payload.tags;
    }
  },
});

export const {

  setFilteredAvailableArticles,
  setFilteredProgressArticles,
  setFilteredCompletedArticles,
  setSelectedTags,
  setSortType,
  setSearchMode,
  setArticle,
  setTags
} = articleSlice.actions;

export default articleSlice.reducer;
