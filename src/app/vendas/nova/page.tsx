import Link from "next/link";
import { backLinkClass } from "@/components/page-flow/button-classes";
import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import NovaVendaForm from "../ui/NovaVendaForm";

export default function NovaVendaPage() {
  return (
    <div className="space-y-6">
      <PageFlowHeader
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Vendas", href: "/vendas" },
          { label: "Nova venda" },
        ]}
        title="Nova venda"
        description="Cadastre uma venda vinculada a uma administradora e, opcionalmente, a um plano já cadastrado."
        actions={
          <Link href="/vendas" className={backLinkClass()}>
            Voltar à lista
          </Link>
        }
      />

      <NovaVendaForm />
    </div>
  );
}
