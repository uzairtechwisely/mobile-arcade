import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ECOMMERCE_URL } from "@/lib/public-config";

const footerLinks = [
  { href: "/service-finder", label: "Find your nearest branch", external: false },
  { href: "/repair", label: "Repairs", external: false },
  { href: "/trade", label: "Trade-in & sell", external: false },
  { href: ECOMMERCE_URL, label: "Shop online", external: true },
  {
    href: "/campaigns/sell-broken-phone",
    label: "Nationwide collection",
    external: false,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <Image
              src="/brand/logo-horizontal.png"
              alt="Mobile Arcade"
              width={180}
              height={40}
              className="h-8 w-auto"
            />
            <p className="max-w-sm text-sm leading-6 text-muted">
              Local repair with community trust. Clear options whether you’re
              near one of our branches or need a nationwide collection.
            </p>
          </div>

          <div className="grid gap-2 text-sm md:justify-self-center">
            {footerLinks.map((l) => (
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              )
            ))}
          </div>

          <div className="space-y-3 md:justify-self-end">
            <div className="text-sm font-semibold">Quick contact</div>
            <div className="space-y-2 text-sm text-muted">
              <div>
                <span className="text-foreground">Response times:</span> same
                day for most requests
              </div>
              <a
                href="tel:07402192492"
                className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
              >
                Call 07402 192492
              </a>
              <Link
                href="/contact"
                className="inline-flex rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
              >
                Book / Message us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Mobile Arcade. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
