-- CreateTable
CREATE TABLE "Administradora" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "contatoPrincipal" TEXT,
    "enderecoLogradouro" TEXT,
    "enderecoNumero" TEXT,
    "enderecoComplemento" TEXT,
    "enderecoBairro" TEXT,
    "enderecoCidade" TEXT,
    "enderecoUf" TEXT,
    "enderecoCep" TEXT,
    "regrasOperacionaisJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Administradora_cnpj_key" ON "Administradora"("cnpj");
