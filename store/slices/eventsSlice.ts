// slices/eventsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
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
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const cutoffISO = new Date(Date.now() - TWO_HOURS_MS).toISOString();

      // 🗑️ Remove events that started 2+ hours ago
      // (start_at <= now - 2h)
      await supabase
        .from("events")
        .delete()
        .lte("start_at", cutoffISO);

      // 🔄 Fetch only events that haven't hit that cutoff
      // This keeps "In Progress" (within the 2h window) + upcoming
      const { data, error } = await supabase
        .from("events")
        .select(
          "id,title,description,start_at,address,created_by,created_at,updated_at"
        )
        .gt("start_at", cutoffISO)
        .order("start_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as EventRow[];
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to fetch events");
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (
    payload: {
      title: string;
      description?: string | null;
      address?: string | null;
      start_at: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const insert = {
        title: payload.title,
        description: payload.description ?? null,
        address: payload.address ?? null,
        start_at: payload.start_at,
      };

      const { error } = await supabase.from("events").insert([insert]);
      if (error) throw error;
      return true;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to create event");
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async (args: { id: string; changes: Partial<EventRow> }, { rejectWithValue }) => {
    try {
      const { id, changes } = args;
      const { data, error } = await supabase
        .from("events")
        .update(changes)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No row returned (RLS may have blocked SELECT).");
      return data;
    } catch (e: any) {
      console.error("updateEvent error:", e);
      return rejectWithValue(e.message ?? "Failed to update event");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw error;
      return data.id as string;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to delete event");
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
      .addCase(fetchEvents.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchEvents.fulfilled, (s, a: PayloadAction<EventRow[]>) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchEvents.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })

      // create
      .addCase(createEvent.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createEvent.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(createEvent.fulfilled, (s) => {
        s.loading = false;
      })

      // update
      .addCase(updateEvent.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(updateEvent.fulfilled, (s, a: PayloadAction<EventRow>) => {
        s.loading = false;
        const idx = s.items.findIndex((e) => e.id === a.payload.id);
        if (idx !== -1) {
          s.items[idx] = a.payload;
        } else {
          s.items.push(a.payload);
          s.items.sort(
            (x, y) =>
              new Date(x.start_at).getTime() - new Date(y.start_at).getTime()
          );
        }
      })
      .addCase(updateEvent.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload as string;
      })
      .addCase(deleteEvent.fulfilled, (s, a: PayloadAction<string>) => {
        s.items = s.items.filter((e) => e.id !== a.payload);
      })
      .addCase(deleteEvent.rejected, (s, a) => {
        s.error = a.payload as string;
      });      
  },
});

export default eventsSlice.reducer;
