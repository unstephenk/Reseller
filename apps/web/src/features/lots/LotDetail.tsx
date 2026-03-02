import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Lot } from "./types";
import { getLot, updateLot, updateLotStatusWithEvent } from "./lotsApi";
import { addLotNote, listLotEvents, type LotEvent } from "./lotEventsApi";
import { centsToDollars, dollarsToCents } from "./money";
import { decide } from "./decide";
import { useSettings } from "../settings/useSettings";

export function LotDetail() {
  const { id } = useParams();
  const lotId = id ?? "";

  const { settings } = useSettings();

  const [lot, setLot] = useState<Lot | null>(null);
  const [events, setEvents] = useState<LotEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [note, setNote] = useState("");

  useEffect(() => {
    if (!lotId) return;
    setError(null);
    getLot(lotId)
      .then(setLot)
      .catch((e) => setError(e?.message ?? String(e)));

    listLotEvents(lotId)
      .then(setEvents)
      .catch(() => {
        // ignore
      });
  }, [lotId]);

  const decision = useMemo(() => {
    if (!lot) return null;
    return decide({
      buyPriceCents: lot.asking_price_cents,
      sellableBooks: lot.approx_sellable_books,
      estNetPerBookCents: lot.est_net_per_book_cents,
      profitFloorCents: settings?.profit_floor_cents ?? 1000,
      profitPercentOfBuy: settings?.profit_percent_of_buy ?? 0.25,
    });
  }, [lot, settings]);

  async function savePatch(patch: Partial<Lot>) {
    if (!lot) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateLot(lot.id, patch);
      setLot(updated);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(to: Lot["status"]) {
    if (!lot) return;
    const updated = await updateLotStatusWithEvent(lot.id, lot.status, to);
    setLot(updated);
    const evs = await listLotEvents(lot.id);
    setEvents(evs);
  }

  async function addNote() {
    if (!lot) return;
    const text = note.trim();
    if (!text) return;
    await addLotNote(lot.id, text);
    setNote("");
    setEvents(await listLotEvents(lot.id));
  }

  if (!lotId) return <div className="p-4">Missing lot id</div>;
  if (error) {
    return (
      <div className="mx-auto max-w-md p-4">
        <div className="rounded-2xl border bg-rose-50 p-4 text-sm text-rose-900 shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="mx-auto max-w-md p-4 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <div className="flex items-center justify-between">
        <Link className="text-sm underline" to="/">
          ← Back
        </Link>
        <div className="text-xs text-slate-500">{saving ? "Saving…" : ""}</div>
      </div>

      <div className="mt-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Lot</div>

        <label className="mt-3 block">
          <div className="text-xs font-medium text-slate-600">Title</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={lot.title ?? ""}
            onChange={(e) => setLot({ ...lot, title: e.target.value })}
            onBlur={() => savePatch({ title: lot.title })}
          />
        </label>

        <label className="mt-3 block">
          <div className="text-xs font-medium text-slate-600">FB URL</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={lot.source_url ?? ""}
            onChange={(e) => setLot({ ...lot, source_url: e.target.value })}
            onBlur={() => savePatch({ source_url: lot.source_url })}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Asking ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.asking_price_cents != null ? centsToDollars(lot.asking_price_cents) : ""}
              inputMode="decimal"
              onChange={(e) =>
                setLot({
                  ...lot,
                  asking_price_cents: dollarsToCents(e.target.value),
                })
              }
              onBlur={() => savePatch({ asking_price_cents: lot.asking_price_cents })}
            />
          </label>
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Sellable #</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.approx_sellable_books ?? ""}
              inputMode="numeric"
              onChange={(e) =>
                setLot({
                  ...lot,
                  approx_sellable_books: e.target.value ? Number(e.target.value) : null,
                })
              }
              onBlur={() => savePatch({ approx_sellable_books: lot.approx_sellable_books })}
            />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Net / book ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.est_net_per_book_cents != null ? centsToDollars(lot.est_net_per_book_cents) : ""}
              inputMode="decimal"
              onChange={(e) =>
                setLot({
                  ...lot,
                  est_net_per_book_cents: dollarsToCents(e.target.value),
                })
              }
              onBlur={() => savePatch({ est_net_per_book_cents: lot.est_net_per_book_cents })}
            />
          </label>
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Status</div>
            <select
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
              value={lot.status}
              onChange={(e) => changeStatus(e.target.value as Lot["status"])}
            >
              {[
                "lead",
                "bought",
                "sorted",
                "listed",
                "sold",
                "shipped",
                "done",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 rounded-xl border bg-slate-50 p-3">
          <div className="text-xs font-medium text-slate-600">Decision</div>
          {decision?.shouldBuy == null ? (
            <div className="mt-1 text-sm text-slate-600">Fill asking + sellable + net/book.</div>
          ) : (
            <div className="mt-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Est profit</span>
                <span className="font-medium">${centsToDollars(decision.estProfitCents)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Target</span>
                <span className="font-medium">${centsToDollars(decision.desiredProfitCents)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-600">Verdict</span>
                <span
                  className={
                    decision.shouldBuy
                      ? "rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                      : "rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white"
                  }
                >
                  {decision.shouldBuy ? "BUY" : "PASS"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Sold / Shipping (optional)</div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Sold price ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.sold_price_cents != null ? centsToDollars(lot.sold_price_cents) : ""}
              inputMode="decimal"
              onChange={(e) => setLot({ ...lot, sold_price_cents: dollarsToCents(e.target.value) })}
              onBlur={() => savePatch({ sold_price_cents: lot.sold_price_cents })}
            />
          </label>
          <label className="block">
            <div className="text-xs font-medium text-slate-600">eBay fees ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.ebay_fees_cents != null ? centsToDollars(lot.ebay_fees_cents) : ""}
              inputMode="decimal"
              onChange={(e) => setLot({ ...lot, ebay_fees_cents: dollarsToCents(e.target.value) })}
              onBlur={() => savePatch({ ebay_fees_cents: lot.ebay_fees_cents })}
            />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Ship charged ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.shipping_charged_cents != null ? centsToDollars(lot.shipping_charged_cents) : ""}
              inputMode="decimal"
              onChange={(e) => setLot({ ...lot, shipping_charged_cents: dollarsToCents(e.target.value) })}
              onBlur={() => savePatch({ shipping_charged_cents: lot.shipping_charged_cents })}
            />
          </label>
          <label className="block">
            <div className="text-xs font-medium text-slate-600">Ship paid ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={lot.shipping_paid_cents != null ? centsToDollars(lot.shipping_paid_cents) : ""}
              inputMode="decimal"
              onChange={(e) => setLot({ ...lot, shipping_paid_cents: dollarsToCents(e.target.value) })}
              onBlur={() => savePatch({ shipping_paid_cents: lot.shipping_paid_cents })}
            />
          </label>
        </div>

        <label className="mt-3 block">
          <div className="text-xs font-medium text-slate-600">Supplies ($)</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            value={lot.supplies_cents != null ? centsToDollars(lot.supplies_cents) : ""}
            inputMode="decimal"
            onChange={(e) => setLot({ ...lot, supplies_cents: dollarsToCents(e.target.value) })}
            onBlur={() => savePatch({ supplies_cents: lot.supplies_cents })}
          />
        </label>
      </div>

      <div className="mt-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Journey</div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note…"
          />
          <button
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            type="button"
            onClick={addNote}
          >
            Add
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">
                {new Date(ev.created_at).toLocaleString()}
              </div>
              <div className="mt-1 text-sm">
                {ev.kind === "status_change"
                  ? `Status: ${ev.from_status} → ${ev.to_status}`
                  : ev.note}
              </div>
            </div>
          ))}
          {events.length === 0 ? (
            <div className="text-sm text-slate-600">No events yet.</div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border bg-white p-4 text-sm text-slate-600 shadow-sm">
        Photos/receipts next: we’ll store them in Supabase Storage (bucket like
        <code className="mx-1">lot-media</code>).
      </div>
    </div>
  );
}
