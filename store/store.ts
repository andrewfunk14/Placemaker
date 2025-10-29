// // store/store.ts
// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlice';
// import navigationReducer from "./slices/navigationSlice";
// import eventsReducer from './slices/eventsSlice';
// import profileReducer from './slices/profileSlice';

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     navigation: navigationReducer,
//     events: eventsReducer,
//     profile: profileReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import navigationReducer from "./slices/navigationSlice";
import eventsReducer from "./slices/eventsSlice";
import profileReducer from "./slices/profileSlice";

const appReducer = combineReducers({
  auth: authReducer,
  navigation: navigationReducer,
  events: eventsReducer,
  profile: profileReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logout" || action.type === "profile/clearProfile") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
