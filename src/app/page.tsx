import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { HeroFinder } from "@/components/home/HeroFinder";
import { branches } from "@/data/branches";
import { services } from "@/data/services";
import { commonPurchases, commonRepairs, commonTrades } from "@/data/home";
import { imageUrl } from "@/lib/image";
import { ECOMMERCE_URL } from "@/lib/public-config";
import { getRecentLeads } from "@/lib/server/leads";
import { getRecentOrders } from "@/lib/server/orders";

function timeAgo(iso: string) {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  const diff = Math.max(Date.now() - ts, 0);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function Home() {
  const [recentLeads, recentOrders] = await Promise.all([
    getRecentLeads(6),
    getRecentOrders(6),
  ]);

  const sampleOrders = [
    {
      id: "sample-order-1",
      title: "Refurbished iPhone 13 128GB",
      area: "Norwich",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      imageUrl: imageUrl(
        "Ultra realistic studio product photo of a refurbished smartphone on a clean white background, softbox lighting, high detail, sharp focus, minimal shadows, premium retail style",
        "square",
      ),
    },
    {
      id: "sample-order-2",
      title: "Fast charger + USB-C cable bundle",
      area: "Dereham",
      createdAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
      imageUrl: imageUrl(
        "Ultra realistic studio product photo of a fast phone charger and USB-C cable neatly coiled on a white background, soft lighting, high detail, premium retail style",
        "square",
      ),
    },
    {
      id: "sample-order-3",
      title: "MagSafe-style phone case",
      area: "Boston",
      createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
      imageUrl: imageUrl(
        "Ultra realistic studio product photo of a modern phone case with a subtle magnetic ring detail, on a white background, soft studio lighting, high detail, premium retail style",
        "square",
      ),
    },
  ] as const;

  const sampleEnquiries = [
    {
      id: "sample-lead-1",
      title: "Repair booking",
      location: "NR1",
      createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
      imageUrl: imageUrl(
        "Ultra realistic studio product photo of a smartphone with a cracked glass screen, on a neutral background, soft lighting, high detail, premium retail style",
        "square",
      ),
    },
    {
      id: "sample-lead-2",
      title: "Trade enquiry",
      location: "PE21",
      createdAt: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
      imageUrl: imageUrl(
        "Ultra realistic studio product photo of a smartphone next to a small stack of cash and a simple receipt, on a white background, soft lighting, high detail, premium retail style",
        "square",
      ),
    },
    {
      id: "sample-lead-3",
      title: "Postage enquiry",
      location: "IP22",
      createdAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
      imageUrl: imageUrl(
        "Ultra realistic studio product photo of a small parcel box and a shipping label on a white background, soft lighting, high detail, premium retail style",
        "square",
      ),
    },
  ] as const;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(0,106,252,0.14),transparent_52%),radial-gradient(circle_at_85%_0%,rgba(0,106,252,0.10),transparent_55%)]" />
        <Container className="relative py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-5 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)]">
                <span className="h-2 w-2 rounded-full bg-brand" />
                Serving Norwich since 2010 • 10,000+ devices repaired • 6-month warranty
              </div>

              <h1 className="text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl">
                Local repairs and local values.
                <span className="block">Fast help, friendly team, fair prices.</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Repair, trade, customise, or shop. Choose what you need and we’ll point
                you to the best local option.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/repair"
                  className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
                >
                  Start a repair
                </Link>
                <Link
                  href="/trade"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                >
                  Trade-in / Sell
                </Link>
                <a
                  href={ECOMMERCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                >
                  Shop online
                </a>
              </div>

              <div className="grid gap-3 pt-1 sm:grid-cols-4">
                <div className="rounded-2xl border border-border bg-white p-4 shadow-[0_10px_22px_rgba(0,0,0,0.06)]">
                  <div className="text-xs font-semibold text-muted">Speed</div>
                  <div className="mt-1 text-sm font-semibold">Often same day</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 shadow-[0_10px_22px_rgba(0,0,0,0.06)]">
                  <div className="text-xs font-semibold text-muted">Trust</div>
                  <div className="mt-1 text-sm font-semibold">6-month warranty</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 shadow-[0_10px_22px_rgba(0,0,0,0.06)]">
                  <div className="text-xs font-semibold text-muted">Value</div>
                  <div className="mt-1 text-sm font-semibold">Fair trade offers</div>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 shadow-[0_10px_22px_rgba(0,0,0,0.06)]">
                  <div className="text-xs font-semibold text-muted">Local</div>
                  <div className="mt-1 text-sm font-semibold">5 high-street stores</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/brand/hero-repair.webp"
                    alt="Technician performing phone repair"
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <div className="text-xs font-semibold text-white/80">
                      Fast. Reliable. Near you.
                    </div>
                    <div className="mt-2 text-lg font-semibold leading-6">
                      Walk in or book — we’ll guide you to the right option.
                    </div>
                  </div>
                </div>
              </div>

              <HeroFinder services={services} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-background">
        <Container className="py-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-muted">Repair</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Most common repairs
                </h2>
                <p className="mt-3 text-base leading-7 text-muted">
                  Pick a repair to see your nearest branch and the best way to get it
                  sorted.
                </p>
              </div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {commonRepairs.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
                  >
                    <div className="text-sm font-semibold">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {item.description}
                    </p>
                    <div className="mt-4 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                      Check stores
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)]">
                <div className="text-xs font-semibold text-muted">Trade</div>
                <div className="mt-2 text-lg font-semibold leading-6">
                  Most common trades
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  If a repair doesn’t make sense, we can make a fair offer and keep
                  things simple.
                </p>
                <div className="mt-5 grid gap-2">
                  {commonTrades.map((t) => (
                    <Link
                      key={t.title}
                      href={t.href}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
                    >
                      {t.title}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/trade"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
                >
                  Get a trade quote
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-white">
        <Container className="py-12">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="max-w-2xl">
                <div className="text-xs font-semibold text-muted">Shop</div>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Most common purchases
                </h2>
                <p className="mt-3 text-base leading-7 text-muted">
                  Browse popular categories on our online shop (opens in a new tab).
                </p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {commonPurchases.map((p) => (
                  <a
                    key={p.title}
                    href={ECOMMERCE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl border border-border bg-background p-6 transition hover:bg-white"
                  >
                    <div className="text-sm font-semibold">{p.title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {p.description}
                    </p>
                    <div className="mt-4 inline-flex rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand">
                      View
                    </div>
                  </a>
                ))}
              </div>

              <a
                href={ECOMMERCE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
              >
                Open online shop
              </a>
            </div>

            <div className="lg:col-span-5">
              <div className="space-y-4">
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="text-xs font-semibold text-muted">Recent orders</div>
                  <div className="mt-2 text-lg font-semibold leading-6">
                    Latest shop activity
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    This section is anonymised. Checkout lives on our online shop.
                  </p>

                  <div className="mt-5 grid gap-3">
                    {recentOrders.length === 0 ? (
                      sampleOrders.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={o.imageUrl}
                              alt={o.title}
                              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-border"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {o.title}
                              </div>
                              <div className="mt-1 text-xs font-semibold text-muted">
                                {o.area}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs font-semibold text-muted">
                              {timeAgo(o.createdAt)}
                            </div>
                            <div className="mt-1 inline-flex rounded-full bg-[rgba(232,242,255,0.8)] px-2 py-1 text-[11px] font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                              Sample
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      recentOrders.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4"
                        >
                          <div>
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  o.imageUrl ??
                                  imageUrl(
                                    "Ultra realistic studio product photo of a clean modern tech product on a white background, soft studio lighting, high detail, premium retail style",
                                    "square",
                                  )
                                }
                                alt={o.title}
                                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-border"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {o.title}
                                </div>
                                <div className="mt-1 text-xs font-semibold text-muted">
                                  {o.area ?? "Local"}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-muted">
                            {timeAgo(o.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <a
                    href={ECOMMERCE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                  >
                    View online shop
                  </a>
                </div>

                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="text-xs font-semibold text-muted">Recent enquiries</div>
                  <div className="mt-2 text-lg font-semibold leading-6">
                    What people have asked for lately
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    We only show anonymised entries. Names and contact details are never
                    displayed.
                  </p>

                  <div className="mt-5 grid gap-3">
                    {recentLeads.length === 0 ? (
                      sampleEnquiries.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={e.imageUrl}
                              alt={e.title}
                              className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-border"
                              loading="lazy"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">
                                {e.title}
                              </div>
                              <div className="mt-1 text-xs font-semibold text-muted">
                                {e.location}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs font-semibold text-muted">
                              {timeAgo(e.createdAt)}
                            </div>
                            <div className="mt-1 inline-flex rounded-full bg-[rgba(232,242,255,0.8)] px-2 py-1 text-[11px] font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                              Sample
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      recentLeads.map((lead) => {
                        const kindLabel: Record<string, string> = {
                          booking: "Repair booking",
                          sell_quote: "Trade enquiry",
                          campaign: "Campaign enquiry",
                          at_home: "At-home enquiry",
                          postage: "Postage enquiry",
                        };
                        const branch = lead.preferredBranchId
                          ? branches.find((b) => b.id === lead.preferredBranchId)?.name
                          : null;
                        const area = lead.postcode ? lead.postcode.split(" ")[0] : null;
                        const location = branch ?? area ?? "Local";
                        return (
                          <div
                            key={lead.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={imageUrl(
                                  "Ultra realistic studio product photo of a smartphone on a white background, soft lighting, high detail, premium retail style",
                                  "square",
                                )}
                                alt={kindLabel[lead.kind] ?? "Enquiry"}
                                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-inset ring-border"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {kindLabel[lead.kind] ?? "Enquiry"}
                                </div>
                                <div className="mt-1 text-xs font-semibold text-muted">
                                  {location}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-muted">
                              {timeAgo(lead.createdAt)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <Link
                    href="/contact"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                  >
                    Book / message us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-white">
        <Container className="py-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-muted">Stores</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Find a Mobile Arcade near you
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Opening times, directions, and what each branch offers.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <Link
                key={b.id}
                href={`/locations/${b.slug}`}
                className="rounded-3xl border border-border bg-background p-6 transition hover:bg-white"
              >
                <div className="text-sm font-semibold">{b.name}</div>
                <div className="mt-2 text-sm leading-6 text-muted">
                  {b.address} {b.postcode}
                </div>
                <div className="mt-4 text-xs font-semibold text-foreground">
                  {b.openingHoursText}
                </div>
                <div className="mt-5 inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand">
                  View branch
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
