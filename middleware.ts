import { NextRequest, NextResponse } from "next/server";
import { getLandingSlugs } from "@/lib/landing-pages";

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};

const ROOT_DOMAIN = "mobilearcadeltd.co.uk";

function getSubdomain(host: string) {
  const clean = host.split(":")[0].toLowerCase();
  if (clean.includes("localhost")) return null;

  const allow =
    clean === ROOT_DOMAIN ||
    clean.endsWith(`.${ROOT_DOMAIN}`) ||
    clean.endsWith(".vercel.app");
  if (!allow) return null;

  if (clean === ROOT_DOMAIN) return null;
  if (clean.endsWith(".vercel.app")) {
    const parts = clean.split(".").filter(Boolean);
    if (parts.length < 3) return null;
    const sub = parts[0];
    if (sub === "www") return null;
    return sub;
  }

  const suffix = `.${ROOT_DOMAIN}`;
  const sub = clean.slice(0, -suffix.length);
  if (!sub || sub.includes(".")) return null;
  if (sub === "www") return null;
  return sub;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  if (!host) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();
  const sub = getSubdomain(host);
  if (!sub) return NextResponse.next();
  if (!getLandingSlugs().includes(sub)) return NextResponse.next();

  const url = req.nextUrl.clone();
  if (url.pathname.startsWith("/lp/")) return NextResponse.next();
  url.pathname = `/lp/${sub}`;
  return NextResponse.rewrite(url);
}
