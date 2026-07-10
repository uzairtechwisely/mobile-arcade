import { NextResponse } from "next/server";
import { z } from "zod";
import { getRecentLeads } from "@/lib/server/leads";

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({ limit: url.searchParams.get("limit") });
  const limit = parsed.success ? parsed.data.limit : 6;

  const leads = await getRecentLeads(limit);
  return NextResponse.json({
    ok: true,
    items: leads.map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      kind: l.kind,
      postcode: l.postcode,
      preferredBranchId: l.preferredBranchId,
      meta: l.meta,
    })),
  });
}

