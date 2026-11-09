import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { signIn, signOut, checkIsAdmin } from "@/lib/authService";

type Status = "checking" | "denied" | "allowed";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    setStatus((await checkIsAdmin()) ? "allowed" : "denied");
  }

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      await refresh();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "checking") {
    return <div className="py-24 text-center text-sm text-muted-foreground">Checking access…</div>;
  }

  if (status === "denied") {
    return (
      <div className="max-w-sm mx-auto py-20 px-4">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Admin Sign In</h1>
        <p className="text-sm text-muted-foreground mb-6">Store management is restricted to admin accounts.</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Email</label>
            <input
              required type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase mb-1 block text-muted-foreground">Password</label>
            <input
              required type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl text-lg focus:outline-none focus:border-primary"
            />
          </div>
          {authError && <p className="text-sm text-red-600">{authError}</p>}
          <button
            type="submit" disabled={submitting}
            className="w-full py-3 bg-primary text-white text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-4 lg:px-8 pt-4">
        <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
          Sign out of admin
        </button>
      </div>
      {children}
    </div>
  );
}