import { NextResponse } from "next/server";
import { createSupportRequest } from "@/lib/trade/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supportRequest = await createSupportRequest(body);
    return NextResponse.json({ supportRequest });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save support request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
