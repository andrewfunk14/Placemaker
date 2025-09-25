// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import type { UserRole } from "../../app/userContext";

// User type with multiple roles
export interface User {
  id: string;
  name?: string;
  email: string;
  roles: UserRole[]; // ✅ multiple roles
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Fetch user details after authentication
export const fetchUserDetails = createAsyncThunk(
  "auth/fetchUserDetails",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role") // role in DB is string or array
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Convert single role string to array for Redux
      const roles: UserRole[] = Array.isArray(data.role)
        ? data.role.filter((r: string) =>
            ["placemaker", "policymaker", "dealmaker", "changemaker"].includes(r)
          )
        : ["placemaker", ...(data.role ? [data.role] : [])];

      return { ...data, roles } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Sign in with email
export const signInWithEmail = createAsyncThunk(
  "auth/signInWithEmail",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error("No user ID returned from authentication");

      // Fetch user details from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, role, organization_key, phone_number, hourly_rate")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

      // Convert single role string to array
      const roles: UserRole[] = Array.isArray(userData.role)
        ? userData.role.filter((r: string) =>
            ["placemaker", "policymaker", "dealmaker", "changemaker"].includes(r)
          )
        : ["placemaker", ...(userData.role ? [userData.role] : [])];

      return { ...userData, roles } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Sign out
export const signOut = createAsyncThunk("auth/signOut", async (_, { rejectWithValue }) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// --- Slice --- //
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sign In
      .addCase(signInWithEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Sign Out
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
