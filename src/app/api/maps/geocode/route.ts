import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/server/rate-limit";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const BodySchema = z.object({
  query: z.string().min(3).max(240),
});

export async function POST(req: Request) {
  const rl = await enforceRateLimit({
    scope: "maps:geocode",
    limit: 30,
    windowSeconds: 600,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "missing_google_key" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", parsed.data.query);
  url.searchParams.set("region", "uk");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  const json = (await res.json().catch(() => null)) as unknown;
  if (!isRecord(json) || !Array.isArray(json.results) || !json.results[0]) {
    return NextResponse.json({ ok: false, error: "no_results" }, { status: 404 });
  }

  const first = json.results[0] as unknown;
  if (!isRecord(first) || !isRecord(first.geometry) || !isRecord(first.geometry.location)) {
    return NextResponse.json({ ok: false, error: "no_results" }, { status: 404 });
  }

  const loc = first.geometry.location;
  if (typeof loc.lat !== "number" || typeof loc.lng !== "number") {
    return NextResponse.json({ ok: false, error: "no_results" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    lat: loc.lat,
    lng: loc.lng,
    formattedAddress:
      typeof first.formatted_address === "string"
        ? first.formatted_address
        : undefined,
  });
}
