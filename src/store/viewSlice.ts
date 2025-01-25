import { createSlice } from "@reduxjs/toolkit";

const initialState = { showCommentBar: false };

const viewSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    switchShowCommentBar: (state) => {
      state.showCommentBar = !state.showCommentBar;
    },
  },
});

export const { switchShowCommentBar } = viewSlice.actions;
export default viewSlice.reducer;
export type ViewState = ReturnType<typeof viewSlice.reducer>;
