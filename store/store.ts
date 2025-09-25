// store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import navigationReducer from "./slices/navigationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    navigation: navigationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
