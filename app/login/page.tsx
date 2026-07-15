"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";
import GoogleButton from "@/components/auth/GoogleButton";
import { LangSwitch, useLang } from "@/lib/i18n";

type Mode = "login" | "signup";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/espace";
  const [lang] = useLang();
  const en = lang === "en";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Si la confirmation par email est désactivée, la session est créée direct.
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setMessage(
            en
              ? "Account created! Check your inbox to confirm your address."
              : "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : en
            ? "Something went wrong."
            : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grain relative flex min-h-screen items-center justify-center bg-grad-warm px-5 py-10">
      <div className="absolute right-5 top-5">
        <LangSwitch />
      </div>
      <div className="w-full max-w-sm rounded-5xl bg-paper/80 p-8 shadow-soft ring-1 ring-clay-200/60 backdrop-blur-sm">
        <a href="/" className="mb-7 block text-center font-display text-2xl text-ink">
          {siteConfig.name}
        </a>

        <h1 className="mb-1 text-center font-display text-3xl text-ink">
          {mode === "login" ? (en ? "Welcome back" : "Bon retour") : en ? "Create your account" : "Crée ton compte"}
        </h1>
        <p className="mb-7 text-center text-sm text-cocoa-600">
          {mode === "login"
            ? en
              ? "Sign in to get back to your program."
              : "Connecte-toi pour retrouver ton programme."
            : en
              ? "To follow your routine, day after day."
              : "Pour suivre ta routine jour après jour."}
        </p>

        <GoogleButton next={next} onError={setError} />

        <div className="my-5 flex items-center gap-3 text-xs text-cocoa-500">
          <span className="h-px flex-1 bg-clay-200" />
          {en ? "or" : "ou"}
          <span className="h-px flex-1 bg-clay-200" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            autoComplete="email"
            placeholder={en ? "Your email" : "Ton email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-clay-200 bg-cream px-4 py-3 text-ink outline-none transition focus:border-clay-400"
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={en ? "Password (6 characters min.)" : "Mot de passe (6 caractères min.)"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-clay-200 bg-cream px-4 py-3 text-ink outline-none transition focus:border-clay-400"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-ink py-3 font-medium text-cream transition hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? en
                ? "One moment…"
                : "Un instant…"
              : mode === "login"
                ? en
                  ? "Sign in"
                  : "Se connecter"
                : en
                  ? "Create my account"
                  : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          {mode === "login"
            ? en
              ? "No account yet?"
              : "Pas encore de compte ?"
            : en
              ? "Already have an account?"
              : "Déjà un compte ?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            className="font-medium text-ink underline underline-offset-4"
          >
            {mode === "login" ? (en ? "Sign up" : "S'inscrire") : en ? "Sign in" : "Se connecter"}
          </button>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
