import { NextResponse } from "next/server";

import { processSellRequest, type SellRequestPayload } from "@/app/lib/sell-request";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SellRequestPayload;
    const result = await processSellRequest(payload);
    const status = result.success ? 200 : 400;

    return NextResponse.json(result, { status });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request payload.",
        errors: {},
      },
      { status: 400 },
    );
  }
}
