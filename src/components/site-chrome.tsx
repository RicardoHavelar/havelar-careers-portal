import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logoAsset from "@/assets/havelar-logo.png.asset.json";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Havelar" className="h-7 w-auto" />
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-l border-border/60 pl-3">
            Carreiras
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <a
            href="https://www.havelar.com/home-pt/"
            target="_blank"
            rel="noreferrer"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:inline-flex px-3 py-2"
          >
            Site principal ↗
          </a>
          {children}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 grid gap-6 md:grid-cols-3 text-sm text-muted-foreground">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-brand text-primary-foreground font-bold text-xs">
              H
            </div>
            <span className="font-semibold text-foreground">HAVELAR</span>
          </div>
          <p className="mt-3 max-w-xs">
            Impressão 3D de habitação. Construímos o futuro, uma camada de betão de cada vez.
          </p>
        </div>
        <div>
          <div className="font-medium text-foreground">Recrutamento</div>
          <p className="mt-2">Ricardo Lemos — Gestor de Recursos Humanos</p>
          <a
            href="mailto:recrutamento@havelar.com"
            className="mt-1 inline-block text-primary hover:underline"
          >
            recrutamento@havelar.com
          </a>
        </div>
        <div>
          <div className="font-medium text-foreground">Links</div>
          <div className="mt-2 flex flex-col gap-1">
            <a
              href="https://www.havelar.com/home-pt/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              havelar.com
            </a>
            <Link to="/" className="hover:text-foreground">
              Ver vagas
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HAVELAR. Todos os direitos reservados.
      </div>
    </footer>
  );
}
