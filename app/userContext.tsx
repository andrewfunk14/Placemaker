// userContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabaseClient";
import { useAppDispatch } from "../store/hooks/hooks";
import { setUser } from "../store/slices/authSlice";

export type UserRole = "admin" | "free" | "placemaker" | "policymaker" | "dealmaker" | "changemaker";

interface UserContextType {
  roles: UserRole[];
  userId: string | null;
  setRoles: (roles: UserRole[]) => void;
  setUserId: (id: string | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = useState<UserRole[]>(["free"]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const id = session.user.id;
          setUserId(id);
          await AsyncStorage.setItem("userId", id);

          const { data: profileData, error } = await supabase
            .from("users")
            .select("roles, email, name")
            .eq("id", id)
            .single();

          if (!error && profileData) {
            const fetchedRoles: string[] = profileData.roles || [];

            const validRoles: UserRole[] = (["admin", "free", "placemaker", "policymaker", "dealmaker", "changemaker"] as const)
              .filter((role) => fetchedRoles.includes(role)) as UserRole[];

            const uniqueRoles: UserRole[] = Array.from(new Set(["free", ...validRoles]));
            setRoles(uniqueRoles);

            await AsyncStorage.setItem("roles", JSON.stringify(uniqueRoles));

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
          const savedUserId = await AsyncStorage.getItem("userId");
          const savedRoles = await AsyncStorage.getItem("roles");

          if (savedUserId) setUserId(savedUserId);

          if (savedRoles) {
            const parsedRoles: string[] = JSON.parse(savedRoles);
            const validRoles: UserRole[] = (["admin", "free", "placemaker", "policymaker", "dealmaker", "changemaker"] as const)
              .filter((role) => parsedRoles.includes(role)) as UserRole[];
            setRoles(validRoles.length ? validRoles : ["free"]);
          }
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    loadUserData();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        console.log("🧹 Logged out — clearing context and Redux");
        setUserId(null);
        setRoles(["free"]);
        AsyncStorage.multiRemove(["userId", "roles"]);
        dispatch(setUser(null));
        dispatch({ type: "auth/logout" });
        dispatch({ type: "profile/clearProfile" });
      }
    });    

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [dispatch]);

  const handleSetRoles = async (newRoles: UserRole[]) => {
    const uniqueRoles: UserRole[] = Array.from(new Set(["free", ...newRoles]));
    setRoles(uniqueRoles);
    await AsyncStorage.setItem("roles", JSON.stringify(uniqueRoles));
  };

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

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export default UserContext;
