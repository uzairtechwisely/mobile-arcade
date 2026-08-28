import { NextResponse } from "next/server";
import { resolveReward } from "@/lib/trade/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quote = await resolveReward(body);
    return NextResponse.json({ quote });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to resolve reward.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
