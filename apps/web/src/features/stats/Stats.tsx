import { useEffect, useMemo, useState } from "react";
import { listLots } from "../lots/lotsApi";
import type { Lot } from "../lots/types";

function cents(n: number | null | undefined) {
  return n ?? 0;
}

export function Stats({ refreshToken }: { refreshToken: number }) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    listLots()
      .then((data) => {
        if (!alive) return;
        setLots(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message ?? String(e));
      });

    return () => {
      alive = false;
    };
  }, [refreshToken]);

  const summary = useMemo(() => {
    const leadCount = lots.filter((l) => l.status === "lead").length;
    const boughtCount = lots.filter((l) => l.status === "bought").length;

    // Rough estimate using asking price + est net per book if present
    let estProfitCents = 0;
    for (const l of lots) {
      if (
        l.asking_price_cents != null &&
        l.approx_sellable_books != null &&
        l.est_net_per_book_cents != null
      ) {
        estProfitCents +=
          l.approx_sellable_books * l.est_net_per_book_cents - l.asking_price_cents;
      }
    }

    return { leadCount, boughtCount, estProfitCents };
  }, [lots]);

  if (error) {
    return (
      <div className="rounded-2xl border bg-rose-50 p-4 text-sm text-rose-900 shadow-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">Stats (rough)</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <div className="text-xs text-slate-500">Leads</div>
          <div className="text-lg font-semibold">{summary.leadCount}</div>
        </div>
        <div className="rounded-xl border p-3">
          <div className="text-xs text-slate-500">Bought</div>
          <div className="text-lg font-semibold">{summary.boughtCount}</div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border bg-slate-50 p-3">
        <div className="text-xs text-slate-500">Est profit (from filled fields)</div>
        <div className="text-lg font-semibold">${(cents(summary.estProfitCents) / 100).toFixed(0)}</div>
        <div className="mt-1 text-xs text-slate-500">
          Uses asking + sellable # + est net/book.
        </div>
      </div>
    </div>
  );
}
