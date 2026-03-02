// build/projectCard.tsx
import React, { useState } from "react";
import { View, Text, Image, Platform, Alert } from "react-native";
import { Project, ProjectStatus } from "../../store/slices/projectsSlice";
import { buildStyles as styles, colors } from "../../styles/buildStyles";
import { User2 } from "lucide-react-native";
import { useAppDispatch } from "../../store/hooks/hooks";
import { deleteProject, updateProject } from "../../store/slices/projectsSlice";
import PostProjectModal, { ProjectFormValues } from "./postProjectModal";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import CardActionMenu from "../../components/CardActionMenu";

interface ProjectCardProps {
  project: Project;
  gridItemStyle?: any;
  currentUserId?: string | null;
  isAdmin?: boolean;
}

const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "#3B82F6",
  "in progress": "#FBBF24",
  completed: "#22C55E",
};

export default function ProjectCard({
  project,
  gridItemStyle,
  currentUserId,
  isAdmin,
}: ProjectCardProps) {
  const dispatch = useAppDispatch();

  const [avatarError, setAvatarError] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCreator = !!currentUserId && project.created_by === currentUserId;
  const showEllipsis = isCreator || isAdmin;

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

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await dispatch(deleteProject({ id: project.id, files: project.files })).unwrap();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to delete project.");
    }
  };

  const handleEditSubmit = async (data: ProjectFormValues) => {
    const result = await dispatch(
      updateProject({
        id: project.id,
        title: data.title,
        description: data.description,
        location: data.location,
        status: data.status as ProjectStatus,
        files: data.files,
      })
    );
    if (updateProject.rejected.match(result)) {
      const payload = (result as any).payload;
      throw new Error((typeof payload === "string" && payload) || "Failed to update project.");
    }
  };

  const Wrapper = Platform.OS === "web" ? View : React.Fragment;
  const wrapperProps = Platform.OS === "web" ? { style: gridItemStyle } : {};

  return (
    <Wrapper {...(wrapperProps as any)}>
      <View style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={styles.projectHeaderLeft}>
            <View style={styles.projectAvatar}>
              {avatarUrl && !avatarError ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.projectAvatarImage}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <User2 color={colors.accent} size={26} />
              )}
            </View>

            <View style={styles.projectHeaderText}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              {project.location ? (
                <Text style={styles.projectLocation}>{project.location}</Text>
              ) : null}
            </View>
          </View>

          {showEllipsis && (
            <CardActionMenu
              items={[
                { label: "Edit", onPress: () => setShowEdit(true) },
                { label: "Delete", onPress: () => setShowDeleteConfirm(true), danger: true },
              ]}
            />
          )}
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

        {firstFile ? (
          <View style={styles.projectMedia}>
            <Image
              source={{ uri: firstFile }}
              style={styles.projectMediaImage}
            />
          </View>
        ) : null}

        <PostProjectModal
          visible={showEdit}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
          mode="edit"
          project={project}
        />

        <DeleteConfirmModal
          visible={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          itemType="project"
        />
      </View>
    </Wrapper>
  );
}
