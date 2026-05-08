-- CreateTable
CREATE TABLE "Venda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "administradoraId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorCentavos" INTEGER,
    "dataVenda" DATETIME,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Venda_administradoraId_fkey" FOREIGN KEY ("administradoraId") REFERENCES "Administradora" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Venda_administradoraId_idx" ON "Venda"("administradoraId");

-- CreateIndex
CREATE INDEX "Venda_status_idx" ON "Venda"("status");

-- CreateIndex
CREATE INDEX "Venda_createdAt_idx" ON "Venda"("createdAt");
