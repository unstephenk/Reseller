import { useState } from "react";
import { Login } from "./auth/Login";
import { useSession } from "./auth/useSession";
import { supabase } from "./lib/supabase";
import { Sourcing } from "./features/sourcing/Sourcing";
import { TabBar, type TabKey } from "./components/TabBar";
import { AddLead } from "./features/lots/AddLead";
import { Pipeline } from "./features/lots/Pipeline";
import { Stats } from "./features/stats/Stats";

export default function App() {
  const { session, loading } = useSession();
  const [tab, setTab] = useState<TabKey>("source");
  const [refreshToken, setRefreshToken] = useState(0);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Reseller</div>
            <div className="text-sm font-semibold">Books lane • 75071</div>
          </div>
          <button
            className="text-xs font-medium text-slate-700 underline"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-3">
        <TabBar tab={tab} setTab={setTab} />
      </div>

      <div className="mx-auto max-w-md px-4 pb-10">
        {tab === "source" ? (
          <Sourcing onAddLead={() => setTab("add")} />
        ) : null}

        {tab === "add" ? (
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">Add lead</div>
            <div className="mt-3">
              <AddLead
                onCreated={() => {
                  setRefreshToken((n) => n + 1);
                  setTab("pipeline");
                }}
              />
            </div>
          </div>
        ) : null}

        {tab === "pipeline" ? <Pipeline refreshToken={refreshToken} /> : null}

        {tab === "stats" ? <Stats refreshToken={refreshToken} /> : null}
      </div>
    </div>
  );
}
