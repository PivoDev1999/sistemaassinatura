-- CreateTable
CREATE TABLE "cliente" (
    "codigo" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "aplicativo" (
    "codigo" BIGSERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "custoMensal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "aplicativo_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "assinatura" (
    "codigo" BIGSERIAL NOT NULL,
    "codCli" BIGINT NOT NULL,
    "codApp" BIGINT NOT NULL,
    "inicioVigencia" DATE NOT NULL,
    "fimVigencia" DATE NOT NULL,

    CONSTRAINT "assinatura_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "usuario" (
    "usuario" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "aplicativo_nome_key" ON "aplicativo"("nome");

-- CreateIndex
CREATE INDEX "assinatura_codCli_idx" ON "assinatura"("codCli");

-- CreateIndex
CREATE INDEX "assinatura_codApp_idx" ON "assinatura"("codApp");

-- AddForeignKey
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_codCli_fkey" FOREIGN KEY ("codCli") REFERENCES "cliente"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinatura" ADD CONSTRAINT "assinatura_codApp_fkey" FOREIGN KEY ("codApp") REFERENCES "aplicativo"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
