"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BranchMap } from "@/components/maps/BranchMap";
import { Branch } from "@/lib/types";

export function LocationsClient({ branches }: { branches: Branch[] }) {
  const [selectedId, setSelectedId] = useState<string | undefined>(branches[0]?.id);
  const selected = useMemo(
    () => branches.find((b) => b.id === selectedId) ?? null,
    [branches, selectedId],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-5">
        {branches.map((b) => {
          const isSelected = b.id === selectedId;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedId(b.id)}
              className={`w-full rounded-3xl border p-5 text-left transition ${
                isSelected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">{b.name}</div>
                  <div
                    className={`mt-1 text-sm leading-6 ${
                      isSelected ? "text-background/80" : "text-muted"
                    }`}
                  >
                    {b.address} {b.postcode}
                  </div>
                  <div
                    className={`mt-2 text-xs font-semibold ${
                      isSelected ? "text-background/80" : "text-foreground"
                    }`}
                  >
                    {b.openingHoursText}
                  </div>
                </div>
                <Link
                  href={`/locations/${b.slug}`}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-inset transition ${
                    isSelected
                      ? "bg-background text-foreground ring-background/20 hover:brightness-95"
                      : "bg-background text-foreground ring-border hover:bg-surface"
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

      <div className="lg:col-span-7">
        <BranchMap
          branches={branches}
          selectedBranchId={selected?.id}
          onSelectBranchId={(id) => setSelectedId(id)}
          origin={undefined}
        />
      </div>
    </div>
  );
}
