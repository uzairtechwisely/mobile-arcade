"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BranchMap } from "@/components/maps/BranchMap";
import { Branch, BranchServiceKey, FulfillmentMode, Service } from "@/lib/types";
import { formatMiles, haversineDistanceMeters, metersToMiles } from "@/lib/geo";

const CATEGORY_KEYS: BranchServiceKey[] = [
  "repair",
  "trade",
  "customise",
  "refurbished",
  "accessories",
  "explore",
];

const REPAIR_SERVICE_KEYS: BranchServiceKey[] = [
  "repair",
  "screen_repair",
  "battery_replacement",
  "water_damage",
  "diagnostics",
  "data_recovery",
  "laptop_repair",
  "console_repair",
];

const QUICK_REPAIR: Array<{ key: BranchServiceKey; label: string }> = [
  { key: "screen_repair", label: "Screen repair" },
  { key: "battery_replacement", label: "Battery replacement" },
  { key: "water_damage", label: "Water damage" },
  { key: "laptop_repair", label: "Laptop repair" },
];

const QUICK_TRADES: Array<{ label: string; href: string }> = [
  { label: "Trade in an iPhone", href: "/trade" },
  { label: "Trade in a Samsung", href: "/trade" },
  { label: "Sell a broken phone", href: "/campaigns/sell-broken-phone" },
];

function allowedModesFor(serviceKey: BranchServiceKey): FulfillmentMode[] {
  const map: Record<BranchServiceKey, FulfillmentMode[]> = {
    repair: ["in_shop", "at_home", "post"],
    screen_repair: ["in_shop", "post"],
    battery_replacement: ["in_shop", "post"],
    water_damage: ["in_shop", "post"],
    diagnostics: ["in_shop", "post"],
    data_recovery: ["in_shop", "post"],
    laptop_repair: ["in_shop", "post"],
    console_repair: ["in_shop", "post"],
    trade: ["in_shop", "post"],
    customise: ["in_shop"],
    "3d_printed_case": ["in_shop"],
    buy_sell: ["in_shop", "post"],
    refurbished: ["in_shop"],
    accessories: ["in_shop"],
    explore: ["in_shop"],
    products: ["in_shop"],
    repair_van: ["at_home"],
  };
  return map[serviceKey] ?? ["in_shop"];
}

function categoryFor(serviceKey: BranchServiceKey): BranchServiceKey {
  if (REPAIR_SERVICE_KEYS.includes(serviceKey)) return "repair";
  if (CATEGORY_KEYS.includes(serviceKey)) return serviceKey;
  return "repair";
}

