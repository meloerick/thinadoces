import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { toggleProductActive } from "@/lib/db/mutations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (typeof body.active !== "boolean") {
      return NextResponse.json({ message: "Campo active invalido." }, { status: 400 });
    }

    const product = await toggleProductActive(guard.supabase, id, body.active);
    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao alternar produto." },
      { status: 500 },
    );
  }
}
