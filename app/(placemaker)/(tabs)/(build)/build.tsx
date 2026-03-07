// app/(placemaker)/build.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks/hooks";
import {
  fetchProjects,
  createProject,
  Project,
  ProjectStatus,
} from "../../../../store/slices/projectsSlice";
import { useUser } from "../../../userContext";
import { buildStyles as styles, colors } from "../../../../styles/buildStyles";
import PostProjectModal, {
  ProjectFormValues,
} from "../../../build/postProjectModal";
import ProjectCard from "../../../build/projectCard";

export default function BuildScreen() {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector(
    (state) => state.projects
  );
  const { userId, roles } = useUser() as { userId?: string; roles?: string[] };
  const isAdmin = Array.isArray(roles) && roles.includes("admin");

  const { width } = useWindowDimensions();

  // const isPlacemaker = Array.isArray(roles) && roles.includes("placemaker");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<TextInput>(null);

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

    return projects.filter((project: Project) => {
      const title = project.title?.toLowerCase() ?? "";
      const creatorName =
        project.creator?.name?.toLowerCase() ?? "";
      return title.includes(q) || creatorName.includes(q);
    });
  }, [projects, search]);

  // Web-only responsive column count
  const numColumns = useMemo(() => {
    if (Platform.OS !== "web") return 1;
    if (width >= 1200) return 3;
    if (width >= 820) return 2;
    return 1;
  }, [width]);

  // Distribute projects into columns for masonry-style layout on web
  const webColumns = useMemo<Project[][] | null>(() => {
    if (Platform.OS !== "web" || numColumns <= 1) return null;
    const cols: Project[][] = Array.from({ length: numColumns }, () => []);
    filteredProjects.forEach((p, i) => cols[i % numColumns].push(p));
    return cols;
  }, [filteredProjects, numColumns]);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Pressable
          style={[styles.search, { flexDirection: "row", alignItems: "center" }]}
          onPress={() => searchRef.current?.focus()}
        >
          <Ionicons name="search" size={18} color={colors.placeholderText} style={{ marginRight: 8 }} />
          <TextInput
            ref={searchRef}
            value={search}
            onChangeText={setSearch}
            placeholder="Search Projects"
            placeholderTextColor={colors.placeholderText}
            selectionColor={colors.placeholderText}
            keyboardAppearance="dark"
            autoCapitalize="none"
            style={[
              { flex: 1, color: colors.textPrimary, fontSize: 16, alignSelf: "stretch" },
              Platform.OS === "web" && { outlineStyle: "none" } as any,
            ]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close" size={20} color={colors.placeholderText} />
            </Pressable>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={
          webColumns
            ? { paddingHorizontal: 24, paddingBottom: 100 }
            : [styles.mobileList, { paddingBottom: 100 }]
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(fetchProjects())}
            tintColor={colors.accent}
          />
        }
      >
        {filteredProjects.length === 0 ? (
          <Text style={[styles.empty, { width: "100%" }]}>No Projects Found</Text>
        ) : webColumns ? (
          <View style={{ flexDirection: "row", gap: 16 }}>
            {webColumns.map((col, ci) => (
              <View key={ci} style={{ flex: 1, gap: 12 }}>
                {col.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    currentUserId={userId}
                    isAdmin={isAdmin}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={userId}
              isAdmin={isAdmin}
            />
          ))
        )}
      </ScrollView>

      {/* Error */}
      {error && (
        <Text style={[styles.errorText, { marginTop: 12 }]}>
          {error}
        </Text>
      )}

      {/* FAB */}
      {/* {isPlacemaker && ( */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.fabPlus}>＋</Text>
        </TouchableOpacity>
      {/* )} */}

      {/* Modal */}
      {/* {isPlacemaker && ( */}
        <PostProjectModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleSubmitFromModal}
        />
      {/* )} */}
    </View>
  );
}
