// learn/resourceList.tsx
import React from "react";
import { View, Text } from "react-native";
import ResourceCard from "./resourceCard";
import type { Resource } from "../../store/slices/resourcesSlice";
import { learnStyles as styles } from "../../styles/learnStyles";
import { useUser } from "../../app/userContext";

function getCreatorId(r: Resource): string | null {
  if (!r?.uploaded_by) return null;
  if (typeof r.uploaded_by === "object") return r.uploaded_by?.id ?? null;
  return r.uploaded_by;
}

export default function ResourceList({
  resources,
  user,
}: {
  resources: Resource[];
  user: { id?: string; roles?: string[]; tier?: string } | null;
}) {
  const ctx = useUser();
  const currentUserId = ctx?.userId ?? user?.id ?? null;
  const isAdmin =
    ctx?.roles?.includes("admin") || user?.roles?.includes("admin");

  const visibleResources = resources.filter((r) => {
    const creatorId = getCreatorId(r);
    if (isAdmin) return true;
    if (r.is_approved) return true;
    if (creatorId && creatorId === currentUserId) return true;
    return false;
  });

  // if (visibleResources.length === 0) {
  //   return (
  //     <View>
  //       <Text style={styles.empty}>No Resources Found</Text>
  //     </View>
  //   );
  // }

  return (
    <View>
      {visibleResources.map((r) => (
        <ResourceCard key={r.id} resource={r} user={user} />
      ))}
    </View>
  );
}
