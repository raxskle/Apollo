import { configureStore } from "@reduxjs/toolkit";
import rootReducer, { RootState } from "./reducers.ts";

const store = configureStore<RootState>({
  reducer: rootReducer,
});

export type { RootState };
export default store;
