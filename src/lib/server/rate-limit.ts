import { headers } from "next/headers";
import { getRedis } from "@/lib/server/redis";

export async function enforceRateLimit({
  scope,
  limit,
  windowSeconds,
}: {
  scope: string;
  limit: number;
  windowSeconds: number;
}) {
  const h = await headers();
  const ipRaw = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
  const ip = ipRaw.split(",")[0]?.trim() || "unknown";
  const nowBucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `rl:${scope}:${ip}:${nowBucket}`;

  try {
    const redis = getRedis();
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return { ok: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    return { ok: true, remaining: limit };
  }
}
