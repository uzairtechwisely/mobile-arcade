import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { modelRepairActions, repairBrands, repairModelsByBrand } from "@/data/repair";

export function generateStaticParams() {
  return repairBrands.flatMap((b) => {
    const models = repairModelsByBrand[b.slug] ?? [];
    return models.map((m) => ({ brand: b.slug, model: m.slug }));
  });
}

export default function RepairModelPage({
  params,
}: {
  params: { brand: string; model: string };
}) {
  const brand = repairBrands.find((b) => b.slug === params.brand);
  if (!brand) notFound();
  const models = repairModelsByBrand[brand.slug] ?? [];
  const model = models.find((m) => m.slug === params.model);
  if (!model) notFound();

  return (
    <div>
      <section className="border-b border-border bg-white">
        <Container className="py-12">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold text-muted">Repair</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {model.title} repairs
            </h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
              Choose what needs fixing. We’ll show your nearest branch and options.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/repair/${brand.slug}`}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
              >
                Change model
              </Link>
              <Link
                href="/service-finder?service=repair&mode=in_shop"
                className="inline-flex items-center justify-center rounded-2xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
              >
                Find a repair store
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-background">
        <Container className="py-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Most common repairs
            </h2>
            <p className="mt-3 text-base leading-7 text-muted">
              Select a repair type to continue to the store finder.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modelRepairActions.map((a) => (
              <Link
                key={a.key}
                href={`/service-finder?service=${encodeURIComponent(
                  a.key,
                )}&mode=in_shop&device=${encodeURIComponent(model.title)}`}
                className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    className="h-12 w-12 rounded-2xl object-cover ring-1 ring-inset ring-border"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.title}</div>
                    <p className="mt-1 text-sm leading-6 text-muted">{a.description}</p>
                  </div>
                </div>
                <div className="mt-5 inline-flex rounded-2xl bg-[rgba(232,242,255,0.8)] px-3 py-2 text-xs font-semibold text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]">
                  Find stores
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

