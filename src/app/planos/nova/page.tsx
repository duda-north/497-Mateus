import Link from "next/link";
import { Suspense } from "react";
import { backLinkClass } from "@/components/page-flow/button-classes";
import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import NovoPlanoForm from "../ui/NovoPlanoForm";

function NovoPlanoFallback() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600">
      Carregando formulário…
    </div>
  );
}

export default function NovoPlanoPage() {
  return (
    <div className="space-y-6">
      <PageFlowHeader
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Planos", href: "/planos" },
          { label: "Novo" },
        ]}
        title="Novo plano"
        description="Vincule o plano a uma administradora e defina tipo de bem, crédito e regras em JSON (evoluímos para formulários estruturados depois)."
        actions={
          <Link href="/planos" className={backLinkClass()}>
            Voltar à lista
          </Link>
        }
      />

      <Suspense fallback={<NovoPlanoFallback />}>
        <NovoPlanoForm />
      </Suspense>
    </div>
  );
}
