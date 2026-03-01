import { useState } from "react";
import { supabase } from "../lib/supabase";

export function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Must be allowlisted in Supabase Auth -> URL Configuration
        emailRedirectTo: window.location.origin,
      },
    });

    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Reseller</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in with a magic link.</p>

        {sent ? (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            Check your email for the sign-in link.
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={sendMagicLink}>
            <label className="block">
              <div className="text-sm font-medium">Email</div>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              type="submit"
            >
              Send magic link
            </button>

            {error ? (
              <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
                {error}
              </div>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
