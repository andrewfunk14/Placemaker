// store/hooks/useMatchmaking.ts
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Profile {
  id: string;
  name: string;
  profile_type: string;
  avatar_url: string | null;
  expertise?: string[];
  asset_types?: string[];
  markets?: string[];
  needs?: string[];
}

export default function useMatchmaking(userId: string | null) {
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function runMatchmaking() {
      setLoading(true);

      const { data: me, error: meError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (meError || !me) {
        console.error("Failed to fetch self profile:", meError);
        setLoading(false);
        return;
      }

      const { data: others, error: othersError } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userId);

      if (othersError || !others) {
        console.error("Failed to fetch other profiles:", othersError);
        setLoading(false);
        return;
      }

      /** 3. Compute match score for each candidate */
      const scored = others
        .map((cand) => ({
          ...cand,
          matchScore: computeMatchScore(me, cand),
        }))
        .filter((c) => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      setMatches(scored);
      setLoading(false);
    }

    runMatchmaking();
  }, [userId]);

  return { matches, loading };
}

/* SCORING ALGORITHM HERE */
function computeMatchScore(me: Profile, cand: Profile): number {
  let score = 0;

  const myMarkets = me.markets ?? [];
  const myAssets = me.asset_types ?? [];
  const myExpertise = me.expertise ?? [];
  const myNeeds = me.needs ?? [];

  const candMarkets = cand.markets ?? [];
  const candAssets = cand.asset_types ?? [];
  const candExpertise = cand.expertise ?? [];
  const candNeeds = cand.needs ?? [];


  // 1. Markets — 20%
  score += (overlap(myMarkets, candMarkets) / 3) * 0.20;

  // 2. Asset Types — 15%
  score += (overlap(myAssets, candAssets) / 3) * 0.15;

  // 3. Shared Expertise — 10%
  score += (overlap(myExpertise, candExpertise) / 3) * 0.10;

  // 4. Their expertise solves MY needs — 40%
  score += (overlap(myNeeds, candExpertise) / 3) * 0.40;

  // 5. MY expertise solves their needs — 15%
  score += (overlap(myExpertise, candNeeds) / 3) * 0.15;

  return score;
}

function overlap(a: string[] = [], b: string[] = []) {
  return a.filter((x) => b.includes(x)).length;
}
