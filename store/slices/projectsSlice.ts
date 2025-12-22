// store/slices/projectsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export type ProjectStatus = "idea" | "in progress" | "completed";

export interface Project {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return rejectWithValue(error.message);
    }

    return data as Project[];
  }
);

export const createProject = createAsyncThunk(
  "projects/createProject",
  async (
    payload: {
      title: string;
      description?: string;
      location?: string;
      status?: ProjectStatus;
    },
    { rejectWithValue }
  ) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return rejectWithValue("You must be logged in to create a project.");
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        created_by: userData.user.id,
        title: payload.title,
        description: payload.description ?? null,
        location: payload.location ?? null,
        status: payload.status ?? "idea",
      })
      .select("*")
      .single();

    if (error) {
      return rejectWithValue(error.message);
    }

    return data as Project;
  }
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.loading = false;
          state.projects = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to load projects.";
      })
      // createProject
      .addCase(createProject.pending, (state) => {
        state.error = null;
      })
      .addCase(
        createProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          // Add new project at the top
          state.projects.unshift(action.payload);
        }
      )
      .addCase(createProject.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to create project.";
      });
  },
});

export default projectsSlice.reducer;
