import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { createOrder } from "@/lib/db/mutations";
import { getOrders } from "@/lib/db/queries";
import { createOrderSchema } from "@/lib/validations/order";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const orders = await getOrders(guard.supabase);
    return NextResponse.json({ data: orders });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao carregar pedidos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse({
      ...body,
      total_price: Number(body.total_price),
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }

    const order = await createOrder(guard.supabase, parsed.data);
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao criar pedido." },
      { status: 500 },
    );
  }
}
