# 0015. Health, Swagger, portas e toolchain

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: ADR 0009 (Clean Architecture), ADR 0010 (monorepo e `packages/contracts`), ADR 0014 (Docker Compose)

## Contexto

Os três serviços NestJS precisam de um endpoint de saúde, de documentação Swagger e de portas distintas para rodar juntos na máquina e no Docker Compose. As rotas de negócio são [SPEC] (`/servcad/*`, `/registrarpagamento`, `/assinvalidas/*`) e não podem ser alteradas. O painel Next.js usa a porta 3000. Além disso, a fundação dos apps exigiu escolher versões de ferramentas que nem sempre combinam entre si.

## Decisão

- `/health` e `/docs` (Swagger; JSON em `/docs-json`) ficam na raiz de cada serviço, fora dos prefixos [SPEC].
- Sem `setGlobalPrefix`. Em Pagamentos o prefixo é a própria rota `/registrarpagamento`.
- As portas vêm de variáveis de ambiente, sem valor fixo no código: `CADASTRAMENTO_PORT=3001`, `PAGAMENTOS_PORT=3002`, `ASSINATURAS_VALIDAS_PORT=3003`. Há um único `.env.example`, na raiz.
- `configurarApp(app)` fica em `presentation/` e é usada por `main.ts` e pelo teste e2e, para que os dois montem o app do mesmo jeito.
- `/health` devolve só `{ "status": "ok" }`. Sem `@nestjs/terminus` por ora; quando existirem banco, Redis e broker, passa a checar cada um.
- Toolchain fixada: Node 24.12.0, pnpm 10.27.0, Nest 12.5.1 e TypeScript 6.0.3. O TypeScript fica em 6.0.3 porque o ts-jest só aceita TS abaixo de 7, o typescript-eslint abaixo de 6.1 e o `@nestjs/swagger` 5.5 ou 6.
- O `tsconfig.base.json` usa `module: commonjs`, `moduleResolution: node10` e `ignoreDeprecations: "6.0"`.

## Alternativas consideradas

- **`/health` sob o prefixo de cada serviço:** misturaria rotas operacionais com rotas [SPEC] e, em Pagamentos, não haveria prefixo para usar. Descartada.
- **`@nestjs/terminus` desde já:** não há nada para checar ainda, e a dependência seria só cerimônia. Adiada.
- **Um `.env` por app:** repete variáveis comuns e dificulta o Compose. Descartada em favor de um `.env.example` na raiz.

## Consequências

- Positivas: rotas [SPEC] intactas; portas configuráveis sem editar código; o e2e testa o mesmo app que `main.ts` sobe.
- Negativas: `/health` ainda não prova que as dependências estão de pé.
- Dívida técnica da toolchain, com prazo:
  - `moduleResolution: node10` some no TypeScript 7. O `ignoreDeprecations: "6.0"` só adia o problema; migrar antes de subir para o TS 7.
  - O Nest 12 é ESM-only. O app roda em commonjs no Node 24 (require de ESM), mas o Jest precisa de `NODE_OPTIONS=--experimental-vm-modules`, que gera `ExperimentalWarning`. O e2e importa o `AppModule` com `import()` dinâmico depois de definir a variável de porta, porque o `ConfigModule` valida o ambiente ao ser importado. Revisitar se migrar para ESM ou Vitest.
- Duplicação conhecida: `configuracao.ts`, `configurar-app.ts`, `jest.config.ts` e o e2e são quase idênticos nos três apps. Extrair para um pacote próprio só se crescer. Não vai em `packages/contracts`, que a ADR 0010 limita a tipos.
- Riscos aceitos: o lint de dependência por pasta (`no-restricted-imports` em `domain/` e `application/`) ainda não é imposto. É um item separado do ROADMAP e deve ser feito antes do primeiro código de domínio.
