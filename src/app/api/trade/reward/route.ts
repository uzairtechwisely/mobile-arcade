import { NextResponse } from "next/server";
import { resolveReward } from "@/lib/trade/service";
import { formatServiceError } from "@/lib/trade/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = await resolveReward(body);
    return NextResponse.json({ quote });
  } catch (error) {
    const message = formatServiceError(error, "Unable to resolve reward.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
