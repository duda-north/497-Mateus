"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/administradoras", label: "Administradoras" },
  { href: "/planos", label: "Planos" },
  { href: "/vendas", label: "Vendas" },
];

function isNavActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = isNavActive(pathname, href);

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      <span>{label}</span>
    </Link>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white p-5 md:block">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900 text-white">
              GO
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Gestão Operacional</div>
              <div className="text-xs text-zinc-500">Consórcio</div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600">
            Administradoras, planos e vendas integrados na base operacional.
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 md:hidden"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-nav"
                  aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? (
                    <span className="text-lg leading-none" aria-hidden>
                      ×
                    </span>
                  ) : (
                    <span className="flex flex-col gap-1.5" aria-hidden>
                      <span className="h-0.5 w-5 rounded-full bg-zinc-800" />
                      <span className="h-0.5 w-5 rounded-full bg-zinc-800" />
                      <span className="h-0.5 w-5 rounded-full bg-zinc-800" />
                    </span>
                  )}
                </button>
                <div className="min-w-0 text-sm font-medium text-zinc-700">
                  Sistema de Gestão Operacional
                </div>
              </div>
              <div className="shrink-0 text-xs text-zinc-500">Admin</div>
            </div>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-40 md:hidden" id="mobile-nav">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Fechar menu"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute left-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col border-r border-zinc-200 bg-white p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-900 text-white">
                    GO
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">Gestão Operacional</div>
                    <div className="text-xs text-zinc-500">Consórcio</div>
                  </div>
                </div>
                <nav className="mt-6 flex flex-col space-y-1">
                  {nav.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={[
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
                          active
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
                        ].join(" ")}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          ) : null}

          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
