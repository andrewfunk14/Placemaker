// app/userContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabaseClient";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slices/authSlice";

// Define user roles
export type UserRole = "placemaker" | "policymaker" | "dealmaker" | "changemaker";

interface UserContextType {
  roles: UserRole[];
  userId: string | null;
  setRoles: (roles: UserRole[]) => void;
  setUserId: (id: string | null) => void;
}

// Create context
export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = useState<UserRole[]>(["placemaker"]); // default always placemaker
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Restore Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const id = session.user.id;
          setUserId(id);
          await AsyncStorage.setItem("userId", id);

          // Fetch roles from `users` table
          const { data: profileData, error } = await supabase
            .from("users")
            .select("roles, email, name")
            .eq("id", id)
            .single();

          if (!error && profileData) {
            const fetchedRoles: string[] = profileData.roles || [];

            // Filter only valid roles
            const validRoles: UserRole[] = (["placemaker", "policymaker", "dealmaker", "changemaker"] as const)
              .filter((role) => fetchedRoles.includes(role)) as UserRole[];

            // Always include "placemaker" by default
            const uniqueRoles: UserRole[] = Array.from(new Set(["placemaker", ...validRoles]));
            setRoles(uniqueRoles);

            await AsyncStorage.setItem("roles", JSON.stringify(uniqueRoles));

            // Update Redux store
            dispatch(
              setUser({
                id,
                email: profileData.email,
                name: profileData.name,
                roles: uniqueRoles,
              })
            );
          }
        } else {
          // Fallback: restore from AsyncStorage
          const savedUserId = await AsyncStorage.getItem("userId");
          const savedRoles = await AsyncStorage.getItem("roles");

          if (savedUserId) setUserId(savedUserId);

          if (savedRoles) {
            const parsedRoles: string[] = JSON.parse(savedRoles);
            const validRoles: UserRole[] = (["placemaker", "policymaker", "dealmaker", "changemaker"] as const)
              .filter((role) => parsedRoles.includes(role)) as UserRole[];
            setRoles(validRoles.length ? validRoles : ["placemaker"]);
          }
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    loadUserData();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
        setRoles(["placemaker"]);
        AsyncStorage.removeItem("userId");
        AsyncStorage.removeItem("roles");
        dispatch(setUser(null));
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  // Update roles
  const handleSetRoles = async (newRoles: UserRole[]) => {
    const uniqueRoles: UserRole[] = Array.from(new Set(["placemaker", ...newRoles]));
    setRoles(uniqueRoles);
    await AsyncStorage.setItem("roles", JSON.stringify(uniqueRoles));
  };

  // Update userId
  const handleSetUserId = async (id: string | null) => {
    setUserId(id);
    if (id) {
      await AsyncStorage.setItem("userId", id);
    } else {
      await AsyncStorage.removeItem("userId");
      dispatch(setUser(null));
    }
  };

  return (
    <UserContext.Provider value={{ roles, userId, setRoles: handleSetRoles, setUserId: handleSetUserId }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export default UserContext;
