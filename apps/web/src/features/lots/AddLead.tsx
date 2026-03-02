import { useMemo, useState } from "react";
import { createLead } from "./lotsApi";
import { dollarsToCents, centsToDollars } from "./money";
import { decide } from "./decide";
import { useSettings } from "../settings/useSettings";

const TAGS = ["mixed", "textbooks", "manga", "comics", "kids", "vintage"];

const DEFAULT_PRESETS: { label: string; v: string }[] = [
  { label: "kids $3", v: "3" },
  { label: "mixed $4", v: "4" },
  { label: "manga $6", v: "6" },
  { label: "textbooks $8", v: "8" },
];

export function AddLead({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const { settings, loading: settingsLoading, error: settingsError } = useSettings();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [asking, setAsking] = useState("");
  const [sellable, setSellable] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>(["mixed"]);
  const [netPerBook, setNetPerBook] = useState("4");

  const askingCents = useMemo(() => dollarsToCents(asking), [asking]);
  const netPerBookCents = useMemo(() => dollarsToCents(netPerBook), [netPerBook]);
  const sellableN = useMemo(
    () => (sellable.trim() ? Number(sellable) : null),
    [sellable],
  );

  const decision = useMemo(() => {
    if (!settings) {
      return decide({
        buyPriceCents: askingCents,
        sellableBooks: sellableN,
        estNetPerBookCents: netPerBookCents,
        profitFloorCents: 1000,
        profitPercentOfBuy: 0.25,
      });
    }

    return decide({
      buyPriceCents: askingCents,
      sellableBooks: sellableN,
      estNetPerBookCents: netPerBookCents,
      profitFloorCents: settings.profit_floor_cents,
      profitPercentOfBuy: settings.profit_percent_of_buy,
    });
  }, [askingCents, sellableN, netPerBookCents, settings]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await createLead({
      title: title.trim() || undefined,
      source_url: url.trim() || undefined,
      asking_price_cents: askingCents ?? undefined,
      approx_sellable_books: sellable ? Number(sellable) : undefined,
      approx_total_books: total ? Number(total) : undefined,
      category_tags: tags,
      est_net_per_book_cents: netPerBookCents ?? undefined,
      zip: settings?.zip ?? "75071",
      radius_miles: settings?.radius_miles ?? undefined,
      notes: notes.trim() || undefined,
    });

    setTitle("");
    setUrl("");
    setAsking("");
    setSellable("");
    setTotal("");
    setNotes("");
    setTags(["mixed"]);

    onCreated();
  }

  function toggleTag(t: string) {
    setTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  if (settingsLoading) {
    return (
      <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        Loading settings…
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
        {settingsError}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3">
        <label className="block">
          <div className="text-sm font-medium">Title</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Manga + textbooks"'
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium">FB URL</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://facebook.com/marketplace/item/..."
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-medium">Asking ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={asking}
              onChange={(e) => setAsking(e.target.value)}
              inputMode="decimal"
              placeholder="40"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Sellable #</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={sellable}
              onChange={(e) => setSellable(e.target.value)}
              inputMode="numeric"
              placeholder="50"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-medium">Est net / book ($)</div>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={netPerBook}
              onChange={(e) => setNetPerBook(e.target.value)}
              inputMode="decimal"
              placeholder="4"
            />
            <div className="mt-1 text-xs text-slate-500">
              Conservative, after shipping.
            </div>
          </label>
          <div className="rounded-xl border bg-slate-50 p-3">
            <div className="text-xs font-medium text-slate-600">Quick presets</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(settings?.net_per_book_presets
                ? [
                    { label: `kids $${(settings.net_per_book_presets.kids ?? 300) / 100}`, v: String((settings.net_per_book_presets.kids ?? 300) / 100) },
                    { label: `mixed $${(settings.net_per_book_presets.mixed ?? 400) / 100}`, v: String((settings.net_per_book_presets.mixed ?? 400) / 100) },
                    { label: `manga $${(settings.net_per_book_presets.manga ?? 600) / 100}`, v: String((settings.net_per_book_presets.manga ?? 600) / 100) },
                    { label: `textbooks $${(settings.net_per_book_presets.textbooks ?? 800) / 100}`, v: String((settings.net_per_book_presets.textbooks ?? 800) / 100) },
                  ]
                : DEFAULT_PRESETS
              ).map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="rounded-full border bg-white px-3 py-1 text-xs"
                  onClick={() => setNetPerBook(p.v)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <div className="text-sm font-medium">Total # (optional)</div>
          <input
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            inputMode="numeric"
            placeholder="75"
          />
        </label>

        <div>
          <div className="text-sm font-medium">Tags</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  className={
                    on
                      ? "rounded-full bg-slate-900 px-3 py-1 text-sm text-white"
                      : "rounded-full border px-3 py-1 text-sm"
                  }
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <div className="text-sm font-medium">Notes</div>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="red flags: mold, smoke, ex-library, etc"
            rows={3}
          />
        </label>
      </div>

      <div className="rounded-2xl border bg-slate-50 p-3">
        <div className="text-xs font-medium text-slate-600">Decision helper</div>
        {decision.shouldBuy == null ? (
          <div className="mt-1 text-sm text-slate-600">
            Enter asking price + sellable # to get a buy/pass.
          </div>
        ) : (
          <div className="mt-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Est net</span>
              <span className="font-medium">${centsToDollars(decision.estNetCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Est profit</span>
              <span className="font-medium">${centsToDollars(decision.estProfitCents)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Target profit</span>
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
                {decision.shouldBuy ? "BUY" : "PASS"} (target ${(decision.desiredProfitFloorCents / 100).toFixed(0)} or {(decision.desiredProfitPercentOfBuy * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
      >
        Save lead
      </button>

      <div className="text-xs text-slate-500">
        Saves to Supabase (cloud).
      </div>
    </form>
  );
}
