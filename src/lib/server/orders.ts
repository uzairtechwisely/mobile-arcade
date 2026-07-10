import { getRedis } from "@/lib/server/redis";

export type StoredOrder = {
  id: string;
  createdAt: string;
  title: string;
  imageUrl?: string;
  area?: string;
};

export async function getRecentOrders(limit: number) {
  try {
    const redis = getRedis();
    const ids = (await redis.lrange(
      "order:recent",
      0,
      Math.max(limit - 1, 0),
    )) as string[];
    const orders = (await Promise.all(
      ids.map((id) => redis.get(`order:${id}`)),
    )) as Array<StoredOrder | null>;
    return orders.filter(Boolean) as StoredOrder[];
  } catch {
    return [];
  }
}
