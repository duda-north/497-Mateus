import { PageFlowHeader } from "@/components/page-flow/PageFlowHeader";
import AdministradorasClient from "./ui/AdministradorasClient";

export default function AdministradorasPage() {
  return (
    <div className="space-y-6">
      <PageFlowHeader
        crumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Administradoras" },
        ]}
        title="Administradoras"
        description="Cadastre administradoras parceiras com dados cadastrais e regras específicas por parceiro."
      />

      <AdministradorasClient />
    </div>
  );
}
