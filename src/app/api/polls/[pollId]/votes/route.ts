import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { activePoll } from "@/data/poll";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { getRedis } from "@/lib/server/redis";

const VoteSchema = z.object({
  optionKey: z.string().min(1).max(80),
  postcode: z.string().max(20).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ pollId: string }> },
) {
  const { pollId } = await context.params;

  if (pollId !== activePoll.slug) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const rl = await enforceRateLimit({
    scope: `poll:${pollId}`,
    limit: 12,
    windowSeconds: 600,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = VoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const allowed = new Set(activePoll.options.map((o) => o.key));
  if (!allowed.has(parsed.data.optionKey)) {
    return NextResponse.json({ ok: false, error: "invalid_option" }, { status: 400 });
  }

  try {
    const redis = getRedis();
    await redis.hincrby(
      `poll:${pollId}:counts`,
      parsed.data.optionKey,
      1,
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "storage_unavailable" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
