import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Lot, LotStatus } from "./types";
import { listLots, updateLotStatusWithEvent } from "./lotsApi";
import { centsToDollars } from "./money";

const STATUSES: { key: LotStatus; label: string }[] = [
  { key: "lead", label: "Lead" },
  { key: "bought", label: "Bought" },
  { key: "sorted", label: "Sorted" },
  { key: "listed", label: "Listed" },
  { key: "sold", label: "Sold" },
  { key: "shipped", label: "Shipped" },
  { key: "done", label: "Done" },
];

export function Pipeline({ refreshToken }: { refreshToken: number }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    listLots()
      .then((data) => {
        if (!alive) return;
        setLots(data);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message ?? String(e));
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [refreshToken]);

  const byStatus = useMemo(() => {
    const map = new Map<LotStatus, Lot[]>();
    for (const s of STATUSES) map.set(s.key, []);
    for (const l of lots) {
      const arr = map.get(l.status) ?? [];
      arr.push(l);
      map.set(l.status, arr);
    }
    return map;
  }, [lots]);

  async function move(lotId: string, from: LotStatus, to: LotStatus) {
    const updated = await updateLotStatusWithEvent(lotId, from, to);
    setLots((prev) => prev.map((l) => (l.id === lotId ? updated : l)));
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600 shadow-sm">
        Loading pipeline…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border bg-rose-50 p-4 text-sm text-rose-900 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {STATUSES.map((s) => {
        const items = byStatus.get(s.key) ?? [];
        if (items.length === 0) return null;

        return (
          <section key={s.key} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{s.label}</h2>
              <div className="text-xs text-slate-500">{items.length}</div>
            </div>

            <div className="mt-3 space-y-2">
              {items.map((l) => (
                <div key={l.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium">
                      {l.title || "(untitled lot)"}
                    </div>
                    <Link
                      className="shrink-0 text-xs underline"
                      to={`/lots/${l.id}`}
                    >
                      Open
                    </Link>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Asking: {l.asking_price_cents != null ? `$${centsToDollars(l.asking_price_cents)}` : "—"}
                    {l.approx_sellable_books ? ` • Sellable: ${l.approx_sellable_books}` : ""}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">Status</div>
                    <select
                      className="w-40 rounded-xl border bg-white px-3 py-2 text-xs"
                      value={l.status}
                      onChange={(e) => move(l.id, l.status, e.target.value as LotStatus)}
                    >
                      {STATUSES.map((x) => (
                        <option key={x.key} value={x.key}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {l.source_url ? (
                    <a
                      className="mt-2 block truncate text-xs text-slate-500 underline"
                      href={l.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {l.source_url}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {lots.length === 0 ? (
        <div className="rounded-2xl border bg-white p-4 text-sm text-slate-600 shadow-sm">
          No leads yet. Add one.
        </div>
      ) : null}
    </div>
  );
}
