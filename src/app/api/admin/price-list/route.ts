import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { applyPriceList } from "@/lib/trade/catalog-store";
import { getTradeDb } from "@/lib/trade/db";
import { parsePriceListFile } from "@/lib/trade/price-list";

/**
 * Price-list upload for the (future) store admin panel.
 *
 * POST multipart/form-data: file (.csv or .xlsx), mode = "replace" | "merge",
 * dryRun = "true" to preview the changes without saving.
 * Auth: `Authorization: Bearer $ADMIN_API_TOKEN`. When the panel gets real staff
 * logins, swap only `isAuthorised` for the session check - the rest stays.
 */

function isAuthorised(request: Request) {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach the price list as a 'file' field." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File is too large (5MB max)." }, { status: 400 });
  }

  const mode = form.get("mode") === "merge" ? "merge" : "replace";
  const dryRun = form.get("dryRun") === "true";

  try {
    const parsed = parsePriceListFile(Buffer.from(await file.arrayBuffer()));
    const db = await getTradeDb();
    const report = await applyPriceList(db, parsed, { mode, dryRun, source: `upload:${file.name}` });
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "Could not read that file as a price list." }, { status: 400 });
  }
}
