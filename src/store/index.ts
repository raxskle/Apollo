import { combineReducers, configureStore } from "@reduxjs/toolkit";
import docReducer from "./docSlice.ts";
import viewReducer from "./viewSlice.ts";

const rootReducer = combineReducers({
  view: viewReducer,
  doc: docReducer,
});
type RootState = ReturnType<typeof rootReducer>;

const store = configureStore<RootState>({
  reducer: rootReducer,
});

export type { RootState };
export default store;
