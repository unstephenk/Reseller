import { useMemo, useState } from "react";
import {
  buildEbaySoldSearchUrl,
  buildFacebookMarketplaceSearchUrl,
} from "./urlBuilders";

const PRESETS = [
  "book lot",
  "textbook lot",
  "college textbooks",
  "manga lot",
  "comic lot",
  "children's books lot",
  "book collection",
];

export function Sourcing() {
  const [query, setQuery] = useState("book lot");

  const fbUrl = useMemo(() => buildFacebookMarketplaceSearchUrl(query), [query]);
  const ebayUrl = useMemo(() => buildEbaySoldSearchUrl(query), [query]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col p-4">
      <header className="pt-3">
        <div className="text-sm text-slate-500">ZIP default</div>
        <div className="text-lg font-semibold">75071 • Books</div>
      </header>

      <main className="mt-4 space-y-4">
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-medium">Search</div>
          <input
            className="mt-2 w-full rounded-xl border px-3 py-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. manga lot"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                className="rounded-full border px-3 py-1 text-sm"
                onClick={() => setQuery(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white"
              href={fbUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open FB
            </a>
            <a
              className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium text-slate-900 ring-1 ring-slate-200"
              href={ebayUrl}
              target="_blank"
              rel="noreferrer"
            >
              eBay sold comps
            </a>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Note: we open Marketplace safely (no scraping). Your FB account handles
            location.
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm font-medium">Next: Lead capture</div>
          <p className="mt-1 text-sm text-slate-600">
            After you find a listing, you’ll paste the URL + asking price and we’ll
            track it through the pipeline.
          </p>
        </section>
      </main>

      <footer className="mt-auto pb-6 pt-4 text-center text-xs text-slate-400">
        v0.0.1
      </footer>
    </div>
  );
}
