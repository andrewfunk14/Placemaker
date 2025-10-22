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
        .select(
          "id,title,description,start_at,end_at,address,created_by,created_at,updated_at"
        )
        .order("start_at", { ascending: true });

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
      end_at?: string | null;
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
        end_at: payload.end_at ?? null,
      };

      const { error } = await supabase.from("events").insert([insert]);
      if (error) throw error;
      return true;
    } catch (e: any) {
      return rejectWithValue(e.message ?? "Failed to create event");
    }
  }
);

/** Utility: strip undefined so we don't overwrite columns with null unintentionally */
const clean = <T extends Record<string, any>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;

/**
 * Update an event by id.
 * Only pass fields you want to change in `changes`.
 * Requires RLS to allow the current user (e.g. creator/placemaker) to update.
 */
// store/slices/eventsSlice.ts
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

// slices/eventsSlice.ts
export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: string, { rejectWithValue }) => {
    try {
      // `select().single()` forces an error if 0 rows were deleted (e.g., RLS blocked)
      const { data, error } = await supabase
        .from("events")
        .delete()
        .eq("id", id)
        .select("id")
        .single();

      if (error) throw error;
      // data.id is the deleted id
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
        // We don't have the new row here (insert returned true),
        // fetchEvents is called by the UI after creating, so nothing else to do.
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
          // if the item isn't in the list (e.g. stale UI), add it
          s.items.push(a.payload);
          // optional: keep list sorted by start_at
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
