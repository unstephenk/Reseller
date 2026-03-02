import { useEffect, useState } from "react";
import { getOrCreateSettings, type UserSettings } from "./settingsApi";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getOrCreateSettings()
      .then((s) => {
        if (!alive) return;
        setSettings(s);
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
  }, []);

  return { settings, loading, error, setSettings };
}
