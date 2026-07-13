import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, MapPin, Briefcase } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getArea, jobsByArea, type Job } from "@/lib/jobs";

export const Route = createFileRoute("/vagas/$area")({
  loader: ({ params }) => {
    const area = getArea(params.area);
    if (!area) throw notFound();
    return { area, jobs: jobsByArea(area.id) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Vagas em ${loaderData.area.name} — Carreiras HAVELAR` },
          {
            name: "description",
            content: `${loaderData.jobs.length} vagas ativas em ${loaderData.area.name} na HAVELAR. Candidata-te agora.`,
          },
        ]
      : [],
  }),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">Erro: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Área não encontrada.</div>
  ),
  component: AreaPage,
});

function AreaPage() {
  const { area, jobs } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Todas as áreas
        </Link>

        <div className="mt-6 flex items-start gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
            {area.icon}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Área</div>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{area.name}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{area.description}</p>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          {jobs.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
              De momento não temos vagas ativas nesta área — mas envia-nos uma candidatura
              espontânea a{" "}
              <a href="mailto:recrutamento@havelar.com" className="text-primary underline">
                recrutamento@havelar.com
              </a>
              .
            </div>
          ) : (
            jobs.map((job: Job) => (
              <Link
                key={job.id}
                to="/candidatar/$jobId"
                params={{ jobId: job.id }}
                className="group flex items-center justify-between gap-6 rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-brand"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                      <Briefcase className="inline h-3 w-3 mr-1" />
                      {job.type}
                    </span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.location}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold group-hover:text-primary transition-colors">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
              </Link>
            ))
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
