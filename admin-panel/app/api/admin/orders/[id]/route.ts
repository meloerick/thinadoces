import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { deleteOrder } from "@/lib/db/mutations";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const { id } = await context.params;
    await deleteOrder(guard.supabase, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao excluir pedido." },
      { status: 500 },
    );
  }
}
