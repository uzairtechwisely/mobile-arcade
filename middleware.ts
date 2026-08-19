import { NextRequest, NextResponse } from "next/server";
import { landingPageBySlug } from "@/lib/landing-pages";

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};

function getSubdomain(host: string) {
  const clean = host.split(":")[0].toLowerCase();
  if (clean.includes("localhost")) return null;
  const parts = clean.split(".").filter(Boolean);
  if (parts.length < 3) return null;
  const sub = parts[0];
  if (sub === "www") return null;
  return sub;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  if (!host) return NextResponse.next();
  const sub = getSubdomain(host);
  if (!sub) return NextResponse.next();
  if (!landingPageBySlug[sub]) return NextResponse.next();

  const url = req.nextUrl.clone();
  if (url.pathname.startsWith("/lp/")) return NextResponse.next();
  url.pathname = `/lp/${sub}`;
  return NextResponse.rewrite(url);
}

