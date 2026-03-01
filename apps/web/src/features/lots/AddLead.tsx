import { useMemo, useState } from "react";
import { createLead } from "./lotsApi";
import { dollarsToCents } from "./money";

const TAGS = ["mixed", "textbooks", "manga", "comics", "kids", "vintage"];

export function AddLead({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [asking, setAsking] = useState("");
  const [sellable, setSellable] = useState("");
  const [total, setTotal] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>(["mixed"]);

  const askingCents = useMemo(() => dollarsToCents(asking), [asking]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await createLead({
      title: title.trim() || undefined,
      source_url: url.trim() || undefined,
      asking_price_cents: askingCents ?? undefined,
      approx_sellable_books: sellable ? Number(sellable) : undefined,
      approx_total_books: total ? Number(total) : undefined,
      category_tags: tags,
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

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
      >
        Save lead
      </button>

      <div className="text-xs text-slate-500">
        This saves to Supabase (cloud). You must apply `supabase/schema.sql` first.
      </div>
    </form>
  );
}
