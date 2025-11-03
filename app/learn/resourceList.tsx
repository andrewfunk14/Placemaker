// learn/resourceList.tsx
import React from "react";
import { View, Text } from "react-native";
import ResourceCard from "./resourceCard";
import type { Resource } from "../../store/slices/resourcesSlice";
import { learnStyles as styles } from "../../styles/learnStyles";

interface ResourceListProps {
  resources: Resource[];
  user: {
    id?: string;
    roles?: string[];
    tier?: string;
  } | null;
}

export default function ResourceList({ resources, user }: ResourceListProps) {
  if (!resources || resources.length === 0) {
    return (
      <Text style={styles.empty}>No Resources Found</Text>
    );
  }

  return (
    <View>
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} user={user} />
      ))}
    </View>
  );
}
