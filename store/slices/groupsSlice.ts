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
  async ({ roles, userId }: { roles: string[]; userId: string }) => {
    const isAdmin = roles.includes("admin");

    // ADMINS: direct groups query
    if (isAdmin) {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("name");

      if (error) throw error;
      return data ?? [];
    }

    // Step 1: get the group IDs this user belongs to
    const { data: memberRows, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);

    // console.log("[fetchMyGroups] userId:", userId, "memberRows:", memberRows?.length, "memberError:", memberError?.message);

    if (memberError) throw memberError;
    if (!memberRows?.length) return [];

    const groupIds = memberRows.map((r: any) => r.group_id);

    // Step 2: fetch the actual group records
    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds)
      .order("name");

    // console.log("[fetchMyGroups] groupData:", groupData?.length, "groupError:", groupError?.message);

    if (groupError) throw groupError;

    return (groupData ?? []) as Group[];
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

export const deleteGroup = createAsyncThunk(
  "groups/deleteGroup",
  async (groupId: string, { rejectWithValue }) => {
    // 1. Fetch all image URLs from this group's messages
    const { data: messages } = await supabase
      .from("group_messages")
      .select("image_url")
      .eq("group_id", groupId)
      .not("image_url", "is", null);

    // 2. Delete storage files
    if (messages?.length) {
      const marker = "/object/public/chat-images/";
      const paths = messages
        .map((m) => {
          const idx = m.image_url.indexOf(marker);
          return idx !== -1 ? m.image_url.slice(idx + marker.length) : null;
        })
        .filter((p): p is string => p !== null);

      if (paths.length) {
        await supabase.storage.from("chat-images").remove(paths);
      }
    }

    // 3. Delete messages, then the group
    await supabase.from("group_messages").delete().eq("group_id", groupId);

    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) return rejectWithValue(error.message);

    return groupId;
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


export const removeGroupMember = createAsyncThunk(
  "groups/removeGroupMember",
  async (
    { groupId, userId }: { groupId: string; userId: string },
    { rejectWithValue }
  ) => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) return rejectWithValue(error.message);

    return { groupId, userId };
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

      .addCase(deleteGroup.fulfilled, (s, a) => {
        s.groups = s.groups.filter((g) => g.id !== a.payload);
        delete s.membersByGroupId[a.payload];
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
      })

      .addCase(removeGroupMember.fulfilled, (s, a) => {
        const { groupId, userId } = a.payload;
        if (s.membersByGroupId[groupId]) {
          s.membersByGroupId[groupId] = s.membersByGroupId[groupId].filter(
            (m) => m.user_id !== userId
          );
        }
      });
  },
});

export const { clearGroupsState } = groupsSlice.actions;
export default groupsSlice.reducer;
