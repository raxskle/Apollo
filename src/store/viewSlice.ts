import { createSlice } from "@reduxjs/toolkit";

const initialState = { showCommentBar: false, search: "" };

const viewSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    switchShowCommentBar: (state) => {
      state.showCommentBar = !state.showCommentBar;
    },
    setSearch: (state, action) => {
      state.search = action.payload;
    },
  },
});

export const { switchShowCommentBar, setSearch } = viewSlice.actions;
export default viewSlice.reducer;
export type ViewState = ReturnType<typeof viewSlice.reducer>;
