import { NextResponse } from "next/server";
import { createQuote } from "@/lib/trade/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = await createQuote(body);
    return NextResponse.json({ quote });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create quote.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
