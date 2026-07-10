"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BranchServiceKey, FulfillmentMode, Service } from "@/lib/types";

export function HeroFinder({ services }: { services: Service[] }) {
  const router = useRouter();
  const [serviceKey, setServiceKey] = useState<BranchServiceKey>(() => {
    return (services[0]?.key ?? "repair") as BranchServiceKey;
  });
  const [postcode, setPostcode] = useState("");
  const [mode, setMode] = useState<FulfillmentMode>("in_shop");

  const categories = useMemo(() => {
    const desired: BranchServiceKey[] = [
      "repair",
      "trade",
      "customise",
      "refurbished",
      "accessories",
      "explore",
    ];
    const byKey = new Map(services.map((s) => [s.key, s]));
    return desired.map((key) => byKey.get(key)).filter(Boolean) as Service[];
  }, [services]);

  const allowedModes = useMemo(() => {
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
  }, [serviceKey]);

  const modeOptions = useMemo(() => {
    const labels: Record<FulfillmentMode, string> = {
      in_shop: "In shop",
      at_home: "At home",
      post: "Post",
    };
    return allowedModes.map((m) => ({ key: m, label: labels[m] }));
  }, [allowedModes]);

  const ensureAllowedMode = (nextService: BranchServiceKey) => {
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
    const allowed = map[nextService] ?? ["in_shop"];
    if (!allowed.includes(mode)) setMode(allowed[0] ?? "in_shop");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = postcode.trim();
    router.push(
      `/service-finder?service=${encodeURIComponent(serviceKey)}&mode=${encodeURIComponent(
        mode,
      )}${q ? `&postcode=${encodeURIComponent(q)}` : ""}`,
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border bg-white p-5 shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
    >
      <div className="text-sm font-semibold">Find your nearest</div>
      <div className="mt-4">
        <div className="text-xs font-semibold text-muted">Choose a category</div>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setServiceKey(c.key);
                ensureAllowedMode(c.key);
              }}
              className={`rounded-2xl border px-3 py-3 text-xs font-semibold transition ${
                serviceKey === c.key
                  ? "border-brand bg-[rgba(232,242,255,0.8)] text-brand"
                  : "border-border bg-background text-foreground hover:bg-white"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <label className="block text-xs font-semibold text-muted">Postcode</label>
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="e.g. NR1 3QD"
            className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="lg:col-span-5">
          <label className="block text-xs font-semibold text-muted">
            How you want it
          </label>
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
                onClick={() => setMode(opt.key)}
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
      </div>

      <button
        type="submit"
        className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] transition hover:bg-brand-dark"
      >
        Find nearest shops
      </button>
      <div className="mt-3 text-xs font-semibold text-muted">
        No payment required to book. We’ll confirm availability after you submit.
      </div>
    </form>
  );
}
