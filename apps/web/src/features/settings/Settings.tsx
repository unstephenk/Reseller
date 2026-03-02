import { useEffect, useMemo, useState } from "react";
import { getOrCreateSettings, updateSettings, type UserSettings } from "./settingsApi";

function pctToUi(n: number) {
  return String(Math.round(n * 100));
}
function uiToPct(s: string) {
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n / 100;
}

export function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [zip, setZip] = useState("75071");
  const [radius, setRadius] = useState("25");
  const [profitFloor, setProfitFloor] = useState("10");
  const [profitPct, setProfitPct] = useState("25");

  useEffect(() => {
    getOrCreateSettings()
      .then((s) => {
        setSettings(s);
        setZip(s.zip);
        setRadius(s.radius_miles?.toString() ?? "");
        setProfitFloor((s.profit_floor_cents / 100).toString());
        setProfitPct(pctToUi(s.profit_percent_of_buy));
      })
      .catch((e) => setError(e?.message ?? String(e)));
  }, []);

  const canSave = useMemo(() => !!settings && !saving, [settings, saving]);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);

    const pct = uiToPct(profitPct);
    if (pct == null) {
      setError("Profit % must be a number");
      setSaving(false);
      return;
    }

    try {
      const updated = await updateSettings({
        zip,
        radius_miles: radius.trim() ? Number(radius) : null,
        profit_floor_cents: Math.round(Number(profitFloor) * 100),
        profit_percent_of_buy: pct,
      });
      setSettings(updated);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold">Settings</div>
      <div className="mt-1 text-xs text-slate-500">
        Stored in Supabase per-user.
      </div>

      {error ? (
        <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        <label className="block">
          <div className="text-sm font-medium">ZIP</div>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" value={zip} onChange={(e) => setZip(e.target.value)} />
        </label>

        <label className="block">
          <div className="text-sm font-medium">Radius (miles)</div>
          <input className="mt-1 w-full rounded-xl border px-3 py-2" inputMode="numeric" value={radius} onChange={(e) => setRadius(e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-medium">Profit floor ($)</div>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" inputMode="decimal" value={profitFloor} onChange={(e) => setProfitFloor(e.target.value)} />
          </label>
          <label className="block">
            <div className="text-sm font-medium">Profit % of buy</div>
            <input className="mt-1 w-full rounded-xl border px-3 py-2" inputMode="numeric" value={profitPct} onChange={(e) => setProfitPct(e.target.value)} />
            <div className="mt-1 text-xs text-slate-500">Example: 25 means 25%</div>
          </label>
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        disabled={!canSave}
        onClick={save}
        type="button"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
