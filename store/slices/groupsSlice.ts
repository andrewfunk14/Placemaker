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
  async ({ userId, roles }: { userId: string; roles: string[] }) => {
    const isAdmin = roles.includes("admin");

    if (isAdmin) {
      const { data } = await supabase.from("groups").select("*").order("name");
      return data ?? [];
    }

    const { data } = await supabase
      .from("groups")
      .select("*, group_members!inner(user_id)")
      .eq("group_members.user_id", userId)
      .order("name");

    return data ?? [];
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
  async ({
    groupId,
    userId,
    role = "member",
  }: {
    groupId: string;
    userId: string;
    role?: "member" | "leader" | "admin";
  }) => {
    const { data } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: userId, role })
      .select("*")
      .single();

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
        const arr =
          s.membersByGroupId[m.group_id] ??
          (s.membersByGroupId[m.group_id] = []);
        arr.push(m);
      });
  },
});

export const { clearGroupsState } = groupsSlice.actions;
export default groupsSlice.reducer;
