import { NextResponse } from "next/server";
import { z } from "zod";
import { searchDeviceModels } from "@/lib/trade/service";

const searchSchema = z.object({
  category: z.enum(["phone", "laptop", "tablet", "gaming_device"]),
  query: z.string().optional().default(""),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchSchema.parse({
      category: searchParams.get("category"),
      query: searchParams.get("query") ?? "",
    });

    const models = await searchDeviceModels(input.category, input.query);
    return NextResponse.json({ models });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to search devices.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
