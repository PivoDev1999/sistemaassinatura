# Sistema de Controle de Assinaturas

Trabalho da disciplina *Desenvolvimento de Sistemas Backend*: 1 serviço principal + 2 microsserviços ligados por um broker, mais um painel web.
**Fonte da verdade:** `docs/specs/sistema-assinaturas.md`. Leia antes de qualquer tarefa nova. O PDF original está em `docs/specs/original/`.

## Regras de ouro
1. **Contratos [SPEC] são intocáveis.** Rotas, nomes de campos e formatos de JSON seguem a spec ao pé da letra. Na dúvida, pergunte.
2. **Planeje antes de codar.** Em tarefas com mais de um arquivo, mostre o plano e espere minha aprovação.
3. **Toda decisão de arquitetura vira ADR** em `docs/adr/` (use `/adr`).
4. **Estou aprendendo:** ao terminar, explique em português o que foi feito e por quê, em poucas linhas.

## Idioma
- Converse em português.
- **Domínio em português**, igual à spec: `Assinatura`, `Aplicativo`, `fimVigencia`, `PoliticaRenovacao`.
- **Termos técnicos em inglês:** `Repository`, `UseCase`, `Controller`, `Module`.
- Commits em inglês, no padrão Conventional Commits (`feat(cadastramento): create subscription use case`).

## Stack
- **Monorepo:** pnpm workspaces. Node LTS. TypeScript `strict` em tudo.
- **Backend:** NestJS (3 apps), Prisma + PostgreSQL, RabbitMQ (broker), Redis (cache), Swagger.
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind.
- **Testes:** Jest + Supertest (backend), Vitest + Testing Library (frontend).
- **Infra local:** Docker Compose em Linux. Tudo sobe com `docker compose up -d`.
- Use sempre as versões estáveis atuais e fixe-as no `package.json` (sem `latest`, sem `^` em imagens Docker).

## Estrutura
```
apps/
  servico-cadastramento/        # /servcad/*  — banco CadastroGeral
  servico-pagamentos/           # /registrarpagamento — banco Pagamentos
  servico-assinaturas-validas/  # /assinvalidas/* — cache Redis, várias instâncias
  web/                          # painel Next.js
packages/
  contracts/                    # tipos compartilhados: DTOs dos endpoints e corpo dos eventos
docs/
  specs/  adr/  architecture/   # spec, decisões, diagramas C4 (Mermaid), AsyncAPI
docker-compose.yml  .env.example
```

## Clean Architecture (cada serviço NestJS)
```
src/
  domain/          # entidades, value objects, interfaces de repositório, políticas (Strategy)
  application/     # casos de uso (1 classe por caso de uso), portas, DTOs de entrada/saída
  infrastructure/  # Prisma, RabbitMQ, Redis, clientes HTTP — implementam as interfaces do domain/application
  presentation/    # controllers HTTP, consumidores de eventos, validação de entrada (class-validator)
  main.ts  app.module.ts
```
**Regra de dependência (obrigatória):**
- `domain/` não importa nada de `@nestjs/*`, Prisma, Redis ou RabbitMQ. É TypeScript puro.
- `application/` importa só de `domain/`.
- `infrastructure/` e `presentation/` dependem de `application/` e `domain/`, nunca o contrário.
- A ligação entre interface e implementação é feita só nos `*.module.ts`, com tokens de injeção.
- Controllers são finos: validam a entrada, chamam **um** caso de uso e mapeiam a saída para o contrato da spec.

## Regras de domínio que exigem atenção
- Status ATIVA/CANCELADA é **calculado** (`fimVigencia > hoje`), nunca armazenado.
- A política de renovação é a interface `PoliticaRenovacao` no domínio, com implementação escolhida por configuração (RN-04).
- Datas são dias de calendário no fuso `America/Sao_Paulo`. A data "hoje" vem de um `Clock` injetável, para os testes controlarem o tempo.
- Dinheiro em `Decimal` / `NUMERIC(12,2)`, nunca `number` em cálculo. No JSON sai como número.
- O cache do AssinaturasValidas guarda a `fimVigencia`, com TTL curto, e nunca um booleano (P-04, P-05).
- Cada serviço tem seu próprio banco e seu próprio `schema.prisma`. **Nunca** acesse o banco de outro serviço.

## Banco de dados
- Toda mudança de schema é uma migration do Prisma (`prisma migrate dev --name ...`). Nunca altere o banco à mão.
- O seed do Cadastramento cria ≥ 10 clientes, ≥ 5 aplicativos e ≥ 5 assinaturas (RNF-04) e pode rodar várias vezes (idempotente).

## Testes (proporcionais!)
- Domínio e casos de uso: testes unitários **sem banco**, com repositórios falsos em memória.
- Endpoints: testes e2e com Supertest cobrindo o contrato da spec.
- De 20 a 60 testes por serviço. Use `it.each` em vez de repetir casos. Nada de testes redundantes.
- Rode os testes do serviço alterado antes de dizer que terminou.

## Comandos
- Infra: `docker compose up -d` · Logs: `docker compose logs -f <serviço>`
- Dependências: `pnpm install`
- Rodar um serviço: `pnpm --filter <app> dev`
- Migrations: `pnpm --filter <app> exec prisma migrate dev --name <descricao>`
- Seed: `pnpm --filter servico-cadastramento exec prisma db seed`
- Testes: `pnpm --filter <app> test` · Lint: `pnpm lint`

## Segurança
- Nada de senha, token ou URL de banco no código: tudo vem do `.env`. Só o `.env.example` vai para o Git.
- Senha do usuário guardada com hash (bcrypt).
- Portas de Postgres, RabbitMQ e Redis publicadas só em `127.0.0.1`.

## Fluxo de trabalho
- Uma branch por feature (`feat/cadastramento-assinaturas`), merge na `main` depois do `/revisar`.
- Commits pequenos. Nunca `git push --force` nem comandos destrutivos sem me perguntar.
- Ao concluir algo, marque o item correspondente em `docs/ROADMAP.md`.
