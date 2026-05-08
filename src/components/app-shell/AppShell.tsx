"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/administradoras", label: "Administradoras" },
  { href: "/vendas", label: "Vendas" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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
            Base pronta para evoluir para vendas, comissões e relatórios.
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-4 md:px-6">
              <div className="text-sm font-medium text-zinc-700">
                Sistema de Gestão Operacional
              </div>
              <div className="text-xs text-zinc-500">Admin</div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

