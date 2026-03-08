// store/hooks/useMatchmaking.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchMatches } from "../slices/matchmakingSlice";

export default function useMatchmaking(userId: string | null) {
  const dispatch = useAppDispatch();
  const matches = useAppSelector((s) => s.matchmaking.matches);
  const loading = useAppSelector((s) => s.matchmaking.loading);

  function refetch() {
    if (userId) dispatch(fetchMatches(userId));
  }

  useEffect(() => {
    if (userId) dispatch(fetchMatches(userId));
  }, [userId]);

  return { matches, loading, refetch };
}
