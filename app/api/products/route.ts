import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products/service";

export async function GET() {
  const result = await getProducts();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ products: result.products });
}
