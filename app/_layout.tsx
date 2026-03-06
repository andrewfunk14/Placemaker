// app/_layout.tsx
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { UserProvider } from "./userContext";
import { Platform } from 'react-native';
import WebAutofillFix from "../styles/webAutofillFix";
import * as NavigationBar from "expo-navigation-bar";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#0d0d0d");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  return (
    <Provider store={store}>
      <UserProvider>
        <WebAutofillFix />
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