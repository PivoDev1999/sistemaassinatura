# 0016. Prisma 7 com driver adapter, BigInt e cliente gerado fora do Git

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: ADR 0006, ADR 0011, ADR 0012, ADR 0014, RNF-01, RNF-04

## Contexto

O Cadastramento precisa de schema Prisma, migrations e seed. A spec define códigos como "inteiro longo" e custo como decimal. O Prisma 7 mudou o modelo de configuração em relação às versões antigas.

## Decisão

- **Prisma 7.10.1** (estável; a 8.x ainda é release candidate), com o generator `prisma-client` em ESM, gerando em `src/infrastructure/prisma/generated` (ignorado pelo Git; criado por `prisma generate`).
- **Driver adapter** `@prisma/adapter-pg`: o Prisma 7 não conecta sozinho. A URL do banco fica em `prisma.config.ts` (variável `CADASTRAMENTO_DATABASE_URL`), fora do `schema.prisma`.
- **Códigos como `BigInt` autoincrement** ("inteiro longo" da spec). O `BigInt` não serializa em JSON, então os controllers convertem para número ao mapear a saída.
- **Dinheiro** `Decimal(12,2)` (ADR 0006). **Datas** `@db.Date`, sem hora (ADR 0005). **Sem coluna de status** (ADR 0012).
- **Seed** com `upsert` por código fixo e depois `setval` nas sequences, para novos INSERTs não colidirem com os códigos do seed. Os dados são funções puras em `src/infrastructure/seed/seed-data.ts`, testáveis sem banco. O usuário e a senha (hash bcrypt) vêm do `.env`.
- **Postgres no Compose** em `127.0.0.1:5433` (a 5432 costuma estar ocupada por outros projetos), imagem `postgres:18.7-alpine` fixa.

## Alternativas consideradas

- **`Int` nos códigos:** estoura em 2,1 bilhões; foge do "inteiro longo" da spec. Descartada.
- **Cliente Prisma versionado no Git:** é código gerado, gera ruído e conflitos. Descartada.
- **Prisma 8 RC:** instável para um trabalho acadêmico. Descartada.

## Consequências

- Positivas: schema fiel à spec, seed repetível, nenhum segredo no repositório.
- Negativas: precisa rodar `pnpm --filter servico-cadastramento db:generate` após clonar e ao mudar o schema; conversão de `BigInt` nos controllers.
- Riscos aceitos: o `upsert` sobrescreve alterações manuais nos dados do seed.
