import { NextResponse } from "next/server";
import { z } from "zod";
import { branches } from "@/data/branches";
import { enforceRateLimit } from "@/lib/server/rate-limit";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const BodySchema = z.object({
  origin: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  branchIds: z.array(z.string().min(1).max(80)).min(1).max(20),
});

export async function POST(req: Request) {
  const rl = await enforceRateLimit({
    scope: "maps:distance",
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

  const branchById = new Map(branches.map((b) => [b.id, b] as const));
  const selected = parsed.data.branchIds
    .map((id) => branchById.get(id))
    .filter((b): b is (typeof branches)[number] => Boolean(b));
  if (!selected.length) {
    return NextResponse.json({ ok: false, error: "no_branches" }, { status: 400 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set(
    "origins",
    `${parsed.data.origin.lat},${parsed.data.origin.lng}`,
  );
  url.searchParams.set(
    "destinations",
    selected.map((b) => `${b.lat},${b.lng}`).join("|"),
  );
  url.searchParams.set("mode", "driving");
  url.searchParams.set("units", "imperial");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  const json = (await res.json().catch(() => null)) as unknown;
  if (!isRecord(json) || !Array.isArray(json.rows) || !json.rows[0]) {
    return NextResponse.json({ ok: false, error: "distance_unavailable" }, { status: 502 });
  }

  const row0 = json.rows[0] as unknown;
  if (!isRecord(row0) || !Array.isArray(row0.elements)) {
    return NextResponse.json({ ok: false, error: "distance_unavailable" }, { status: 502 });
  }

  const elements = row0.elements;
  const results: Array<{ branchId: string; meters: number; seconds: number }> = [];

  for (let i = 0; i < selected.length; i++) {
    const el = elements[i] as unknown;
    if (!isRecord(el) || !isRecord(el.distance) || !isRecord(el.duration)) continue;
    const distance = el.distance.value;
    const duration = el.duration.value;
    if (typeof distance === "number" && typeof duration === "number") {
      results.push({
        branchId: selected[i].id,
        meters: distance,
        seconds: duration,
      });
    }
  }

  return NextResponse.json({ ok: true, results });
}
