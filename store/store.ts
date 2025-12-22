// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import navigationReducer from "./slices/navigationSlice";
import eventsReducer from "./slices/eventsSlice";
import profileReducer from "./slices/profileSlice";
import resourcesReducer from "./slices/resourcesSlice";
import groupsReducer from "./slices/groupsSlice";
import groupMessagesReducer from "./slices/groupMessagesSlice";
import dmReducer from "./slices/dmSlice";
import projectsReducer from "./slices/projectsSlice";

const appReducer = combineReducers({
  auth: authReducer,
  navigation: navigationReducer,
  events: eventsReducer,
  profile: profileReducer,
  resources: resourcesReducer,
  groups: groupsReducer,
  groupMessages: groupMessagesReducer,
  dm: dmReducer,
  projects: projectsReducer,
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
