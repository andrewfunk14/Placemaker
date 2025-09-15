// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { UserProvider } from "./userContext";
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <UserProvider>
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: Platform.OS === 'web' ? { backgroundColor: 'transparent' } : {}
          }}
        />
      </UserProvider>
    </Provider>
  );
}
