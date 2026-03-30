import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/auth/guards";
import { createProduct } from "@/lib/db/mutations";
import { getProducts } from "@/lib/db/queries";
import { productSchema } from "@/lib/validations/product";

export async function GET() {
  const guard = await ensureAdminApi();
  if (!guard.ok) {
    return NextResponse.json({ message: "Nao autorizado." }, { status: guard.status });
  }

  try {
    const products = await getProducts(guard.supabase);
    return NextResponse.json({ data: products });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao carregar produtos." },
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
    const parsed = productSchema.safeParse({
      ...body,
      price: Number(body.price),
    });

    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.errors[0]?.message ?? "Dados invalidos." }, { status: 400 });
    }

    const product = await createProduct(guard.supabase, parsed.data);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao criar produto." },
      { status: 500 },
    );
  }
}
