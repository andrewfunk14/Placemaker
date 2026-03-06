// utils/deleteAccount.ts
import { supabase } from "../lib/supabaseClient";

/**
 * Deletes all user data from storage (client-side) then calls the
 * SECURITY DEFINER DB function to delete all table data + auth record,
 * bypassing RLS entirely.
 *
 * Run this SQL in Supabase SQL Editor first:
 *
 *   -- Prerequisite: ALTER TABLE public.groups ALTER COLUMN leader_id DROP NOT NULL;
 *
 *   CREATE OR REPLACE FUNCTION delete_my_account()
 *   RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
 *   DECLARE uid UUID := auth.uid();
 *   BEGIN
 *     -- 1. Nullify leader_id where user is leader (group survives for other members)
 *     UPDATE public.groups SET leader_id = NULL WHERE leader_id = uid;
 *
 *     -- 2. Delete all data for groups the user created
 *     DELETE FROM public.group_messages
 *       WHERE group_id IN (SELECT id FROM public.groups WHERE created_by = uid);
 *     DELETE FROM public.group_members
 *       WHERE group_id IN (SELECT id FROM public.groups WHERE created_by = uid);
 *     DELETE FROM public.groups WHERE created_by = uid;
 *
 *     -- 3. Remove user from any remaining groups (member but not creator)
 *     DELETE FROM public.group_messages WHERE user_id = uid;
 *     DELETE FROM public.group_members  WHERE user_id = uid;
 *
 *     -- 4. Delete DMs, resources, projects, events
 *     DELETE FROM public.direct_messages WHERE sender_id = uid OR receiver_id = uid;
 *     DELETE FROM public.resources       WHERE uploaded_by = uid;
 *     DELETE FROM public.projects        WHERE created_by  = uid;
 *     DELETE FROM public.events          WHERE created_by  = uid;
 *
 *     -- 5. Delete profile and user records (FK order matters)
 *     DELETE FROM public.profiles WHERE id = uid;
 *     DELETE FROM public.users    WHERE id = uid;
 *     DELETE FROM auth.users      WHERE id = uid;
 *   END;
 *   $$;
 */

async function purgeStorageFolder(bucket: string, folder: string) {
  const { data } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
  if (!data?.length) return;
  const paths = data.map((f) => `${folder}/${f.name}`);
  await supabase.storage.from(bucket).remove(paths);
}

export async function deleteAccount(userId: string): Promise<void> {
  // Storage must be cleaned up client-side (SQL functions can't access storage)
  await purgeStorageFolder("avatars", userId);
  await purgeStorageFolder("chat-images", userId);
  await purgeStorageFolder("resources", `uploads/${userId}`);
  await purgeStorageFolder("projects", `uploads/${userId}`);

  // All table + auth.users deletions handled by SECURITY DEFINER function
  // (bypasses RLS so all rows are actually deleted)
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw new Error(`Account deletion failed: ${error.message}`);
}
