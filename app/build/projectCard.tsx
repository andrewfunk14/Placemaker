// build/projectCard.tsx
import React from "react";
import { View, Text, Image, Platform } from "react-native";
import { Project } from "../../store/slices/projectsSlice";
import { buildStyles as styles } from "../../styles/buildStyles";

interface ProjectCardProps {
  project: Project;
  gridItemStyle?: any;
}

type ProjectStatus = "idea" | "in progress" | "completed";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "#3B82F6",
  "in progress": "#FBBF24",
  completed: "#22C55E",
};

export default function ProjectCard({
  project,
  gridItemStyle,
}: ProjectCardProps) {
  const files = project.files ?? [];
  const firstFile = files[0];

  const statusLabel =
    project.status === "in progress"
      ? "In Progress"
      : project.status.charAt(0).toUpperCase() + project.status.slice(1);

  const createdDate = new Date(project.created_at);
  const statusColor =
    STATUS_COLORS[project.status as ProjectStatus] ?? "#9CA3AF";

  const avatarUrl = project.creator?.avatar_url ?? null;
  const avatarInitial =
    project.creator?.name?.trim()?.charAt(0)?.toUpperCase() ??
    project.title?.trim()?.charAt(0)?.toUpperCase() ??
    "P";

  const Wrapper = Platform.OS === "web" ? View : React.Fragment;
  const wrapperProps = Platform.OS === "web" ? { style: gridItemStyle } : {};

  return (
    <Wrapper {...(wrapperProps as any)}>
      <View style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={styles.projectHeaderLeft}>
            <View style={styles.projectAvatar}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.projectAvatarImage}
                  // resizeMode="cover"
                />
              ) : (
                <View style={styles.projectAvatarFallback}>
                  <Text style={styles.projectAvatarInitial}>
                    {avatarInitial}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.projectHeaderText}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              {project.location ? (
                <Text style={styles.projectLocation}>{project.location}</Text>
                ) : null}
            </View>
          </View>
        </View>

        <View style={styles.statusRow}>
            <View
                style={[
                styles.statusPill,
                {
                    borderColor: `${statusColor}55`,
                    backgroundColor: `${statusColor}20`,
                },
                ]}
            >
                <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
                </Text>

                <Text style={[styles.dot, { color: statusColor }]}>•</Text>

                <Text style={[styles.projectMetaInline, { color: statusColor }]}>
                {createdDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
                </Text>
            </View>
        </View>

        {project.description ? (
          <Text style={styles.projectCaption}>
            {project.description}
          </Text>
        ) : null}

        {/* Media */}
        {firstFile ? (
          <View style={styles.projectMedia}>
            <Image
              source={{ uri: firstFile }}
              style={styles.projectMediaImage}
            />
          </View>
        ) : null}

      </View>
    </Wrapper>
  );
}
