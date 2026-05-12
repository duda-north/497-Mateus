-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Venda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "administradoraId" TEXT NOT NULL,
    "planoId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorCentavos" INTEGER,
    "dataVenda" DATETIME,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Venda_administradoraId_fkey" FOREIGN KEY ("administradoraId") REFERENCES "Administradora" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venda_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "Plano" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Venda" ("administradoraId", "createdAt", "dataVenda", "descricao", "id", "observacoes", "status", "titulo", "updatedAt", "valorCentavos") SELECT "administradoraId", "createdAt", "dataVenda", "descricao", "id", "observacoes", "status", "titulo", "updatedAt", "valorCentavos" FROM "Venda";
DROP TABLE "Venda";
ALTER TABLE "new_Venda" RENAME TO "Venda";
CREATE INDEX "Venda_administradoraId_idx" ON "Venda"("administradoraId");
CREATE INDEX "Venda_planoId_idx" ON "Venda"("planoId");
CREATE INDEX "Venda_status_idx" ON "Venda"("status");
CREATE INDEX "Venda_createdAt_idx" ON "Venda"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
