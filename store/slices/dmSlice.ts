// store/slices/dmSlice.ts
import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";
import { RootState } from "../store";

export interface DirectMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
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
  async ({ threadId, senderId, receiverId, content }: any) => {
    const { data } = await supabase
      .from("direct_messages")
      .insert({
        thread_id: threadId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      })
      .select("*")
      .single();

    return data;
  }
);

const dmSlice = createSlice({
  name: "dm",
  initialState,
  reducers: {},
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
  },
});

export const makeSelectDMsByThread = (threadId: string) =>
  createSelector(
    (state: RootState) => state.dm.messagesByThread,
    (threads) => threads[threadId] ?? []
  );

export default dmSlice.reducer;