export function ServiceFinderClient({
  branches,
  services,
  defaultServiceKey,
  defaultMode,
  defaultPostcode,
  initialOrigin,
  initialDriving,
}: {
  branches: Branch[];
  services: Service[];
  defaultServiceKey?: string;
  defaultMode?: string;
  defaultPostcode?: string;
  initialOrigin?: { lat: number; lng: number } | null;
  initialDriving?: {
    metersByBranchId: Record<string, number>;
    secondsByBranchId: Record<string, number>;
  } | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const initialServiceKey = (services.find((s) => s.key === defaultServiceKey)?.key ??
    services[0]?.key) as BranchServiceKey;
  const initialCategoryKey = categoryFor(initialServiceKey);

  const [categoryKey, setCategoryKey] = useState<BranchServiceKey>(initialCategoryKey);
  const [serviceKey, setServiceKey] = useState<BranchServiceKey>(() => {
    if (initialCategoryKey === "repair") return initialServiceKey;
    return initialCategoryKey;
  });

  const effectiveServiceKey = useMemo(() => {
    if (categoryKey === "repair") return serviceKey;
    return categoryKey;
  }, [categoryKey, serviceKey]);

  const initialMode = useMemo(() => {
    const parsed: FulfillmentMode =
      defaultMode === "at_home" || defaultMode === "post" || defaultMode === "in_shop"
        ? defaultMode
        : "in_shop";
    const allowed = allowedModesFor(effectiveServiceKey);
    return allowed.includes(parsed) ? parsed : allowed[0] ?? "in_shop";
  }, [defaultMode, effectiveServiceKey]);

  const [mode, setMode] = useState<FulfillmentMode>(initialMode);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    initialOrigin ?? null,
  );
  const [postcode, setPostcode] = useState(() => defaultPostcode ?? "");
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "searching" | "ready" | "error"
  >(initialOrigin ? "ready" : "idle");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [driving, setDriving] = useState<{
    status: "idle" | "loading" | "ready";
    metersByBranchId: Record<string, number>;
    secondsByBranchId: Record<string, number>;
  }>(
    initialDriving
      ? {
          status: "ready",
          metersByBranchId: initialDriving.metersByBranchId,
          secondsByBranchId: initialDriving.secondsByBranchId,
        }
      : { status: "idle", metersByBranchId: {}, secondsByBranchId: {} },
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>(() => {
    const candidates = branches.filter((b) => b.services.includes(initialServiceKey));
    if (!candidates.length) return undefined;
    if (initialDriving) {
      const byMeters = [...candidates]
        .filter((b) => typeof initialDriving.metersByBranchId[b.id] === "number")
        .sort(
          (a, b) =>
            initialDriving.metersByBranchId[a.id] - initialDriving.metersByBranchId[b.id],
        )[0];
      if (byMeters) return byMeters.id;
    }
    return candidates[0]?.id;
  });

  const filteredBranches = useMemo(() => {
    return branches.filter((b) => b.services.includes(effectiveServiceKey));
  }, [branches, effectiveServiceKey]);

  const categories = useMemo(() => {
    const byKey = new Map(services.map((s) => [s.key, s] as const));
    return CATEGORY_KEYS.map((k) => byKey.get(k)).filter(Boolean) as Service[];
  }, [services]);

  const repairOptions = useMemo(() => {
    const byKey = new Map(services.map((s) => [s.key, s] as const));
    return REPAIR_SERVICE_KEYS.map((k) => byKey.get(k)).filter(Boolean) as Service[];
  }, [services]);

  const modeOptions = useMemo(() => {
    const labels: Record<FulfillmentMode, string> = {
      in_shop: "In shop",
      at_home: "At home",
      post: "Post",
    };
    return allowedModesFor(effectiveServiceKey).map((m) => ({
      key: m,
      label: labels[m],
    }));
  }, [effectiveServiceKey]);

  const syncUrl = useCallback(
    (next: { serviceKey: BranchServiceKey; mode: FulfillmentMode; postcode?: string }) => {
      const q = (next.postcode ?? postcode).trim();
      const sp = new URLSearchParams();
      sp.set("service", next.serviceKey);
      sp.set("mode", next.mode);
      if (q) sp.set("postcode", q);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, postcode, router],
  );

  const fetchDrivingDistances = useCallback(
    async (
      nextOrigin: { lat: number; lng: number },
      nextFiltered: Branch[],
    ): Promise<{
      metersByBranchId: Record<string, number>;
      secondsByBranchId: Record<string, number>;
    } | null> => {
      const ids = nextFiltered.map((b) => b.id);
      if (!ids.length) return null;

      const distRes = await fetch("/api/maps/distance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ origin: nextOrigin, branchIds: ids }),
      }).catch(() => null);

      if (!distRes || !distRes.ok) return null;

      const dist = (await distRes.json().catch(() => null)) as
        | {
            ok: true;
            results: Array<{ branchId: string; meters: number; seconds: number }>;
          }
        | null;
      const metersByBranchId: Record<string, number> = {};
      const secondsByBranchId: Record<string, number> = {};
      for (const r of dist?.results ?? []) {
        metersByBranchId[r.branchId] = r.meters;
        secondsByBranchId[r.branchId] = r.seconds;
      }

      return { metersByBranchId, secondsByBranchId };
    },
    [],
  );

  const findByPostcode = useCallback(async (query?: string) => {
    const q = (query ?? postcode).trim();
    if (!q) return;
    setLookupStatus("searching");
    setLookupError(null);
    setDriving({ status: "loading", metersByBranchId: {}, secondsByBranchId: {} });

    const geoRes = await fetch("/api/maps/geocode", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: q }),
    }).catch(() => null);

    if (!geoRes || !geoRes.ok) {
      setLookupStatus("error");
      setDriving({ status: "idle", metersByBranchId: {}, secondsByBranchId: {} });
      setLookupError("We couldn’t find that postcode. Please check and try again.");
      return;
    }

    const geo = (await geoRes.json().catch(() => null)) as
      | { ok: true; lat: number; lng: number }
      | null;
    if (!geo || geo.ok !== true || typeof geo.lat !== "number" || typeof geo.lng !== "number") {
      setLookupStatus("error");
      setDriving({ status: "idle", metersByBranchId: {}, secondsByBranchId: {} });
      setLookupError("We couldn’t find that postcode. Please check and try again.");
      return;
    }

    const nextOrigin = { lat: geo.lat, lng: geo.lng };
    setOrigin(nextOrigin);

    const computed = await fetchDrivingDistances(nextOrigin, filteredBranches);
    if (computed) {
      setDriving({ status: "ready", ...computed });
      const nearestByDriving = filteredBranches
        .filter((b) => typeof computed.metersByBranchId[b.id] === "number")
        .sort((a, b) => computed.metersByBranchId[a.id] - computed.metersByBranchId[b.id])[0];
      if (nearestByDriving) setSelectedBranchId(nearestByDriving.id);
    } else {
      setDriving({ status: "ready", metersByBranchId: {}, secondsByBranchId: {} });
      const nearestFallback = filteredBranches
        .map((b) => ({
          branch: b,
          distanceMeters: haversineDistanceMeters(nextOrigin, { lat: b.lat, lng: b.lng }),
        }))
        .sort((a, b) => a.distanceMeters - b.distanceMeters)[0]?.branch;
      if (nearestFallback) setSelectedBranchId(nearestFallback.id);
    }

    setLookupStatus("ready");
    syncUrl({ serviceKey: effectiveServiceKey, mode, postcode: q });
  }, [effectiveServiceKey, fetchDrivingDistances, filteredBranches, mode, postcode, syncUrl]);

  const onCategoryChange = useCallback(
    async (next: BranchServiceKey) => {
      setCategoryKey(next);

      const nextServiceKey: BranchServiceKey = next === "repair" ? "repair" : next;
      setServiceKey(nextServiceKey);

      const allowed = allowedModesFor(nextServiceKey);
      const nextMode = allowed.includes(mode) ? mode : allowed[0] ?? "in_shop";
      setMode(nextMode);
      syncUrl({ serviceKey: nextServiceKey, mode: nextMode });

      const first = branches.find((b) => b.services.includes(nextServiceKey))?.id;
      setSelectedBranchId(first);

      if (origin) {
        setDriving({ status: "loading", metersByBranchId: {}, secondsByBranchId: {} });
        const computed = await fetchDrivingDistances(
          origin,
          branches.filter((b) => b.services.includes(nextServiceKey)),
        );
        setDriving(
          computed
            ? { status: "ready", ...computed }
            : { status: "ready", metersByBranchId: {}, secondsByBranchId: {} },
        );
      } else {
        setDriving({ status: "idle", metersByBranchId: {}, secondsByBranchId: {} });
      }
    },
    [branches, fetchDrivingDistances, mode, origin, syncUrl],
  );

  const onRepairServiceChange = useCallback(
    async (next: BranchServiceKey) => {
      setCategoryKey("repair");
      setServiceKey(next);

      const allowed = allowedModesFor(next);
      const nextMode = allowed.includes(mode) ? mode : allowed[0] ?? "in_shop";
      setMode(nextMode);
      syncUrl({ serviceKey: next, mode: nextMode });

      const first = branches.find((b) => b.services.includes(next))?.id;
      setSelectedBranchId(first);

      if (origin) {
        setDriving({ status: "loading", metersByBranchId: {}, secondsByBranchId: {} });
        const computed = await fetchDrivingDistances(
          origin,
          branches.filter((b) => b.services.includes(next)),
        );
        setDriving(
          computed
            ? { status: "ready", ...computed }
            : { status: "ready", metersByBranchId: {}, secondsByBranchId: {} },
        );
      } else {
        setDriving({ status: "idle", metersByBranchId: {}, secondsByBranchId: {} });
      }
    },
    [branches, fetchDrivingDistances, mode, origin, syncUrl],
  );

  const onModeChange = useCallback(
    (nextMode: FulfillmentMode) => {
      setMode(nextMode);
      syncUrl({ serviceKey: effectiveServiceKey, mode: nextMode });
    },
    [effectiveServiceKey, syncUrl],
  );

  const orderedBranches = useMemo(() => {
    if (origin && Object.keys(driving.metersByBranchId).length > 0) {
      return [...filteredBranches].sort(
        (a, b) =>
          (driving.metersByBranchId[a.id] ?? Number.POSITIVE_INFINITY) -
          (driving.metersByBranchId[b.id] ?? Number.POSITIVE_INFINITY),
      );
    }
    if (origin) {
      return [...filteredBranches].sort((a, b) => {
        const da = haversineDistanceMeters(origin, { lat: a.lat, lng: a.lng });
        const db = haversineDistanceMeters(origin, { lat: b.lat, lng: b.lng });
        return da - db;
      });
    }
    return filteredBranches;
  }, [driving.metersByBranchId, filteredBranches, origin]);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId) ?? null,
    [branches, selectedBranchId],
  );

  const nearestBranch = origin
    ? orderedBranches[0] ?? null
    : null;

  const primaryAction = useMemo(() => {
    if (mode === "post") {
      return {
        href: "/campaigns/sell-broken-phone",
        label: "Postage options",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    if (mode === "at_home") {
      return {
        href: "/contact",
        label: "Request at-home visit",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    if (categoryKey === "trade") {
      return {
        href: "/trade",
        label: "Get a trade quote",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    if (categoryKey === "customise") {
      return {
        href: "/customise",
        label: "Request custom work",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    if (categoryKey === "refurbished") {
      return {
        href: "/refurbished",
        label: "Browse refurbished",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    if (categoryKey === "accessories") {
      return {
        href: "/accessories",
        label: "Browse accessories",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    if (categoryKey === "explore") {
      return {
        href: "/explore",
        label: "Explore items",
        style:
          "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
      };
    }

    return {
      href: "/contact",
      label: "Book / contact",
      style:
        "rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark",
    };
  }, [categoryKey, mode]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="text-sm font-semibold">Find your nearest</div>

        <div className="mt-4">
          <div className="text-xs font-semibold text-muted">Choose a category</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => onCategoryChange(c.key)}
                className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                  categoryKey === c.key
                    ? "border-brand bg-[rgba(232,242,255,0.8)] text-brand"
                    : "border-border bg-background text-foreground hover:bg-white"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {categoryKey === "repair" ? (
          <div className="mt-5">
            <div className="text-xs font-semibold text-muted">Most common repairs</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {QUICK_REPAIR.map((q) => (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => onRepairServiceChange(q.key)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    serviceKey === q.key
                      ? "border-brand bg-[rgba(232,242,255,0.8)] text-brand"
                      : "border-border bg-background text-foreground hover:bg-white"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-muted">
                More repair types
              </label>
              <select
                value={serviceKey}
                onChange={(e) => onRepairServiceChange(e.target.value as BranchServiceKey)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {repairOptions.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {categoryKey === "trade" ? (
          <div className="mt-5">
            <div className="text-xs font-semibold text-muted">Most common trades</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {QUICK_TRADES.map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-white"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label className="block text-xs font-semibold text-muted">Postcode</label>
            <input
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. NR1 3QD"
              className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-muted">How you want it</label>
            <div
              className="mt-1 grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.max(modeOptions.length, 1)}, minmax(0, 1fr))`,
              }}
            >
              {modeOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onModeChange(opt.key)}
                  className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                    mode === opt.key
                      ? "border-brand bg-[rgba(232,242,255,0.8)] text-brand"
                      : "border-border bg-background text-foreground hover:bg-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 lg:self-end">
            <button
              type="button"
              onClick={() => findByPostcode()}
              disabled={lookupStatus === "searching"}
              className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark disabled:opacity-60"
            >
              {lookupStatus === "searching" ? "Finding…" : "Find nearest"}
            </button>
          </div>
        </div>

        {lookupStatus === "error" ? (
          <div className="mt-3 text-sm font-semibold text-[color:var(--brand-2)]">
            {lookupError}
          </div>
        ) : null}

        {nearestBranch ? (
          <div className="mt-5 rounded-2xl border border-border bg-background p-4">
            <div className="text-xs font-semibold text-muted">Nearest branch</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{nearestBranch.name}</div>
              {typeof driving.metersByBranchId[nearestBranch.id] === "number" ? (
                <div className="text-xs font-semibold text-muted">
                  {formatMiles(metersToMiles(driving.metersByBranchId[nearestBranch.id]))}
                </div>
              ) : null}
            </div>
            <div className="mt-2 text-sm text-muted">
              {nearestBranch.address} {nearestBranch.postcode}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/locations/${nearestBranch.slug}`}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] transition hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
              >
                View branch
              </Link>
              <Link href={primaryAction.href} className={primaryAction.style}>
                {primaryAction.label}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-muted">
            Enter your postcode to sort branches by distance.
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="text-sm font-semibold">Branches</div>
            <div className="mt-4 space-y-3">
              {orderedBranches.map((b) => {
                const isSelected = b.id === selectedBranchId;
                const meters = driving.metersByBranchId[b.id];
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{b.name}</div>
                      <div
                        className={`text-xs font-semibold ${
                          isSelected ? "text-background/80" : "text-muted"
                        }`}
                      >
                        {typeof meters === "number"
                          ? formatMiles(metersToMiles(meters))
                          : b.openingHoursText}
                      </div>
                    </div>
                    <div
                      className={`mt-1 text-sm ${
                        isSelected ? "text-background/80" : "text-muted"
                      }`}
                    >
                      {b.address} {b.postcode}
                    </div>
                    <div
                      className={`mt-3 text-xs font-semibold ${
                        isSelected ? "text-background/80" : "text-foreground"
                      }`}
                    >
                      {b.openingHoursText}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-2xl px-3 py-2 text-xs font-semibold ${
                          isSelected
                            ? "bg-background/10 text-background"
                            : "bg-[rgba(232,242,255,0.8)] text-brand ring-1 ring-inset ring-[rgba(0,106,252,0.25)]"
                        }`}
                      >
                        Select
                      </span>
                      <Link
                        href={`/locations/${b.slug}`}
                        className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-background text-foreground"
                            : "bg-white text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] hover:bg-[rgba(232,242,255,0.8)] hover:text-brand"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                      </Link>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <BranchMap
            branches={filteredBranches}
            allBranches={branches}
            activeBranchIds={filteredBranches.map((b) => b.id)}
            selectedBranchId={selectedBranch?.id}
            onSelectBranchId={(id) => setSelectedBranchId(id)}
            origin={origin ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
