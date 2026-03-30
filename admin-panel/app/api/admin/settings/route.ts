import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { updateStoreSettings } from "@/lib/db/mutations";
import { getStoreSettings } from "@/lib/db/queries";
import { settingsSchema } from "@/lib/validations/settings";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const settings = await getStoreSettings(guard.supabase);
    return NextResponse.json({ data: settings });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao carregar configuracoes." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }

    const current = await getStoreSettings(guard.supabase);
    const updated = await updateStoreSettings(guard.supabase, {
      id: current.id,
      orders_enabled: parsed.data.orders_enabled,
      store_open: parsed.data.store_open,
      warning_message: parsed.data.warning_message || null,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao atualizar configuracoes." },
      { status: 500 },
    );
  }
}
