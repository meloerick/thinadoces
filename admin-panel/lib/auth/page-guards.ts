import { redirect } from "next/navigation";

import { LOGIN_REDIRECT } from "@/lib/utils/constants";

import { getAuthenticatedAdmin, isAllowedAdminEmail, isAdminRole } from "./guards";
import { createServerSupabaseClient } from "../supabase/server";

export async function requireAdminUser() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function redirectAuthenticatedFromLogin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const role = (user.app_metadata?.role as string | undefined) ?? "user";
  if (isAdminRole(role) && isAllowedAdminEmail(user.email)) {
    redirect(LOGIN_REDIRECT);
  }

  await supabase.auth.signOut();
}