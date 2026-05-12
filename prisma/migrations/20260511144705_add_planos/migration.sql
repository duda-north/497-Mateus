-- CreateTable
CREATE TABLE "Plano" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "administradoraId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipoBem" TEXT NOT NULL,
    "valorCreditoCentavos" INTEGER,
    "regrasComissaoJson" TEXT,
    "regrasRecebimentoJson" TEXT,
    "regrasEstornoJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Plano_administradoraId_fkey" FOREIGN KEY ("administradoraId") REFERENCES "Administradora" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Plano_administradoraId_idx" ON "Plano"("administradoraId");

-- CreateIndex
CREATE INDEX "Plano_createdAt_idx" ON "Plano"("createdAt");
