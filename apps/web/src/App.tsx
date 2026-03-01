import { Login } from "./auth/Login";
import { useSession } from "./auth/useSession";
import { supabase } from "./lib/supabase";
import { Sourcing } from "./features/sourcing/Sourcing";

export default function App() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Signed in</div>
          <button
            className="text-xs font-medium text-slate-700 underline"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </button>
        </div>
      </div>

      <Sourcing />
    </div>
  );
}
