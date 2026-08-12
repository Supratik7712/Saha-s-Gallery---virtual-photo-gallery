import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { site } from "@/lib/site";

const CURATOR_EMAIL = site.curatorEmail.toLowerCase();

function safeNext(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }
  return value;
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    const next = safeNext(search["next"]);
    return next ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: `Curator Sign In — ${site.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const goNext = () => {
    if (next) {
      window.location.href = next;
      return;
    }
    void navigate({ to: "/admin", replace: true });
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      if (data.user.email?.toLowerCase() === CURATOR_EMAIL) {
        goNext();
      } else {
        void supabase.auth.signOut();
      }
    });
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (email.trim().toLowerCase() !== CURATOR_EMAIL) {
      setError("This studio is restricted to the gallery curator.");
      return;
    }
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      goNext();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth${
        next ? `?next=${encodeURIComponent(next)}` : ""
      }`,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user?.email?.toLowerCase() !== CURATOR_EMAIL) {
      await supabase.auth.signOut();
      setError("This studio is restricted to the gallery curator.");
      setLoading(false);
      return;
    }
    goNext();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {site.name}
        </p>
        <h1 className="mt-4 text-center font-display text-4xl italic">Curator Access</h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          This studio is reserved for the gallery curator.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-input bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-input bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {notice ? <p className="text-sm text-accent">{notice}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {loading ? "One moment…" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => void handleGoogle()}
          disabled={loading}
          className="w-full border border-border py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Continue with Google
        </button>


        <Link
          to="/"
          className="mt-10 block text-center font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-accent"
        >
          ← Back to the gallery
        </Link>
      </div>
    </div>
  );
}

// trigger route regen
