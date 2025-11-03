// store/slices/eventsSlice.ts
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
  creator_profile?: { id: string; name: string | null; avatar_url: string | null } | null;
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

// Small helper to coerce creator_profile to a single object
function normalizeRows(rows: any[]): EventRow[] {
  return (rows ?? []).map((r) => {
    let cp = r?.creator_profile ?? null;
    if (Array.isArray(cp)) {
      cp = cp[0] ?? null;
    }
    // Optionally, guard fields to satisfy the EventRow type
    const norm: EventRow = {
      id: r.id,
      title: r.title,
      description: r.description ?? null,
      start_at: r.start_at,
      address: r.address ?? null,
      created_by: r.created_by,
      created_at: r.created_at,
      updated_at: r.updated_at,
      creator_profile: cp
        ? {
          id: String(cp.id),
          name: cp.name ?? null,
          avatar_url: cp.avatar_url ?? null,
        }
        : null,
    };
    return norm;
  });
}

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (_: void, { rejectWithValue }) => {
    try {
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const cutoffISO = new Date(Date.now() - TWO_HOURS_MS).toISOString();

      const BASE_COLUMNS =
        "id,title,description,start_at,address,created_by,created_at,updated_at";

      // 🗑️ Clean up old events
      await supabase.from("events").delete().lte("start_at", cutoffISO);

      // 1) Get events
      const { data: eventsRaw, error: evErr } = await supabase
        .from("events")
        .select(BASE_COLUMNS)
        .gt("start_at", cutoffISO)
        .order("start_at", { ascending: true });

      if (evErr) throw evErr;

      const events = (eventsRaw ?? []) as Array<{
        id: string;
        title: string;
        description: string | null;
        start_at: string;
        address: string | null;
        created_by: string;
        created_at: string;
        updated_at: string;
      }>;

      if (!events.length) return [];

      // 2) Collect unique creator ids
      const creatorIds = Array.from(new Set(events.map(e => e.created_by).filter(Boolean)));

      // 3) Fetch minimal profile fields for those ids
      // NOTE: requires a SELECT policy on profiles allowing authenticated users to read id,name,avatar_url
      let profilesById: Record<string, { id: string; name: string | null; avatar_url: string | null }> = {};
      if (creatorIds.length) {
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("id,name,avatar_url")
          .in("id", creatorIds);

        if (pErr) {
          // Don’t fail the whole request—just log and continue without avatars
          console.warn("[fetchEvents] profiles fetch failed; continuing without avatars:", pErr);
        } else {
          profilesById = Object.fromEntries(
            (profs ?? []).map(p => [p.id, { id: p.id, name: p.name ?? null, avatar_url: p.avatar_url ?? null }])
          );
        }
      }

      // 4) Stitch creator_profile onto each event
      const stitched = events.map(e => ({
        ...e,
        creator_profile: profilesById[e.created_by] ?? null,
      })) as EventRow[];

      return stitched;
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
      return data as EventRow;
    } catch (e: any) {
      console.error("updateEvent error:", e);
      return rejectWithValue(e.message ?? "Failed to update event");
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id: string | null, { rejectWithValue }) => {
    try {
      // 🕒 Define 2-hour window in milliseconds
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const now = new Date();
      const cutoffISO = new Date(now.getTime() - TWO_HOURS_MS).toISOString();

      // 🧹 Step 1: Delete any events older than 2 hours past start time
      const { error: cleanupError } = await supabase
        .from("events")
        .delete()
        .lt("start_at", cutoffISO);

      if (cleanupError) {
        console.warn("Auto-cleanup failed:", cleanupError.message);
      }

      // 🗑️ Step 2: If an explicit event ID is provided, delete it manually
      if (id) {
        const { data, error } = await supabase
          .from("events")
          .delete()
          .eq("id", id)
          .select("id")
          .single();

        if (error) throw error;
        return data.id as string;
      }

      // If called with no ID (e.g., auto cleanup only), return null
      return null;
    } catch (e: any) {
      console.error("Delete event failed:", e);
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

      // delete
      .addCase(deleteEvent.fulfilled, (s, a: PayloadAction<string | null>) => {
        // 🧹 If we got a specific event ID, remove it from the list
        if (a.payload) {
          s.items = s.items.filter((e) => e.id !== a.payload);
        } else {
          // If no ID (auto-cleanup mode), re-fetch remaining valid events from server
          // or just leave state as-is (depending on how you handle fetchEvents)
          s.items = s.items.filter((e) => {
            const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
            const eventStart = new Date(e.start_at).getTime();
            return eventStart + TWO_HOURS_MS > Date.now();
          });
        }
        s.error = null;
      })
      .addCase(deleteEvent.rejected, (s, a) => {
        s.error = a.payload as string;
      });      
  },
});

export default eventsSlice.reducer;
