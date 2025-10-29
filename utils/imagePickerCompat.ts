// utils/imagePickerCompat.ts
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

type MediaTypeNew = "images" | "videos" | "livePhotos";

export async function pickImageCompat() {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as MediaTypeNew[], // ✅ new API
      allowsEditing: Platform.OS !== "web",
      aspect: [1, 1],
      quality: 1,
    });
  } catch (e) {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: (ImagePicker as any).MediaTypeOptions?.Images, // ✅ old API
      allowsEditing: Platform.OS !== "web",
      aspect: [1, 1],
      quality: 1,
    });
  }
}
