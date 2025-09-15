// app/index.tsx
import { Redirect } from "expo-router";
import { useUser } from "./userContext";

export default function Index() {
  const { userId } = useUser();

  if (!userId) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(placemaker)/home" />;
}
