import { NextResponse } from "next/server";
import { confirmTrade } from "@/lib/trade/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trade = await confirmTrade(body);
    return NextResponse.json({ trade });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to confirm trade.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
