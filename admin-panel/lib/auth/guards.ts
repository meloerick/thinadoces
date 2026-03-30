import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ALLOWED_ADMIN_EMAIL } from "@/lib/utils/constants";
import { toAdminUser } from "@/types";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ALLOWED_ADMIN_EMAIL;
}

export async function getAuthenticatedAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role = (user.app_metadata?.role as string | undefined) ?? "user";
  if (!isAdminRole(role) || !isAllowedAdminEmail(user.email)) {
    return null;
  }

  return {
    supabase,
    user,
    adminUser: toAdminUser(user),
  };
}

export async function ensureAdminApi() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false as const, error: "UNAUTHORIZED", status: 401 };
  }

  const role = (user.app_metadata?.role as string | undefined) ?? "user";
  if (!isAdminRole(role) || !isAllowedAdminEmail(user.email)) {
    return { ok: false as const, error: "FORBIDDEN", status: 403 };
  }

  return { ok: true as const, supabase, user };
}