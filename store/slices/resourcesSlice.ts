// store/slices/resourcesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_urls: string[];
  thumbnail_url?: string | null;
  tier_access: "free" | "paid" | null;
  is_approved: boolean;
  tags: string[];
  uploaded_by?: string | {
    id: string;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
  created_at: string;
}

interface ResourcesState {
  items: Resource[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchResources = createAsyncThunk(
  "resources/fetchResources",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("resources")
      .select(`
        id,
        title,
        description,
        tags,
        tier_access,
        file_urls,
        uploaded_by,
        is_approved,
        created_at,
        uploaded_by:profiles (
          id,
          name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data as Resource[];
  }
);

export const uploadResource = createAsyncThunk(
  "resources/uploadResource",
  async (
    resource: Omit<Resource, "id" | "created_at">,
    { rejectWithValue }
  ) => {
    try {
      const { error } = await supabase.from("resources").insert([resource]);
      if (error) throw error;
      return resource;
    } catch (err: any) {
      console.error("Upload resource failed:", err);
      return rejectWithValue(err.message);
    }
  }
);

export const approveResource = createAsyncThunk(
  "resources/approveResource",
  async ({ id, tier_access }: { id: string; tier_access: "free" | "paid" }, { rejectWithValue }) => {
    const { error } = await supabase
      .from("resources")
      .update({ is_approved: true, tier_access })
      .eq("id", id);
    if (error) return rejectWithValue(error.message);
    return { id, tier_access };
  }
);

export const deleteResource = createAsyncThunk(
  "resources/deleteResource",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("resources")
        .select("file_urls, uploaded_by")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const { error: deleteError } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;

      if (Array.isArray(data?.file_urls) && data.file_urls.length > 0) {
        const pathsToDelete = data.file_urls.map((url: string) => {
          const filename = decodeURIComponent(url.split("/").pop() || "");
          return `uploads/${data.uploaded_by}/${filename}`;
        });
        await supabase.storage.from("resources").remove(pathsToDelete);
      }

      return id;
    } catch (err: any) {
      console.error("Delete resource failed:", err);
      return rejectWithValue(err.message);
    }
  }
);

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveResource.fulfilled, (state, action) => {
        const resource = state.items.find((r) => r.id === action.payload.id);
        if (resource) {
          resource.is_approved = true;
          resource.tier_access = action.payload.tier_access;
        }
      })      
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export default resourcesSlice.reducer;
