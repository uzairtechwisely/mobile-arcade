import { getRedis } from "@/lib/server/redis";

export type StoredLead = {
  id: string;
  createdAt: string;
  kind: string;
  postcode?: string;
  preferredBranchId?: string;
  meta?: Record<string, unknown>;
};

export async function getRecentLeads(limit: number) {
  try {
    const redis = getRedis();
    const ids = (await redis.lrange("lead:recent", 0, Math.max(limit - 1, 0))) as string[];
    const leads = (await Promise.all(
      ids.map((id) => redis.get(`lead:${id}`)),
    )) as Array<StoredLead | null>;
    return leads.filter(Boolean) as StoredLead[];
  } catch {
    return [];
  }
}

