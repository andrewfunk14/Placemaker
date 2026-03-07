// utils/imagePickerCompat.ts
import * as ImagePicker from "expo-image-picker";
import * as IM from "expo-image-manipulator";

type MediaTypeNew = "images" | "videos" | "livePhotos";

export async function pickImageCompat() {
  try {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as MediaTypeNew[], // ✅ new API
      allowsEditing: false,
      quality: 1,
    });
  } catch (e) {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: (ImagePicker as any).MediaTypeOptions?.Images, // ✅ old API
      allowsEditing: false,
      quality: 1,
    });
  }
}

export function isHeicMime(mimeType?: string | null): boolean {
  return !!mimeType && /image\/(heic|heif)/i.test(mimeType);
}

export function isHeicUri(uri?: string | null): boolean {
  return !!uri && /\.(heic|heif)$/i.test(uri);
}

/** Converts a HEIC/HEIF image to JPEG. Returns the original URI on failure. */
export async function convertToJpegIfNeeded(
  uri: string,
  mimeType?: string | null
): Promise<string> {
  if (!isHeicMime(mimeType) && !isHeicUri(uri)) return uri;
  try {
    const context = IM.ImageManipulator.manipulate(uri);
    const ref = await context.renderAsync();
    const result = await ref.saveAsync({
      compress: 0.92,
      format: IM.SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    return uri;
  }
}