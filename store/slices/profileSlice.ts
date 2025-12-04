// store/slices/profileSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

export interface Profile {
  id: string;
  name: string | null;
  profile_type: string | null;
  bio: string | null;
  avatar_url: string | null;
  updated_at?: string;
  expertise?: string[] | null;
  needs?: string[] | null;
  asset_types?: string[] | null;
  markets?: string[] | null;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "user";

function getWritableTmpDir(): string {
  const fsAny = FileSystem as unknown as {
    cacheDirectory?: string;
    documentDirectory?: string;
    temporaryDirectory?: string;
  };

  const dir =
    fsAny.cacheDirectory ??
    fsAny.temporaryDirectory ??
    fsAny.documentDirectory;

  if (!dir) {
    throw new Error("No writable temporary directory available on this platform.");
  }
  return dir.endsWith("/") ? dir : dir + "/";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchProfile = createAsyncThunk<Profile | null, string>(
  "profile/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select(`
          id, name, profile_type, bio, avatar_url, updated_at,
          expertise, needs, asset_types, markets
        `)        
        .eq("id", userId)
        .maybeSingle();

      if (error && (error as any).code !== "PGRST116") throw error;

      if (!data) {
        const { data: newProfile, error: insertErr } = await supabase
          .from("profiles")
          .insert({ id: userId, name: "New User", profile_type: null, })
          .select()
          .single();
        if (insertErr) throw insertErr;
        data = newProfile;
      }

      return data as Profile;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk<
  Profile,
  {
    id: string;
    name?: string | null;
    profile_type?: string | null;
    bio?: string | null;

    // new optional arrays
    expertise?: string[] | null;
    needs?: string[] | null;
    asset_types?: string[] | null;
    markets?: string[] | null;
  }
>("profile/updateProfile", async (updates, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", updates.id)
      .select(`
        id, name, profile_type, bio, avatar_url, updated_at,
        expertise, needs, asset_types, markets
      `)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const uploadAvatar = createAsyncThunk<
  Profile,
  { userId: string; fileUri: string },
  { rejectValue: string }
>("profile/uploadAvatar", async ({ userId, fileUri }, { rejectWithValue }) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const { data: prof, error: profErr } = await supabase
      .from("profiles")
      .select(`
        id, name, bio, profile_type, avatar_url, updated_at,
        expertise, needs, asset_types, markets
      `)      
      .eq("id", userId)
      .maybeSingle();
    if (profErr) throw profErr;

    // const folder = slugify(prof?.name || `user-${userId.slice(0, 8)}`);
    // const folder = userId;
    // const filename = "avatar.jpg";
    // const path = `${folder}/${filename}`;
    const path = `${userId}/avatar.jpg`;


    const isDataUrl = fileUri.startsWith("data:");
    const contentType = isDataUrl
      ? fileUri.substring(5, fileUri.indexOf(";"))
      : fileUri.toLowerCase().endsWith(".png")
      ? "image/png"
      : "image/jpeg";

    let body: Blob | ArrayBuffer;

    if (Platform.OS === "web") {
      const res = await fetch(fileUri);
      body = await res.blob();
    } else {
      let uriToRead = fileUri;

      if (isDataUrl) {
        const b64 = fileUri.split(",")[1] || "";
        const tmp = `${getWritableTmpDir()}avatar-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(tmp, b64, {
          encoding: ((FileSystem as any).EncodingType?.Base64 ?? "base64") as any,
        });
        uriToRead = tmp;
      }

      const res = await fetch(uriToRead);
      body = await res.arrayBuffer();
    }

    await supabase.storage.from("avatars").remove([path]).catch(() => void 0);
    await sleep(300);

    let lastErr: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { error } = await supabase.storage.from("avatars").upload(path, body, {
        upsert: true,
        contentType,
        cacheControl: "60",
      });

      if (!error) {
        lastErr = null;
        break;
      }

      lastErr = error as any;
      const msg = String(lastErr?.message ?? "");
      const code =
        (lastErr?.statusCode as number | undefined) ??
        (lastErr?.status as number | undefined);

      if (/already exists/i.test(msg) || code === 409 || code === 400) {
        await sleep(500);
        continue;
      }
      throw lastErr;
    }
    if (lastErr) throw lastErr;

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = pub?.publicUrl ? `${pub.publicUrl}?v=${Date.now()}` : null;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select("id, name, bio, profile_type, avatar_url, updated_at")
      .single();
    if (error) throw error;

    return data as Profile;
  } catch (e: any) {
    const msg =
      /row-level security|RLS/i.test(e?.message ?? "")
        ? "Permission denied by RLS. Ensure you're signed in and storage policies allow this action."
        : e?.message ?? "Failed to upload avatar.";
    return rejectWithValue(msg);
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<Profile | null>) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ??
          String(action.error.message ?? "Failed to fetch profile");
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.profile = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action: PayloadAction<Profile>) => {
        state.profile = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
