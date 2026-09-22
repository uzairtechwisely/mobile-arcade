import { NextResponse } from "next/server";
import { createQuote } from "@/lib/trade/service";
import { formatServiceError } from "@/lib/trade/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = await createQuote(body);
    return NextResponse.json({ quote });
  } catch (error) {
    const message = formatServiceError(error, "Unable to create quote.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
