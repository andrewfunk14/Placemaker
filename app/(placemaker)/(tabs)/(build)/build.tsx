// app/(placemaker)/build.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import {
  fetchProjects,
  createProject,
  ProjectStatus,
} from "../../../../store/slices/projectsSlice";
import { useUser } from "../../../userContext";
import { buildStyles as styles } from "../../../../styles/buildStyles";
import PostProjectModal, {
  ProjectFormValues,
} from "../../../build/postProjectModal";
import ProjectCard from "../../../build/projectCard";

export default function BuildScreen() {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector(
    (state) => state.projects
  );
  const { roles } = useUser() as { roles?: string[] };

  const { width } = useWindowDimensions();

  const isPlacemaker = Array.isArray(roles) && roles.includes("placemaker");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");

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
        files: data.files,
      })
    );

    if (createProject.rejected.match(result)) {
      const payload = (result as any).payload;
      throw new Error(
        (typeof payload === "string" && payload) ||
          "Failed to create project."
      );
    }
  };

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((project) => {
      const title = project.title?.toLowerCase() ?? "";
      const creatorName =
        project.creator?.name?.toLowerCase() ?? "";
      return title.includes(q) || creatorName.includes(q);
    });
  }, [projects, search]);

  // Web-only responsive grid sizing
  const gridItemStyle = useMemo(() => {
    if (Platform.OS !== "web") return null;
    if (width >= 1200) return styles.gridItem3;
    if (width >= 820) return styles.gridItem2;
    return styles.gridItem1;
  }, [width]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search Projects"
          placeholderTextColor="#a0a0a0"
          keyboardAppearance="dark"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filteredProjects.length === 0 ? (
        <Text style={styles.empty}>No Projects Found</Text>
      ) : (

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            Platform.OS === "web" ? styles.webGrid : styles.mobileList,
            { paddingBottom: 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              gridItemStyle={gridItemStyle}
            />
          ))}
        </ScrollView>
      )}

      {/* Error */}
      {error && (
        <Text style={[styles.errorText, { marginTop: 12 }]}>
          {error}
        </Text>
      )}

      {/* FAB */}
      {isPlacemaker && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      )}

      {/* Modal */}
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
