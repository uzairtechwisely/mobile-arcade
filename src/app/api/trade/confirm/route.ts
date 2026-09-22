import { NextResponse } from "next/server";
import { confirmTrade } from "@/lib/trade/service";
import { formatServiceError } from "@/lib/trade/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trade = await confirmTrade(body);
    return NextResponse.json({ trade });
  } catch (error) {
    const message = formatServiceError(error, "We could not confirm your trade. Please check your details and try again.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
