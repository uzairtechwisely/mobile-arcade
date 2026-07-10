import { NextResponse } from "next/server";
import { activePoll } from "@/data/poll";
import { getRedis } from "@/lib/server/redis";

export async function GET() {
  const pollId = activePoll.slug;

  try {
    const redis = getRedis();
    const rawCounts = (await redis.hgetall(
      `poll:${pollId}:counts`,
    )) as Record<string, string> | null;

    const counts: Record<string, number> = {};
    for (const opt of activePoll.options) {
      const v = rawCounts?.[opt.key];
      counts[opt.key] = v ? Number(v) : 0;
    }

    return NextResponse.json({
      ok: true,
      poll: activePoll,
      counts,
    });
  } catch {
    return NextResponse.json(
      {
        ok: true,
        poll: activePoll,
        counts: Object.fromEntries(activePoll.options.map((o) => [o.key, 0])),
      },
      { status: 200 },
    );
  }
}

