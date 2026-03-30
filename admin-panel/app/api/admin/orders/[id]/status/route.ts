import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { updateOrderStatus } from "@/lib/db/mutations";
import { updateOrderStatusSchema } from "@/lib/validations/order";

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
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0]?.message ?? "Status invalido." }, { status: 400 });
    }

    const order = await updateOrderStatus(guard.supabase, id, parsed.data.status);
    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao atualizar status." },
      { status: 500 },
    );
  }
}
