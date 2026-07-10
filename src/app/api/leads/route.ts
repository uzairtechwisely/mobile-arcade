import { NextResponse } from "next/server";
import { z } from "zod";
import { getRedis } from "@/lib/server/redis";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const LeadSchema = z.object({
  kind: z.enum(["booking", "sell_quote", "campaign", "at_home", "postage"]),
  name: z.string().min(1).max(120),
  phone: z.string().min(3).max(40).optional(),
  email: z.string().email().optional(),
  postcode: z.string().max(20).optional(),
  preferredBranchId: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  const rl = await enforceRateLimit({
    scope: "leads",
    limit: 20,
    windowSeconds: 600,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const lead = { id, createdAt, ...parsed.data };

  try {
    const redis = getRedis();
    await redis.set(`lead:${id}`, lead);
    await redis.lpush(`lead:byKind:${lead.kind}`, id);
    await redis.lpush("lead:recent", id);
    await redis.ltrim("lead:recent", 0, 49);
  } catch {
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id });
}
