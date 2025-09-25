// store/slices/navigationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigationState {
  history: string[];
}

const initialState: NavigationState = {
  history: ["/(placemaker)/home"],
};

const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: {
    pushPath: (state, action: PayloadAction<string>) => {
      const last = state.history[state.history.length - 1];
      if (last !== action.payload) {
        state.history.push(action.payload);
      }
    },
    popPath: (state) => {
      if (state.history.length > 1) {
        state.history.pop();
      }
    },
    resetHistory: (state) => {
        state.history = [];
    },
  },
});

export const { pushPath, popPath, resetHistory } = navigationSlice.actions;
export default navigationSlice.reducer;
