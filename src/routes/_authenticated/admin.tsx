import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, LogOut, RefreshCw, Search, ShieldCheck, ShieldOff } from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-chrome";
import { AREAS, JOB_TYPES } from "@/lib/jobs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — HAVELAR Carreiras" }] }),
  component: AdminPage,
});

type Application = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin: string | null;
  city: string | null;
  education: string | null;
  experience_years: string | null;
  area: string;
  job_id: string;
  job_title: string;
  job_type: string;
  cover_letter: string | null;
  cv_path: string;
  cv_filename: string;
  status: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUserEmail(userData.user?.email || "");
      if (!userData.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      const admin = (roles || []).some((r: { role: string }) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await load();
      else setLoading(false);
    })();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Application[]) || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return items.filter((a) => {
      if (areaFilter && a.area !== areaFilter) return false;
      if (typeFilter && a.job_type !== typeFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          a.full_name.toLowerCase().includes(s) ||
          a.email.toLowerCase().includes(s) ||
          a.job_title.toLowerCase().includes(s) ||
          (a.city || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [items, q, areaFilter, typeFilter]);

  async function downloadCV(a: Application) {
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(a.cv_path, 60);
    if (error || !data) return toast.error("Erro a obter CV");
    window.open(data.signedUrl, "_blank");
  }

  function exportXlsx() {
    const rows = filtered.map((a) => ({
      "Data": new Date(a.created_at).toLocaleString("pt-PT"),
      "Nome": a.full_name,
      "Email": a.email,
      "Telefone": a.phone,
      "Cidade": a.city || "",
      "LinkedIn": a.linkedin || "",
      "Formação": a.education || "",
      "Experiência": a.experience_years || "",
      "Área": AREAS.find((x) => x.id === a.area)?.name || a.area,
      "Vaga": a.job_title,
      "Tipo": a.job_type,
      "Mensagem": a.cover_letter || "",
      "CV": a.cv_filename,
      "Estado": a.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 18 }, { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 30 },
      { wch: 28 }, { wch: 16 }, { wch: 22 }, { wch: 28 }, { wch: 20 }, { wch: 40 },
      { wch: 24 }, { wch: 12 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidaturas");
    XLSX.writeFile(wb, `havelar-candidaturas-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    if (selected?.id === id) setSelected({ ...selected, status });
    toast.success("Estado atualizado");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="p-16 text-center text-muted-foreground">A carregar…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-md p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Sem permissões</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A tua conta ({userEmail}) ainda não tem permissões de administrador. Pede ao Ricardo
            Lemos que ative o acesso para este email.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader>
        <span className="hidden text-xs text-muted-foreground sm:inline">{userEmail}</span>
        <button
          onClick={signOut}
          className="rounded-md border border-border/60 px-3 py-2 text-xs hover:border-primary/60"
        >
          <LogOut className="inline h-3 w-3 mr-1" /> Sair
        </button>
      </SiteHeader>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Painel RH
            </div>
            <h1 className="mt-1 text-3xl font-bold">Candidaturas recebidas</h1>
            <p className="text-sm text-muted-foreground">
              {items.length} candidaturas · {filtered.length} visíveis com os filtros atuais
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Atualizar
            </button>
            <button
              onClick={exportXlsx}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Exportar Excel
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar por nome, email, vaga…"
              className="w-full rounded-lg border border-input bg-input/40 pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-lg border border-input bg-input/40 px-3 py-2 text-sm"
          >
            <option value="">Todas as áreas</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-input bg-input/40 px-3 py-2 text-sm"
          >
            <option value="">Todos os formatos</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">A carregar candidaturas…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Sem candidaturas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Vaga</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Contacto</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr
                      key={a.id}
                      className="border-t border-border/60 hover:bg-secondary/30 cursor-pointer"
                      onClick={() => setSelected(a)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(a.created_at).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-4 py-3 font-medium">{a.full_name}</td>
                      <td className="px-4 py-3">{a.job_title}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {a.job_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div>{a.email}</div>
                        <div className="text-muted-foreground">{a.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadCV(a);
                          }}
                          className="rounded-md border border-border px-2 py-1 text-xs hover:border-primary/60"
                        >
                          <Download className="inline h-3 w-3 mr-1" /> CV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <div
            className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 mt-10 shadow-brand"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selected.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.job_title} · {selected.job_type}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-border px-3 py-1 text-sm"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Email" value={selected.email} />
              <Info label="Telefone" value={selected.phone} />
              <Info label="Cidade" value={selected.city} />
              <Info label="LinkedIn" value={selected.linkedin} link />
              <Info label="Formação" value={selected.education} />
              <Info label="Experiência" value={selected.experience_years} />
            </div>

            {selected.cover_letter && (
              <div className="mt-4">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Mensagem
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{selected.cover_letter}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                onClick={() => downloadCV(selected)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
              >
                <Download className="h-4 w-4" /> Descarregar CV
              </button>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value)}
                className="rounded-lg border border-input bg-input/40 px-3 py-2 text-sm"
              >
                <option value="novo">Novo</option>
                <option value="em análise">Em análise</option>
                <option value="entrevista">Entrevista</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, link }: { label: string; value: string | null; link?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5">
        {value ? (
          link ? (
            <a href={value} target="_blank" rel="noreferrer" className="text-primary underline">
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}
