// store/slices/matchmakingSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabaseClient";

export interface MatchProfile {
  id: string;
  name: string;
  profile_type: string;
  avatar_url: string | null;
  expertise?: string[];
  asset_types?: string[];
  markets?: string[];
  needs?: string[];
  matchScore?: number;
}

interface MatchmakingState {
  matches: MatchProfile[];
  loading: boolean;
}

const initialState: MatchmakingState = {
  matches: [],
  loading: false,
};

export const fetchMatches = createAsyncThunk(
  "matchmaking/fetchMatches",
  async (userId: string) => {
    const [{ data: me, error: meError }, { data: others, error: othersError }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("profiles").select("*").neq("id", userId),
      ]);

    if (meError || !me || othersError || !others) return [];

    return others
      .map((cand) => ({ ...cand, matchScore: computeMatchScore(me, cand) }))
      .filter((c) => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }
);

const matchmakingSlice = createSlice({
  name: "matchmaking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
        state.loading = false;
      })
      .addCase(fetchMatches.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default matchmakingSlice.reducer;

function computeMatchScore(me: MatchProfile, cand: MatchProfile): number {
  let score = 0;
  const myMarkets = me.markets ?? [];
  const myAssets = me.asset_types ?? [];
  const myExpertise = me.expertise ?? [];
  const myNeeds = me.needs ?? [];
  const candMarkets = cand.markets ?? [];
  const candAssets = cand.asset_types ?? [];
  const candExpertise = cand.expertise ?? [];
  const candNeeds = cand.needs ?? [];

  score += (overlap(myMarkets, candMarkets) / 3) * 0.20;
  score += (overlap(myAssets, candAssets) / 3) * 0.15;
  score += (overlap(myExpertise, candExpertise) / 3) * 0.10;
  score += (overlap(myNeeds, candExpertise) / 3) * 0.40;
  score += (overlap(myExpertise, candNeeds) / 3) * 0.15;

  return score;
}

function overlap(a: string[] = [], b: string[] = []) {
  return a.filter((x) => b.includes(x)).length;
}
