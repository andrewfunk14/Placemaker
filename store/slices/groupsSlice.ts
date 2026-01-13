// store/slices/groupsSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export interface Group {
  id: string;
  name: string;
  created_by: string;
  leader_id: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "member" | "leader" | "admin";
  created_at: string;
}

interface GroupsState {
  groups: Group[];
  membersByGroupId: Record<string, GroupMember[]>;
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  membersByGroupId: {},
  loading: false,
  error: null,
};

export const fetchMyGroups = createAsyncThunk(
  "groups/fetchMyGroups",
  async ({ roles }: { roles: string[] }) => {
    const isAdmin = roles.includes("admin");

    // 🔐 ADMINS: direct groups query
    if (isAdmin) {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name");

      if (error) throw error;
      return data ?? [];
    }

    // 👥 MEMBERS + LEADERS: membership-first query
    const { data, error } = await supabase
      .from("group_members")
      .select(`
        role,
        groups (
          id,
          name,
          created_by,
          leader_id,
          created_at,
          updated_at
        )
      `)
      .order("created_at");

    if (error) throw error;

    // ✅ Deduplicate groups by ID (critical)
    const unique = new Map<string, Group>();

    (data ?? []).forEach((row: any) => {
      const g = row.groups;
      if (g?.id) {
        unique.set(g.id, g);
      }
    });

    return Array.from(unique.values());
  }
);

export const fetchGroupMembers = createAsyncThunk(
  "groups/fetchGroupMembers",
  async (groupId: string) => {
    const { data } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at");

    return { groupId, members: (data ?? []) as GroupMember[] };
  }
);

export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async ({ name, leaderId }: { name: string; leaderId: string }, thunkAPI) => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return thunkAPI.rejectWithValue("Not authenticated");

    const { data: groupData, error: groupErr } = await supabase
      .from("groups")
      .insert({
        name,
        created_by: user.id,
        leader_id: leaderId,
      })
      .select("*")
      .single();

    if (groupErr || !groupData)
      return thunkAPI.rejectWithValue(groupErr?.message);

    const group = groupData as Group;

    const rows = [{ group_id: group.id, user_id: leaderId, role: "leader" }];

    if (user.id !== leaderId) {
      rows.push({ group_id: group.id, user_id: user.id, role: "admin" });
    }

    await supabase.from("group_members").insert(rows);

    return group;
  }
);


export const inviteUserToGroup = createAsyncThunk(
  "groups/inviteUserToGroup",
  async (
    {
      groupId,
      userId,
      role = "member",
    }: {
      groupId: string;
      userId: string;
      role?: "member" | "leader" | "admin";
    },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: userId, role })
      .select("*")
      .single();

    if (error || !data) {
      return rejectWithValue(error?.message ?? "Failed to add member");
    }

    return data as GroupMember;
  }
);


const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    clearGroupsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyGroups.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMyGroups.fulfilled, (s, a) => {
        s.loading = false;
        s.groups = a.payload;
      })
      .addCase(fetchMyGroups.rejected, (s) => {
        s.loading = false;
      })

      .addCase(fetchGroupMembers.fulfilled, (s, a) => {
        s.membersByGroupId[a.payload.groupId] = a.payload.members;
      })

      .addCase(createGroup.fulfilled, (s, a) => {
        s.groups = [a.payload, ...s.groups];
      })

      .addCase(inviteUserToGroup.fulfilled, (s, a) => {
        const m = a.payload;
        if (!m) return;
      
        const arr =
          s.membersByGroupId[m.group_id] ??
          (s.membersByGroupId[m.group_id] = []);
      
        arr.push(m);
      })

      .addCase(inviteUserToGroup.rejected, (s, a) => {
        s.error = a.payload as string;
      });      
  },
});

export const { clearGroupsState } = groupsSlice.actions;
export default groupsSlice.reducer;
