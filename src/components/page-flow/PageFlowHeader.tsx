"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type PageCrumb = { label: string; href?: string };

type PageFlowHeaderProps = {
  crumbs: PageCrumb[];
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * Cabeçalho consistente entre telas: trilha (breadcrumb), título e ações à direita.
 */
export function PageFlowHeader({
  crumbs,
  title,
  description,
  actions,
}: PageFlowHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <nav
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-zinc-500"
          aria-label="Trilha de navegação"
        >
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 ? (
                <span className="text-zinc-300 select-none" aria-hidden>
                  /
                </span>
              ) : null}
              {c.href ? (
                <Link
                  href={c.href}
                  className="text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-sm"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="font-medium text-zinc-800">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">{actions}</div>
      ) : null}
    </div>
  );
}
