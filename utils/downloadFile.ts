// utils/downloadFile.ts
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

export function getFileName(url: string): string {
  try {
    const raw = decodeURIComponent(url.split("/").pop() ?? "file");
    return raw.replace(/^[a-f0-9]{64}_/, "").replace(/^\d+_/, "");
  } catch {
    return "file";
  }
}

export async function downloadFile(url: string) {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = getFileName(url);
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback if fetch fails (e.g. CORS)
      window.open(url, "_blank");
    }
  } else {
    WebBrowser.openBrowserAsync(url, {
      toolbarColor: "#0d0d0d",
      controlsColor: "#ffd21f",
    });
  }
}
