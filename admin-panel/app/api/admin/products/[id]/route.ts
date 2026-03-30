import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { deleteProduct, updateProduct } from "@/lib/db/mutations";
import { productUpdateSchema } from "@/lib/validations/product";

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
    const parsed = productUpdateSchema.safeParse({
      ...body,
      price: body.price !== undefined ? Number(body.price) : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }

    const updated = await updateProduct(guard.supabase, id, parsed.data);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao atualizar produto." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const { id } = await context.params;
    await deleteProduct(guard.supabase, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao excluir produto." },
      { status: 500 },
    );
  }
}
