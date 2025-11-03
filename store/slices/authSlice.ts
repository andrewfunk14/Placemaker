// slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import type { UserRole } from "../../app/userContext";

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

export const fetchUserDetails = createAsyncThunk(
  "auth/fetchUserDetails",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const roles: UserRole[] = Array.isArray(data.role)
        ? data.role.filter((r: string) =>
            ["admin","free", "placemaker", "policymaker", "dealmaker", "changemaker"].includes(r)
          )
        : ["free", ...(data.role ? [data.role] : [])];

      return { ...data, roles } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

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

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, role, organization_key, phone_number, hourly_rate")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

      const roles: UserRole[] = Array.isArray(userData.role)
        ? userData.role.filter((r: string) =>
            ["admin","free", "placemaker", "policymaker", "dealmaker", "changemaker"].includes(r)
          )
        : ["free", ...(userData.role ? [userData.role] : [])];

      return { ...userData, roles } as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOut = createAsyncThunk(
  "auth/signOut",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      dispatch(logout());
      dispatch({ type: "profile/clearProfile" });
      return true;
    } catch (err: any) {
      dispatch(logout());
      dispatch({ type: "profile/clearProfile" });
      return rejectWithValue(err.message ?? "Sign out failed");
    }
  }
);

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
        state.user = null; // ✅ clear user completely
      })
      .addCase(signOut.rejected, (state) => {
        state.user = null; // ✅ still clear in case of network issues
      });
  },
});

export const { setUser, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
