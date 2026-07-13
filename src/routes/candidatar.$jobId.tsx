import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, FileUp, Loader2, MapPin, Briefcase } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getArea, getJob } from "@/lib/jobs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/candidatar/$jobId")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    const area = getArea(job.area);
    return { job, area };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Candidatar-me — ${loaderData.job.title} · HAVELAR` },
          {
            name: "description",
            content: `Envia a tua candidatura para ${loaderData.job.title} na HAVELAR.`,
          },
        ]
      : [],
  }),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">Erro: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Vaga não encontrada.</div>
  ),
  component: ApplyPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().email("Email inválido").max(200),
  phone: z.string().trim().min(6, "Telefone inválido").max(30),
  linkedin: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  education: z.string().trim().max(200).optional().or(z.literal("")),
  experience_years: z.string().max(50).optional().or(z.literal("")),
  cover_letter: z.string().max(3000).optional().or(z.literal("")),
});

const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function ApplyPage() {
  const { job, area } = Route.useLoaderData();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (!cvFile) {
      setErrors({ cv: "Anexa o teu CV." });
      return;
    }
    if (cvFile.size > MAX_CV_BYTES) {
      setErrors({ cv: "O CV é demasiado grande (máx 5 MB)." });
      return;
    }
    if (!ALLOWED_CV_TYPES.includes(cvFile.type) && !cvFile.name.match(/\.(pdf|docx?|)$/i)) {
      setErrors({ cv: "Formato inválido. Usa PDF ou Word." });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setErrors(errs);
      return;
    }
    const data = parsed.data;

    setSubmitting(true);
    try {
      const ext = cvFile.name.split(".").pop()?.toLowerCase() || "pdf";
      const safeName = data.full_name.replace(/[^\p{L}\p{N}]+/gu, "_").slice(0, 40);
      const cvPath = `incoming/${job.id}/${Date.now()}_${safeName}.${ext}`;

      const upload = await supabase.storage
        .from("cvs")
        .upload(cvPath, cvFile, { contentType: cvFile.type || undefined, upsert: false });
      if (upload.error) throw upload.error;

      const insert = await supabase.from("applications").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        linkedin: data.linkedin || null,
        city: data.city || null,
        education: data.education || null,
        experience_years: data.experience_years || null,
        cover_letter: data.cover_letter || null,
        area: job.area,
        job_id: job.id,
        job_title: job.title,
        job_type: job.type,
        cv_path: cvPath,
        cv_filename: cvFile.name,
      });
      if (insert.error) throw insert.error;

      setDone(true);
      toast.success("Candidatura enviada!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar candidatura.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 shadow-brand">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold">Candidatura recebida!</h1>
          <p className="mt-3 text-muted-foreground">
            Obrigado por te candidatares a <strong>{job.title}</strong>. O Ricardo Lemos, da equipa
            de Recursos Humanos, vai analisar o teu perfil e entrar em contacto contigo.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-brand hover:brightness-110"
            >
              Voltar ao início
            </button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-12">
        {area && (
          <Link
            to="/vagas/$area"
            params={{ area: area.id }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Vagas em {area.name}
          </Link>
        )}

        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              <Briefcase className="inline h-3 w-3 mr-1" />
              {job.type}
            </span>
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {job.location}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{job.title}</h1>
          <p className="mt-2 text-muted-foreground">{job.summary}</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">O que vais fazer</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                {job.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">O que procuramos</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
                {job.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">A tua candidatura</h2>
            <p className="text-sm text-muted-foreground">
              Todos os dados são confidenciais e apenas usados no processo de recrutamento.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo *" name="full_name" required error={errors.full_name} />
            <Field label="Email *" name="email" type="email" required error={errors.email} />
            <Field label="Telefone *" name="phone" type="tel" required error={errors.phone} />
            <Field label="Cidade" name="city" error={errors.city} />
            <Field
              label="Perfil LinkedIn (URL)"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              error={errors.linkedin}
            />
            <div>
              <label className="text-sm font-medium">Anos de experiência</label>
              <select
                name="experience_years"
                className="mt-1 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Seleciona…</option>
                <option>Estudante</option>
                <option>Sem experiência</option>
                <option>Menos de 1 ano</option>
                <option>1–3 anos</option>
                <option>3–5 anos</option>
                <option>5–10 anos</option>
                <option>Mais de 10 anos</option>
              </select>
            </div>
          </div>

          <Field
            label="Formação académica"
            name="education"
            placeholder="Ex: Mestrado em Eng. Mecânica — Univ. do Minho"
            error={errors.education}
          />

          <div>
            <label className="text-sm font-medium">Mensagem / carta de apresentação</label>
            <textarea
              name="cover_letter"
              rows={5}
              maxLength={3000}
              className="mt-1 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="Fala-nos um pouco de ti e porque queres juntar-te à HAVELAR."
            />
            {errors.cover_letter && (
              <p className="mt-1 text-xs text-destructive">{errors.cover_letter}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Currículo (PDF ou Word) *</label>
            <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input bg-input/20 px-4 py-4 text-sm hover:border-primary/60 transition-colors">
              <FileUp className="h-5 w-5 text-primary" />
              <span className="flex-1">
                {cvFile ? (
                  <>
                    <span className="font-medium">{cvFile.name}</span>{" "}
                    <span className="text-muted-foreground">
                      ({(cvFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Clica para anexar o teu CV</span>
                )}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {errors.cv && <p className="mt-1 text-xs text-destructive">{errors.cv}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Máximo 5 MB.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-brand hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> A enviar…
              </>
            ) : (
              "Enviar candidatura"
            )}
          </button>
        </form>
      </div>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-input bg-input/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
