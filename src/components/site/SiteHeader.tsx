import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ECOMMERCE_URL } from "@/lib/public-config";

const nav = [
  { href: "/repair", label: "Repair", external: false },
  { href: "/trade", label: "Trade", external: false },
  { href: "/customise", label: "Customise", external: false },
  { href: ECOMMERCE_URL, label: "Shop", external: true },
  { href: "/locations", label: "Locations", external: false },
  { href: "/service-finder", label: "Store finder", external: false },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <div className="border-b border-border bg-background">
        <Container className="flex h-10 items-center justify-between text-xs font-semibold">
          <div className="text-muted">
            Serving Norwich since 2010 • 6-month warranty • No fix, no fee
          </div>
          <a
            href="tel:07402192492"
            className="text-foreground hover:text-brand"
          >
            Call: 07402 192492
          </a>
        </Container>
      </div>

      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo-horizontal.png"
            alt="Mobile Arcade"
            width={180}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          {nav.map((item) => (
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:07402192492"
            className="hidden rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand sm:inline-flex"
          >
            Call now
          </a>
          <Link
            href="/service-finder"
            className="hidden rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand sm:inline-flex"
          >
            Store finder
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
          >
            Book / Contact
          </Link>
        </div>
      </Container>
    </header>
  );
}
