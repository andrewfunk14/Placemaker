import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export type ProjectStatus = "idea" | "in progress" | "completed";

export interface Creator {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export interface Project {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  location: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  files?: string[] | null;
  creator?: Creator | null;
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

const STORAGE_BUCKET = "projects";

/**
 * Normalize Supabase join (array → object)
 */
function normalizeCreator(
  creator: Creator[] | Creator | null | undefined
): Creator | null {
  if (!creator) return null;
  return Array.isArray(creator) ? creator[0] ?? null : creator;
}

// GET /projects
export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("projects/fetchProjects", async (_, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      id,
      created_by,
      title,
      description,
      location,
      status,
      created_at,
      updated_at,
      files,
      creator:profiles (
        id,
        name,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return rejectWithValue(error?.message ?? "Failed to load projects.");
  }

  return data.map((p) => ({
    ...p,
    creator: normalizeCreator(p.creator),
  }));
});

// POST /projects
export const createProject = createAsyncThunk<
  Project,
  {
    title: string;
    description?: string;
    location?: string;
    status?: ProjectStatus;
    files?: string[];
  },
  { rejectValue: string }
>("projects/createProject", async (payload, { rejectWithValue }) => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return rejectWithValue("You must be logged in to create a project.");
  }

  const { title, description, location, status = "idea", files } = payload;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      created_by: userData.user.id,
      title,
      description: description ?? null,
      location: location ?? null,
      status,
      files: files ?? null,
    })
    .select(`
      id,
      created_by,
      title,
      description,
      location,
      status,
      created_at,
      updated_at,
      files,
      creator:profiles (
        id,
        name,
        avatar_url
      )
    `)
    .single();

  if (error || !data) {
    return rejectWithValue(error?.message ?? "Failed to create project.");
  }

  return {
    ...data,
    creator: normalizeCreator(data.creator),
  };
});

// DELETE /projects
export const deleteProject = createAsyncThunk<
  string,
  { id: string; files?: string[] | null },
  { rejectValue: string }
>("projects/deleteProject", async ({ id, files }, { rejectWithValue }) => {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return rejectWithValue(error.message);

    if (files?.length) {
      const paths = files
        .map((url) => {
          const marker = "/object/public/";
          const idx = url.indexOf(marker);
          return idx === -1 ? null : url.slice(idx + marker.length).split("/").slice(1).join("/");
        })
        .filter(Boolean) as string[];

      if (paths.length) {
        await supabase.storage.from(STORAGE_BUCKET).remove(paths);
      }
    }

    return id;
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Failed to delete project.");
  }
});

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload ?? "Failed to load projects.";
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

export default projectsSlice.reducer;
