// store/slices/groupMessagesSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import { deleteChatImage } from "../../utils/uploadChatImage";
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
  image_url?: string | null;
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
    { groupId, content, imageUrl }: { groupId: string; content: string; imageUrl?: string },
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
        image_url: imageUrl ?? null,
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

export const editGroupMessage = createAsyncThunk(
  "groupMessages/edit",
  async (
    { messageId, groupId, content }: { messageId: string; groupId: string; content: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from("group_messages")
      .update({ content })
      .eq("id", messageId)
      .select("*")
      .single();

    if (error || !data) return rejectWithValue(error?.message ?? "Failed to edit message");
    return { groupId, message: data as GroupMessage };
  }
);

export const deleteGroupMessage = createAsyncThunk(
  "groupMessages/delete",
  async (
    { messageId, groupId, imageUrl }: { messageId: string; groupId: string; imageUrl?: string | null },
    { rejectWithValue }
  ) => {
    const { error } = await supabase
      .from("group_messages")
      .delete()
      .eq("id", messageId);

    if (error) return rejectWithValue(error.message);
    if (imageUrl) await deleteChatImage(imageUrl);
    return { groupId, messageId };
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

    messageUpdated: (state, action: PayloadAction<GroupMessage>) => {
      const msg = action.payload;
      const arr = state.messagesByGroupId[msg.group_id];
      if (arr) {
        const idx = arr.findIndex((m) => m.id === msg.id);
        if (idx !== -1) arr[idx] = { ...arr[idx], ...msg };
      }
    },

    messageDeleted: (
      state,
      action: PayloadAction<{ groupId: string; messageId: string }>
    ) => {
      const { groupId, messageId } = action.payload;
      if (state.messagesByGroupId[groupId]) {
        state.messagesByGroupId[groupId] = state.messagesByGroupId[groupId].filter(
          (m) => m.id !== messageId
        );
      }
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

      .addCase(editGroupMessage.fulfilled, (state, action) => {
        const { groupId, message } = action.payload;
        const arr = state.messagesByGroupId[groupId];
        if (arr) {
          const idx = arr.findIndex((m) => m.id === message.id);
          if (idx !== -1) arr[idx] = { ...arr[idx], ...message };
        }
      })

      .addCase(deleteGroupMessage.fulfilled, (state, action) => {
        const { groupId, messageId } = action.payload;
        if (state.messagesByGroupId[groupId]) {
          state.messagesByGroupId[groupId] = state.messagesByGroupId[groupId].filter(
            (m) => m.id !== messageId
          );
        }
      })

      .addCase(fetchGroupMessages.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(sendGroupMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearGroupMessagesState, messageReceived, messageUpdated, messageDeleted } =
  groupMessagesSlice.actions;

export default groupMessagesSlice.reducer;
