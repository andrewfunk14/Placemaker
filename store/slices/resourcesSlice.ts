// store/slices/resourcesSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url?: string | null;
  tier_access: "free" | "paid" | null;
  is_approved: boolean;
  tags: string[];
  uploaded_by?: string | null;
  created_at: string;
  profiles?: {
    avatar_url?: string | null;
    name?: string | null;
  }[];  
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

// 🟢 FETCH
export const fetchResources = createAsyncThunk(
  "resources/fetchResources",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data as Resource[];
  }
);

// 🟣 UPLOAD (user or admin)
export const uploadResource = createAsyncThunk(
  "resources/uploadResource",
  async (resource: Omit<Resource, "id" | "created_at">, { rejectWithValue }) => {
    const { error } = await supabase.from("resources").insert([resource]);
    if (error) return rejectWithValue(error.message);
    return resource;
  }
);

// 🔵 APPROVE (admin only)
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

// 🔴 DELETE (admin only)
export const deleteResource = createAsyncThunk(
  "resources/deleteResource",
  async (id: string, { rejectWithValue }) => {
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) return rejectWithValue(error.message);
    return id;
  }
);

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
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
      // APPROVE
      .addCase(approveResource.fulfilled, (state, action) => {
        const resource = state.items.find((r) => r.id === action.payload.id);
        if (resource) {
          resource.is_approved = true;
          resource.tier_access = action.payload.tier_access;
        }
      })      
      // DELETE
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

export default resourcesSlice.reducer;
