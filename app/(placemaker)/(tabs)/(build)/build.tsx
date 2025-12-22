// app/(placemaker)/build.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import {
  fetchProjects,
  createProject,
  Project,
  ProjectStatus,
} from "../../../../store/slices/projectsSlice";
import { useUser } from "../../../userContext";
import { buildStyles as styles } from "../../../../styles/buildStyles";
import PostProjectModal, {
  ProjectFormValues,
} from "../../../build/postProjectModal";

export default function BuildScreen() {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector((state) => state.projects);
  const { roles } = useUser() as { roles?: string[] };

  const isPlacemaker = Array.isArray(roles) && roles.includes("placemaker");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSubmitFromModal = async (data: ProjectFormValues) => {
    const result = await dispatch(
      createProject({
        title: data.title,
        description: data.description,
        location: data.location,
        status: (data.status as ProjectStatus) ?? "idea",
      })
    );

    if (createProject.rejected.match(result)) {
      const payload = (result as any).payload;
      const msg =
        (typeof payload === "string" && payload) || "Failed to create project.";
      throw new Error(msg);
    }
  };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((project) => {
      const title = project.title?.toLowerCase() ?? "";
      // if you later join creator name into the result, this will Just Work
      const creatorName = ((project as any).creator_name || "").toLowerCase();

      return title.includes(q) || creatorName.includes(q);
    });
  }, [projects, searchQuery]);

  const renderProjectCard = (project: Project) => (
    <View key={project.id} style={styles.projectCard}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>

      {project.location ? (
        <Text style={styles.projectLocation}>{project.location}</Text>
      ) : null}

      {project.description ? (
        <Text style={styles.projectDescription}>{project.description}</Text>
      ) : null}

      <Text style={styles.projectMeta}>
        Posted {new Date(project.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Feed */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search bar replaces "Build" + "Live projects" titles */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.search}
            placeholder="Search projects by user or title"
            placeholderTextColor={styles.placeholderColor?.color || "#a0a0a0"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading && filteredProjects.length === 0 ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : filteredProjects.length === 0 ? (
          <Text style={styles.emptyText}>
            No projects found.
          </Text>
        ) : (
          <View style={{ marginTop: 12 }}>
            {filteredProjects.map(renderProjectCard)}
          </View>
        )}

        {error && (
          <Text style={[styles.errorText, { marginTop: 12 }]}>
            {error}
          </Text>
        )}
      </ScrollView>

      {/* FAB for Placemaker users */}
      {isPlacemaker && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

      {/* Post modal */}
      {isPlacemaker && (
        <PostProjectModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleSubmitFromModal}
        />
      )}
    </View>
  );
}
