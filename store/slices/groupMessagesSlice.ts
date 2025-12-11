// store/slices/groupMessagesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectMessagesByGroupId = (groupId: string) =>
  createSelector(
    (state: RootState) => state.groupMessages.messagesByGroupId,
    (allMessages) => allMessages[groupId] ?? []
  );

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users?: {
    name: string;
  };
  profiles?: {
    name: string;
    avatar_url: string | null;
  };
}

interface GroupMessagesState {
  messagesByGroupId: Record<string, GroupMessage[]>;
  loading: boolean;
  error: string | null;
}

const initialState: GroupMessagesState = {
  messagesByGroupId: {},
  loading: false,
  error: null,
};

export const fetchGroupMessages = createAsyncThunk(
  "groupMessages/fetch",
  async (groupId: string) => {
    const { data, error } = await supabase
      .from("group_messages")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    return { groupId, messages: data ?? [] };
  }
);

export const sendGroupMessage = createAsyncThunk(
  "groupMessages/sendGroupMessage",
  async (
    { groupId, content }: { groupId: string; content: string },
    { rejectWithValue }
  ) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return rejectWithValue("Not authenticated");
    }

    const { data, error } = await supabase
      .from("group_messages")
      .insert({
        group_id: groupId,
        content,
        user_id: user.id,
      })
      .select("*")
      .single();

    if (error || !data) {
      return rejectWithValue(error?.message ?? "Failed to send message");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    return {
      ...data,
      profiles: {
        name: profile?.name ?? "Unknown",
        avatar_url: profile?.avatar_url ?? null,
      },
    } as GroupMessage;
  }
);

const groupMessagesSlice = createSlice({
  name: "groupMessages",
  initialState,
  reducers: {
    clearGroupMessagesState: () => initialState,

    messageReceived: (state, action: PayloadAction<GroupMessage>) => {
      const msg = action.payload;

      const arr =
        state.messagesByGroupId[msg.group_id] ??
        (state.messagesByGroupId[msg.group_id] = []);

      const exists = arr.some((m) => m.id === msg.id);
      if (!exists) arr.push(msg);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchGroupMessages.fulfilled,
        (
          state,
          action: PayloadAction<{
            groupId: string;
            messages: GroupMessage[];
          }>
        ) => {
          state.messagesByGroupId[action.payload.groupId] =
            action.payload.messages;
        }
      )

      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const arr =
          state.messagesByGroupId[msg.group_id] ??
          (state.messagesByGroupId[msg.group_id] = []);
        arr.push(msg);
      })

      .addCase(fetchGroupMessages.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(sendGroupMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearGroupMessagesState, messageReceived } =
  groupMessagesSlice.actions;

export default groupMessagesSlice.reducer;
