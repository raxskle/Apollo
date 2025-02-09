import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  showCommentBar: false, // 是否显示评论栏
  search: "", // 当前搜索文本
  fullWidth: false, // 是否适应全屏显示
  inputCommentRef: "", // 当前输入的评论引用
};

const viewSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    switchShowCommentBar: (state) => {
      state.showCommentBar = !state.showCommentBar;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setFullWidth: (state, action: PayloadAction<boolean>) => {
      state.fullWidth = action.payload;
    },
    setInputCommentRef: (state, action: PayloadAction<string>) => {
      state.inputCommentRef = action.payload;
    },
  },
});

export const {
  switchShowCommentBar,
  setSearch,
  setFullWidth,
  setInputCommentRef,
} = viewSlice.actions;
export default viewSlice.reducer;
export type ViewState = ReturnType<typeof viewSlice.reducer>;
