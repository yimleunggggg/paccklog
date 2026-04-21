import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function ensureUserProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
) {
  const safeEmail = user.email?.trim() || `${user.id}@local.invalid`;
  const displayName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;

  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: safeEmail,
      display_name: displayName,
      avatar_url: avatarUrl,
    },
    { onConflict: "id" },
  );

  return { error };
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  return { supabase, user: data.user };
}

export function normalizeItemName(value: string) {
  return value.trim().toLocaleLowerCase();
}
