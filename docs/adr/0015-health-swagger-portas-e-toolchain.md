# 0015. Health, Swagger, portas e toolchain

- Status: Aceita
- Data: 2026-11-16
- Relacionado a: ADR 0009 (Clean Architecture), ADR 0010 (monorepo e `packages/contracts`), ADR 0014 (Docker Compose)

## Contexto

Os três serviços NestJS precisam de um endpoint de saúde, de documentação Swagger e de portas distintas para rodar juntos na máquina e no Docker Compose. As rotas de negócio são [SPEC] (`/servcad/*`, `/registrarpagamento`, `/assinvalidas/*`) e não podem ser alteradas. O painel Next.js usa a porta 3000. Além disso, a fundação dos apps exigiu escolher versões de ferramentas que nem sempre combinam entre si. O Nest 12 é ESM-only, e isso definiu o formato de módulos e o runner de testes.

## Decisão

- `/health` e `/docs` (Swagger; JSON em `/docs-json`) ficam na raiz de cada serviço, fora dos prefixos [SPEC].
- Sem `setGlobalPrefix`. Em Pagamentos o prefixo é a própria rota `/registrarpagamento`.
- As portas vêm de variáveis de ambiente, sem valor fixo no código: `CADASTRAMENTO_PORT=3001`, `PAGAMENTOS_PORT=3002`, `ASSINATURAS_VALIDAS_PORT=3003`. Há um único `.env.example`, na raiz.
- `configurarApp(app)` fica em `presentation/` e é usada por `main.ts` e pelo teste e2e, para que os dois montem o app do mesmo jeito.
- `/health` devolve só `{ "status": "ok" }`. Sem `@nestjs/terminus` por ora; quando existirem banco, Redis e broker, passa a checar cada um.
- Toolchain fixada: Node 24.12.0, pnpm 10.27.0, Nest 12.5.1 e TypeScript 6.0.3. O TypeScript fica em 6.0.3 porque o typescript-eslint só aceita TS abaixo de 6.1 e o `@nestjs/swagger` 5.5 ou 6. O ts-jest deixou de ser restrição ao sair o Jest.
- ESM completo nos três apps: `"type": "module"` em cada `package.json`, `module` e `moduleResolution` `nodenext` no `tsconfig.base.json`, sem `ignoreDeprecations`. Imports relativos levam extensão `.js`.
- Testes do backend com Vitest 5.1.0 (script `vitest run`), com `unplugin-swc` 2.0.0 e `@swc/core` 1.16.22 no `vitest.config.ts` para emitir decorators e `emitDecoratorMetadata`, que o esbuild do Vite não emite e o Nest usa na injeção de dependência. Sem `--experimental-vm-modules` e sem `ExperimentalWarning`. Cada app tem 2 e2e (`/health` e `/docs-json`).
- O e2e importa o `AppModule` com `import()` dinâmico dentro do `beforeAll`. Em ESM os imports estáticos rodam antes do `beforeAll`, e o `ConfigModule` valida a porta ao importar o módulo.

## Alternativas consideradas

- **`/health` sob o prefixo de cada serviço:** misturaria rotas operacionais com rotas [SPEC] e, em Pagamentos, não haveria prefixo para usar. Descartada.
- **`@nestjs/terminus` desde já:** não há nada para checar ainda, e a dependência seria só cerimônia. Adiada.
- **Um `.env` por app:** repete variáveis comuns e dificulta o Compose. Descartada em favor de um `.env.example` na raiz.
- **Jest com `--experimental-vm-modules`:** funciona com ESM, mas o suporte é experimental, gera `ExperimentalWarning` e exige `NODE_OPTIONS` em todo script. O Vitest é o padrão do Nest 12 para ESM. Descartada.
- **Ficar em CommonJS com `moduleResolution: node10` e `ignoreDeprecations: "6.0"`:** o `node10` some no TypeScript 7, então o `ignoreDeprecations` só adia o problema, e o app rodaria em CommonJS embora o Nest 12 seja ESM-only. Descartada.

## Consequências

- Positivas: rotas [SPEC] intactas; portas configuráveis sem editar código; o e2e testa o mesmo app que `main.ts` sobe; toolchain alinhada ao Nest 12 e ao TypeScript 7, sem flags experimentais.
- Negativas: `/health` ainda não prova que as dependências estão de pé. Todo import relativo precisa da extensão `.js`.
- Decisão adiada (duplicação de config): `configuracao.ts`, `configurar-app.ts`, `vitest.config.ts` e o e2e são quase idênticos nos três apps. Destino: um pacote `packages/config`, na "parte A" do plano. Não vai em `packages/contracts`, que o ADR 0010 limita a tipos.
- Ponto ainda não exercitado: o `decoratorMetadata` via swc não foi coberto por teste, porque o health não tem injeção de dependência. Cobrir no primeiro caso de uso com DI.
- Riscos aceitos: o lint de dependência por pasta (`no-restricted-imports` em `domain/` e `application/`) ainda não é imposto. É um item separado do ROADMAP e deve ser feito antes do primeiro código de domínio.
