import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Rocket, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-havelar.jpg";
import { AREAS, JOBS } from "@/lib/jobs";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Carreiras HAVELAR — Junta-te à revolução da impressão 3D" },
      {
        name: "description",
        content:
          "Escolhe a tua área de interesse e candidata-te às vagas ativas da HAVELAR: engenharia, arquitetura, produção e comercial.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader>
        <Link
          to="/auth"
          className="rounded-md border border-border/60 px-3 py-2 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
        >
          Área RH
        </Link>
      </SiteHeader>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pt-20 pb-24 lg:grid-cols-2 lg:pt-28 lg:pb-32 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
              <Sparkles className="h-3 w-3" /> Feira de Emprego · {JOBS.length} vagas ativas
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Constrói o <span className="text-gradient-brand">futuro da habitação</span>, camada
              a camada.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Na HAVELAR imprimimos casas em betão 3D. Estamos a recrutar em toda a operação —
              engenharia, arquitetura, materiais, produção e comercial. Escolhe a tua área e
              candidata-te em menos de 3 minutos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#areas"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-brand hover:brightness-110 transition"
              >
                Ver vagas por área <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://www.havelar.com/home-pt/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-5 py-3 text-sm font-medium hover:border-primary/60"
              >
                Conhecer a HAVELAR
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Vagas</dt>
                <dd className="mt-1 text-2xl font-semibold text-gradient-brand">{JOBS.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Áreas</dt>
                <dd className="mt-1 text-2xl font-semibold text-gradient-brand">{AREAS.length}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Formatos
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-gradient-brand">4</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-brand opacity-20 blur-3xl rounded-3xl" aria-hidden />
            <img
              src={heroImage}
              width={1920}
              height={1280}
              alt="Braço robótico da HAVELAR a imprimir uma casa em betão 3D ao pôr do sol"
              className="relative rounded-2xl border border-border/60 shadow-brand"
            />
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Rocket, title: "Emprego", desc: "Contrato de trabalho, full-time." },
            { icon: Layers, title: "Estágio Profissional", desc: "IEFP, 9 meses, remunerado." },
            {
              icon: Sparkles,
              title: "Estágio Curricular",
              desc: "Integrado no teu curso, com tutor Havelar.",
            },
            {
              icon: Rocket,
              title: "Estágio de Verão",
              desc: "8 semanas entre Junho e Setembro.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-semibold">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Areas */}
      <section id="areas" className="mx-auto max-w-7xl px-6 py-16 scroll-mt-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Passo 1</div>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Escolhe a tua área de interesse</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Cada área tem várias vagas ativas — desde estágios até posições permanentes.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => {
            const count = JOBS.filter((j) => j.area === area.id).length;
            return (
              <Link
                key={area.id}
                to="/vagas/$area"
                params={{ area: area.id }}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/60 hover:-translate-y-1 hover:shadow-brand"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-40" />
                <div className="relative">
                  <div className="text-3xl">{area.icon}</div>
                  <h3 className="mt-4 text-xl font-semibold">{area.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {count} {count === 1 ? "vaga" : "vagas"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary group-hover:gap-2 transition-all">
                      Ver vagas <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feira CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-background to-accent/10 p-10">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary">Feira de Emprego</div>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Conhece-nos ao vivo e envia a tua candidatura aqui.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Traz-nos o teu CV ou envia por este site — vamos rever todas as candidaturas
              recebidas durante a feira.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#areas"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-brand hover:brightness-110"
              >
                Candidatar-me agora <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
