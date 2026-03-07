// utils/uploadChatImage.ts
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import { decode } from "base64-arraybuffer";
import { Platform } from "react-native";
import { supabase } from "../lib/supabaseClient";
import { pickImageCompat, convertToJpegIfNeeded, isHeicMime, isHeicUri } from "./imagePickerCompat";

const CHAT_BUCKET = "chat-images";

export async function uploadFromUri(localUri: string): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return await _upload({
    uri: localUri,
    name: "image.jpg",
    mimeType: "image/jpeg",
    userId: user.id,
  });
}

export async function uploadChatImage(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (Platform.OS !== "web") {
    const result = await pickImageCompat();
    if ((result as any)?.canceled) return null;

    const asset = (result as any)?.assets?.[0];
    if (!asset?.uri) return null;

    const needsConvert = isHeicMime(asset.mimeType) || isHeicUri(asset.uri);
    const uri = needsConvert
      ? await convertToJpegIfNeeded(asset.uri, asset.mimeType)
      : asset.uri;
    const mimeType = needsConvert ? "image/jpeg" : asset.mimeType ?? "image/jpeg";
    const name = needsConvert ? "image.jpg" : asset.fileName ?? "image.jpg";

    return await _upload({ uri, name, mimeType, userId: user.id });
  } else {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      multiple: false,
    });
    if (result.canceled) return null;

    const asset = result.assets?.[0];
    if (!asset) return null;

    return await _upload({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      userId: user.id,
    });
  }
}

async function _upload({
  uri,
  name,
  mimeType,
  userId,
}: {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
  userId: string;
}): Promise<string> {
  const ext =
    name?.split(".").pop()?.toLowerCase() ||
    mimeType?.split("/")[1]?.toLowerCase() ||
    "jpg";

  const heicMap: Record<string, string> = { heic: "jpg", heif: "jpg" };
  const safeExt =
    heicMap[ext] ??
    (["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg");

  const fileName = `${Date.now()}_${Math.random().toString(16).slice(2)}.${safeExt}`;
  const filePath = `${userId}/${fileName}`;
  const contentType =
    safeExt === "jpg" || safeExt === "jpeg"
      ? "image/jpeg"
      : mimeType || `image/${safeExt}`;

  let uploadData: Blob | ArrayBuffer;

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    uploadData = await response.blob();
  } else {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    uploadData = decode(base64);
  }

  const { error } = await supabase.storage
    .from(CHAT_BUCKET)
    .upload(filePath, uploadData, { contentType });

  if (error) {
    console.error("[uploadChatImage] Supabase storage error:", JSON.stringify(error));
    throw error;
  }

  const { data } = supabase.storage.from(CHAT_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("Failed to get public URL.");
  return data.publicUrl;
}

export async function deleteChatImage(publicUrl: string): Promise<void> {
  const marker = `/object/public/${CHAT_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) {
    console.warn("[deleteChatImage] Could not parse path from URL:", publicUrl);
    return;
  }
  const path = publicUrl.slice(idx + marker.length);
  console.log("[deleteChatImage] Deleting path:", path);
  const { error } = await supabase.storage.from(CHAT_BUCKET).remove([path]);
  if (error) {
    console.error("[deleteChatImage] Error:", JSON.stringify(error));
  }
}
