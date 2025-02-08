import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = { showCommentBar: false, search: "", fullWidth: false };

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
  },
});

export const { switchShowCommentBar, setSearch, setFullWidth } =
  viewSlice.actions;
export default viewSlice.reducer;
export type ViewState = ReturnType<typeof viewSlice.reducer>;
