import { cache } from "react";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getSessionUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getSupabaseWithUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
});
