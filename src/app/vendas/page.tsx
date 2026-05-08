import VendasClient from "./ui/VendasClient";

export default function VendasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-medium text-zinc-500">Operação</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Vendas</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Cadastre e acompanhe vendas por administradora.
          </p>
        </div>
      </div>

      <VendasClient />
    </div>
  );
}

