import PlanosClient from "./ui/PlanosClient";

export default function PlanosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm font-medium text-zinc-500">Base operacional</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Planos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Cadastre planos comercializados por administradora, com valor de crédito e
            regras de comissão, recebimento e estorno (JSON por enquanto).
          </p>
        </div>
      </div>

      <PlanosClient />
    </div>
  );
}
