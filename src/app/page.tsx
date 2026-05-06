export default function Home() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-medium text-zinc-500">
          Visão geral operacional
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight">
          Dashboard
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Aqui você vai acompanhar os indicadores do dia, pendências e atalhos
          para cadastros (ex.: administradoras, vendas, comissões e relatórios).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-medium text-zinc-500">
            Administradoras
          </div>
          <div className="mt-2 text-2xl font-semibold">0</div>
          <div className="mt-1 text-sm text-zinc-600">
            Cadastre parceiros para parametrização por regra.
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-medium text-zinc-500">Vendas</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
          <div className="mt-1 text-sm text-zinc-600">
            Próximo módulo após a base operacional.
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-medium text-zinc-500">Comissões</div>
          <div className="mt-2 text-2xl font-semibold">—</div>
          <div className="mt-1 text-sm text-zinc-600">
            Regras por administradora e relatórios.
          </div>
        </div>
      </div>
    </div>
  );
}
