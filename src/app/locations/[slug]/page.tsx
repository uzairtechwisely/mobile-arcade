import Link from "next/link";
import { notFound } from "next/navigation";
import { BranchMap } from "@/components/maps/BranchMap";
import { Container } from "@/components/ui/Container";
import { getBranchBySlug } from "@/data/branches";
import { services } from "@/data/services";

export default function LocationDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const branch = getBranchBySlug(params.slug);
  if (!branch) notFound();

  const branchServices = services.filter((s) => branch.services.includes(s.key));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${branch.address} ${branch.postcode}`.trim(),
  )}`;

  return (
    <div className="bg-background">
      <Container className="py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-muted">Location</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {branch.name}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted">
              {branch.address} {branch.postcode}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-surface px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border transition hover:bg-background"
              >
                Open in Google Maps
              </a>
              <Link
                href="/service-finder"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-background transition hover:brightness-95"
              >
                Find nearest branch
              </Link>
            </div>
          </div>

          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6">
            <div className="text-sm font-semibold">Opening times</div>
            <div className="mt-2 text-sm leading-6 text-muted">
              {branch.openingHoursText}
            </div>
            {branch.walkInDiscountText ? (
              <div className="mt-4 rounded-2xl bg-background p-4 text-sm text-foreground ring-1 ring-inset ring-border">
                <div className="text-xs font-semibold text-muted">
                  Walk-in discount
                </div>
                <div className="mt-1 font-semibold">{branch.walkInDiscountText}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="text-sm font-semibold">Services available here</div>
              <div className="mt-4 grid gap-3">
                {branchServices.map((s) => (
                  <Link
                    key={s.key}
                    href={`/services/${s.slug}`}
                    className="rounded-2xl border border-border bg-background p-4 transition hover:shadow-sm"
                  >
                    <div className="text-sm font-semibold">{s.title}</div>
                    <div className="mt-1 text-sm text-muted">{s.summary}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-foreground p-6 text-background">
              <div className="text-xs font-semibold text-background/80">
                Local trust
              </div>
              <div className="mt-2 text-lg font-semibold leading-6">
                A local branch backed by a wider team.
              </div>
              <p className="mt-2 text-sm leading-6 text-background/80">
                Transparent advice, clear options, and the confidence of an
                established local business.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-full bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:brightness-95"
              >
                Book / Contact
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BranchMap branches={[branch]} selectedBranchId={branch.id} />
          </div>
        </div>
      </Container>
    </div>
  );
}
