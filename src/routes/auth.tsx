import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Área RH — HAVELAR Carreiras" },
      { name: "description", content: "Acesso restrito à equipa de Recursos Humanos da HAVELAR." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    const full_name = String(fd.get("full_name") || "");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/admin",
            data: { full_name },
          },
        });
        if (error) throw error;
        toast.success("Conta criada. Peça acesso admin ao Ricardo.");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/auth",
      });
      if (result.error) {
        toast.error(result.error.message || "Erro Google");
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro Google");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-brand">
          <div className="text-xs uppercase tracking-widest text-primary">Área privada</div>
          <h1 className="mt-2 text-2xl font-bold">Recursos Humanos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso reservado à equipa de RH da HAVELAR.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-secondary/80 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5.2c-2 1.5-4.5 2.4-7.1 2.4-5.4 0-9.9-3.1-11.4-7.5l-6.6 5.1C9.5 39.1 16.2 43.5 24 43.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.6 5.1l6.1 5.2c-.4.4 6.7-4.9 6.7-14.3 0-1.2-.1-2.4-.4-3.5z"
              />
            </svg>
            Entrar com Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-sm">Nome</label>
                <input
                  name="full_name"
                  required
                  className="mt-1 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="text-sm">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm">Palavra-passe</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-brand hover:brightness-110 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "Primeira vez? Criar conta"
              : "Já tens conta? Entrar"}
          </button>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
