// slices/eventsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  address: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export interface EventsState {
  items: EventRow[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
    "events/fetchEvents",
    async (_: void, { rejectWithValue }) => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("id,title,description,start_at,end_at,address,created_by,created_at,updated_at")
          .order("start_at", { ascending: true });   // ← all events, oldest→newest
  
        if (error) throw error;
        return (data ?? []) as EventRow[];
      } catch (e: any) {
        return rejectWithValue(e.message ?? "Failed to fetch events");
      }
    }
  );  

// This will be allowed only by RLS if user is a placemaker
export const createEvent = createAsyncThunk(
    "events/createEvent",
    async (
      payload: {
        title: string;
        description?: string | null;
        address?: string | null;
        start_at: string;
        end_at?: string | null;   // <-- allow optional/nullable
      },
      { rejectWithValue }
    ) => {
      try {
        // normalize and only send defined fields
        const insert = {
          title: payload.title,
          description: payload.description ?? null,
          address: payload.address ?? null,
          start_at: payload.start_at,
          end_at: payload.end_at ?? null,  // DB column is nullable
        };
  
        const { error } = await supabase.from("events").insert([insert]);
        if (error) throw error;
        return true;
      } catch (e: any) {
        return rejectWithValue(e.message ?? "Failed to create event");
      }
    }
  );  

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchEvents.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchEvents.fulfilled, (s, a: PayloadAction<EventRow[]>) => { s.loading = false; s.items = a.payload; })
      .addCase(fetchEvents.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      // create
      .addCase(createEvent.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createEvent.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
  },
});

export default eventsSlice.reducer;
