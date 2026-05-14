import { Suspense } from "react";
import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import PlanosClient from "./ui/PlanosClient";

function PlanosFallback() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
      Carregando planos…
    </div>
  );
}

export default function PlanosPage() {
  return (
    <div className="space-y-6">
      <PageFlowHeader
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Planos" },
        ]}
        title="Planos"
        description="Cadastre planos por administradora, com valor de crédito e regras de comissão, recebimento e estorno (JSON por enquanto). Você pode abrir esta página com ?administradoraId=… vindo da lista de administradoras."
      />

      <Suspense fallback={<PlanosFallback />}>
        <PlanosClient />
      </Suspense>
    </div>
  );
}
