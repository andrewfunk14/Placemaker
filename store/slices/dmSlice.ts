// store/slices/dmSlice.ts
import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import { deleteChatImage } from "../../utils/uploadChatImage";
import { RootState } from "../store";

export interface DirectMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
}

interface DMState {
  messagesByThread: Record<string, DirectMessage[]>;
}

const initialState: DMState = {
  messagesByThread: {},
};

export const fetchDMs = createAsyncThunk(
  "dm/fetch",
  async (threadId: string) => {
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at");

    return { threadId, messages: data ?? [] };
  }
);

export const sendDM = createAsyncThunk(
  "dm/send",
  async ({ threadId, senderId, receiverId, content, imageUrl }: any) => {
    const { data } = await supabase
      .from("direct_messages")
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        image_url: imageUrl ?? null,
      })
      .select("*")
      .single();

    return data;
  }
);

export const editDM = createAsyncThunk(
  "dm/edit",
  async (
    { messageId, threadId, content }: { messageId: string; threadId: string; content: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await supabase
      .from("direct_messages")
      .update({ content })
      .eq("id", messageId)
      .select("*")
      .single();

    if (error || !data) return rejectWithValue(error?.message ?? "Failed to edit message");
    return { threadId, message: data as DirectMessage };
  }
);

export const deleteDM = createAsyncThunk(
  "dm/delete",
  async (
    { messageId, threadId, imageUrl }: { messageId: string; threadId: string; imageUrl?: string | null },
    { rejectWithValue }
  ) => {
    const { error } = await supabase
      .from("direct_messages")
      .delete()
      .eq("id", messageId);

    if (error) return rejectWithValue(error.message);
    if (imageUrl) await deleteChatImage(imageUrl);
    return { threadId, messageId };
  }
);

const dmSlice = createSlice({
  name: "dm",
  initialState,
  reducers: {
    dmUpdated: (state, action: PayloadAction<DirectMessage>) => {
      const msg = action.payload;
      const arr = state.messagesByThread[msg.thread_id];
      if (arr) {
        const idx = arr.findIndex((m) => m.id === msg.id);
        if (idx !== -1) arr[idx] = msg;
      }
    },

    dmDeleted: (
      state,
      action: PayloadAction<{ threadId: string; messageId: string }>
    ) => {
      const { threadId, messageId } = action.payload;
      if (state.messagesByThread[threadId]) {
        state.messagesByThread[threadId] = state.messagesByThread[threadId].filter(
          (m) => m.id !== messageId
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDMs.fulfilled, (state, action) => {
        const { threadId, messages } = action.payload;

        const prev = state.messagesByThread[threadId];

        if (
          prev &&
          prev.length === messages.length &&
          prev[prev.length - 1]?.id === messages[messages.length - 1]?.id
        ) {
          return;
        }

        state.messagesByThread[threadId] = messages;
      });

      builder.addCase(sendDM.fulfilled, (state, action) => {
        const msg = action.payload;

        const arr =
          state.messagesByThread[msg.thread_id] ??
          (state.messagesByThread[msg.thread_id] = []);

        arr.push(msg);
      });

      builder.addCase(editDM.fulfilled, (state, action) => {
        const { threadId, message } = action.payload;
        const arr = state.messagesByThread[threadId];
        if (arr) {
          const idx = arr.findIndex((m) => m.id === message.id);
          if (idx !== -1) arr[idx] = message;
        }
      });

      builder.addCase(deleteDM.fulfilled, (state, action) => {
        const { threadId, messageId } = action.payload;
        if (state.messagesByThread[threadId]) {
          state.messagesByThread[threadId] = state.messagesByThread[threadId].filter(
            (m) => m.id !== messageId
          );
        }
      });
  },
});

export const { dmUpdated, dmDeleted } = dmSlice.actions;

export const makeSelectDMsByThread = (threadId: string) =>
  createSelector(
    (state: RootState) => state.dm.messagesByThread,
    (threads) => threads[threadId] ?? []
  );

export default dmSlice.reducer;
